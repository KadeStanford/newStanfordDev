const { db } = require("../../../lib/firebaseAdmin");
const { sendMail } = require("../../../lib/mail/sendMail");
const { z } = require("zod");
const { verifyAdminFromRequest } = require("../../../lib/verifyAdminRequest");
const { setPrivateResponseHeaders } = require("../../../lib/apiSecurity");

const broadcastSchema = z.object({
  subject: z.string().trim().min(1).max(200),
  html: z.string().trim().min(1).max(200_000),
});

export const config = { api: { bodyParser: { sizeLimit: "256kb" } } };

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default async function handler(req, res) {
  setPrivateResponseHeaders(res);
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    await verifyAdminFromRequest(req);
    if (process.env.ENABLE_ADMIN_BROADCASTS !== "true") {
      return res.status(503).json({
        error:
          "Broadcast email is disabled until consent and unsubscribe handling are configured",
      });
    }
    const parsed = broadcastSchema.safeParse(req.body || {});
    if (!parsed.success)
      return res.status(400).json({ error: "Invalid broadcast request" });
    const { subject, html } = parsed.data;

    // Fetch all users ordered by email (similar to admin UI fetch)
    const snap = await db.collection("users").orderBy("email").get();
    const recipients = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() || {}) }))
      .filter((u) => u?.email && u.role !== "admin");

    if (recipients.length === 0)
      return res.status(200).json({ ok: true, sent: 0 });

    // Batch sends in small chunks to avoid rate limits
    const batches = chunkArray(recipients, 20);
    let sent = 0;
    const failed = [];

    for (const batch of batches) {
      // parallelize per-batch but keep batches sequential
      // wrap html once per send target (optionally include personalized preheader)
      const results = await Promise.allSettled(
        batch.map((r) => {
          const {
            wrapWithEmailWrapper,
          } = require("../../../lib/mail/templates");
          const preheader = `Hello ${r.name || ""}`.trim();
          const wrapped = wrapWithEmailWrapper(html, { preheader });
          return sendMail({ to: r.email, subject, html: wrapped });
        })
      );
      results.forEach((resItem, idx) => {
        const to = batch[idx].email;
        if (resItem.status === "fulfilled") {
          sent += 1;
        } else {
          console.error(
            "Failed sending to",
            to,
            resItem.reason?.message || resItem.reason
          );
          failed.push({
            to,
            error: String(resItem.reason?.message || resItem.reason),
          });
        }
      });
      // small pause between batches could be added here if needed
    }

    return res.status(200).json({ ok: true, sent, failed });
  } catch (err) {
    if (err?.status)
      return res.status(err.status).json({ error: err.message });
    console.error("Broadcast error:", err?.message || err);
    return res.status(500).json({ error: "Unable to send broadcast" });
  }
}
