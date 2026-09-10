// Server-side API route to fetch GA4 data using a service account and
// write an aggregated document into Firestore at `analytics/{projectId}`.

const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const { z } = require("zod");
const { db, admin } = require("../../../lib/firebaseAdmin");
const {
  secretsMatch,
  setPrivateResponseHeaders,
} = require("../../../lib/apiSecurity");
const {
  parseGaServiceAccountFromEnv,
  rangeToStartDate,
  fetchGaAnalyticsBundle,
} = require("../../../lib/ga4ReportsCore");

const reportSchema = z.object({
  projectId: z.string().trim().min(1).max(128),
  range: z.enum(["7d", "30d", "90d"]).default("7d"),
});

export const config = { api: { bodyParser: { sizeLimit: "16kb" } } };

export default async function handler(req, res) {
  setPrivateResponseHeaders(res);
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const input = req.method === "POST" ? req.body || {} : req.query || {};
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success)
    return res.status(400).json({ error: "Invalid analytics report request" });
  const { projectId, range } = parsed.data;

  const startDate = rangeToStartDate(range);

  const secret = req.headers["x-api-key"];
  let authorized = false;
  if (process.env.GA_API_SECRET && secretsMatch(secret, process.env.GA_API_SECRET)) {
    authorized = true;
  }

  if (!authorized) {
    const authHeader = req.headers["authorization"] || "";
    if (authHeader.toLowerCase().startsWith("bearer ")) {
      const idToken = authHeader.split(" ")[1];
      try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        const projSnap = await db.doc(`projects/${projectId}`).get();
        if (projSnap.exists && projSnap.data().clientId === decoded.uid) {
          authorized = true;
        }
      } catch (e) {
        console.warn("GA report authorization failed");
      }
    }
  }

  if (!authorized) {
    return res
      .status(401)
      .json({ error: "Unauthorized" });
  }

  const projectRef = db.collection("projects").doc(projectId);
  const projectSnap = await projectRef.get();

  if (!projectSnap.exists) {
    return res.status(404).json({ error: "Project not found" });
  }

  const projectData = projectSnap.data();
  const GA_PROPERTY_ID = projectData.gaPropertyId;

  if (!GA_PROPERTY_ID) {
    return res.status(400).json({
      error:
        "Analytics Configuration Missing: This project does not have a GA4 Property ID set in the admin panel.",
    });
  }

  const { sa, error: parseErr } = parseGaServiceAccountFromEnv();
  if (parseErr || !sa) {
    return res.status(500).json({
      error: parseErr || "GA service account not configured on server",
    });
  }

  if (sa.private_key) sa.private_key = sa.private_key.replace(/\\n/g, "\n");

  const client = new BetaAnalyticsDataClient({ credentials: sa });

  try {
    const { analyticsDoc, dailyCounts } = await fetchGaAnalyticsBundle(
      client,
      GA_PROPERTY_ID,
      startDate,
      range,
      { topPagesLimit: 6, referrersLimit: 6 }
    );

    if (range === "7d") {
      await db.doc(`analytics/${projectId}`).set(analyticsDoc, { merge: true });
      await db
        .doc(`analytics/${projectId}/stats/events_summary`)
        .set({ counts: dailyCounts, updatedAt: new Date() }, { merge: true });
    }

    return res.status(200).json({
      ok: true,
      analyticsDoc: { ...analyticsDoc, dailyCounts },
    });
  } catch (err) {
    console.error("GA fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch GA data" });
  }
}
