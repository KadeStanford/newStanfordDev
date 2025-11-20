import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { sendMail } from "../../../lib/mail/sendMail";

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { subject, html } = req.body;
    if (!subject || !html) return res.status(400).json({ error: "Missing subject or html body" });

    // Fetch all users ordered by email (similar to admin UI fetch)
    const q = query(collection(db, "users"), orderBy("email"));
    const snap = await getDocs(q);
    const recipients = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() || {}) }))
      .filter((u) => u?.email && u.role !== "admin");

    if (recipients.length === 0) return res.status(200).json({ ok: true, sent: 0 });

    // Batch sends in small chunks to avoid rate limits
    const batches = chunkArray(recipients, 20);
    let sent = 0;
    const failed = [];

    for (const batch of batches) {
      // parallelize per-batch but keep batches sequential
      // wrap html once per send target (optionally include personalized preheader)
      const results = await Promise.allSettled(
        batch.map((r) => {
          const { wrapWithEmailWrapper } = require("../../../lib/mail/templates");
          const preheader = `Hello ${r.name || ''}`.trim();
          const wrapped = wrapWithEmailWrapper(html, { preheader });
          return sendMail({ to: r.email, subject, html: wrapped });
        })
      );
      results.forEach((resItem, idx) => {
        const to = batch[idx].email;
        if (resItem.status === "fulfilled") {
          sent += 1;
        } else {
          console.error("Failed sending to", to, resItem.reason?.message || resItem.reason);
          failed.push({ to, error: String(resItem.reason?.message || resItem.reason) });
        }
      });
      // small pause between batches could be added here if needed
    }

    return res.status(200).json({ ok: true, sent, failed });
  } catch (err) {
    console.error("Broadcast error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
