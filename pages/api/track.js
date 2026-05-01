const { FieldValue } = require("firebase-admin/firestore");
const { db } = require("../../lib/firebaseAdmin");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      projectId,
      path = "/",
      referrer = "",
      userAgent = "",
      extra = {},
    } = req.body || {};
    if (!projectId) return res.status(400).json({ error: "Missing projectId" });

    await db
      .collection("analytics")
      .doc(projectId)
      .collection("events")
      .add({
        path,
        referrer,
        userAgent,
        extra,
        createdAt: FieldValue.serverTimestamp(),
      });

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("/api/track error", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
