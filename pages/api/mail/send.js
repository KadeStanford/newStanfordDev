import { sendMail } from "../../../lib/mail/sendMail";
import { wrapWithEmailWrapper } from "../../../lib/mail/templates";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { to, subject, text, html, from } = req.body;
    if (!to) return res.status(400).json({ error: "Missing 'to' address" });

    const wrappedHtml = html ? wrapWithEmailWrapper(html, { preheader: (text || '').slice(0, 120) }) : undefined;
    const result = await sendMail({ to, subject, text, html: wrappedHtml, from });
    return res.status(200).json({ ok: true, result });
  } catch (err) {
    console.error("Mail send error:", err);
    return res.status(500).json({ error: err.message || 'Mail error', raw: err.raw || null });
  }
}
