const { FieldValue } = require("firebase-admin/firestore");
const { db } = require("../../lib/firebaseAdmin");
const { z } = require("zod");
const {
  consumeRateLimit,
  jsonSize,
  secretsMatch,
  setPrivateResponseHeaders,
} = require("../../lib/apiSecurity");

const trackSchema = z.object({
  projectId: z.string().trim().regex(/^[A-Za-z0-9_-]{1,128}$/),
  path: z.string().max(2048).optional(),
  referrer: z.string().max(2048).optional(),
  extra: z.object({}).passthrough().optional(),
});

function sanitizeReferrer(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "";
  }
}

export const config = { api: { bodyParser: { sizeLimit: "16kb" } } };

export default async function handler(req, res) {
  setPrivateResponseHeaders(res);
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const expectedSecret = process.env.TRACK_API_SECRET;
    const providedSecret = req.headers["x-api-key"];
    if (!expectedSecret)
      return res.status(503).json({ error: "Tracking ingestion is disabled" });
    if (!secretsMatch(providedSecret, expectedSecret))
      return res.status(401).json({ error: "Unauthorized" });

    const parsed = trackSchema.safeParse(req.body || {});
    if (!parsed.success)
      return res.status(400).json({ error: "Invalid analytics event" });
    if (jsonSize(parsed.data.extra || {}) > 4096)
      return res.status(400).json({ error: "Analytics metadata is too large" });

    const limit = await consumeRateLimit({
      db,
      req,
      scope: "analytics_ingest",
      max: 120,
      windowMs: 60 * 60 * 1000,
    });
    if (!limit.allowed) {
      res.setHeader("Retry-After", String(limit.retryAfterSeconds));
      return res.status(429).json({ error: "Too many analytics events" });
    }

    const {
      projectId,
      path = "/",
      referrer = "",
      extra = {},
    } = parsed.data;
    const project = await db.collection("projects").doc(projectId).get();
    if (!project.exists)
      return res.status(404).json({ error: "Project not found" });

    await db
      .collection("analytics")
      .doc(projectId)
      .collection("events")
      .add({
        path,
        referrer: sanitizeReferrer(referrer),
        extra,
        createdAt: FieldValue.serverTimestamp(),
      });

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("/api/track error", err?.message || err);
    return res.status(500).json({ error: "Internal error" });
  }
}
