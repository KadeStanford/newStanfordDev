import { sendMail } from "../../../lib/mail/sendMail";
import { wrapWithEmailWrapper } from "../../../lib/mail/templates";
const { z } = require("zod");
const { verifyAdminFromRequest } = require("../../../lib/verifyAdminRequest");
const { setPrivateResponseHeaders } = require("../../../lib/apiSecurity");

const sendSchema = z
  .object({
    to: z.string().email().max(320),
    subject: z.string().trim().min(1).max(200),
    text: z.string().max(100_000).optional(),
    html: z.string().max(200_000).optional(),
  })
  .refine((value) => value.text || value.html, {
    message: "A text or HTML message body is required",
  });

export const config = { api: { bodyParser: { sizeLimit: "256kb" } } };

export default async function handler(req, res) {
  setPrivateResponseHeaders(res);
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    await verifyAdminFromRequest(req);
    const parsed = sendSchema.safeParse(req.body || {});
    if (!parsed.success)
      return res.status(400).json({ error: "Invalid email request" });

    const { to, subject, text, html } = parsed.data;

    const wrappedHtml = html
      ? wrapWithEmailWrapper(html, { preheader: (text || "").slice(0, 120) })
      : undefined;
    await sendMail({ to, subject, text, html: wrappedHtml });
    return res.status(200).json({ ok: true });
  } catch (err) {
    if (err?.status)
      return res.status(err.status).json({ error: err.message });
    console.error("Mail send error:", err?.message || err);
    return res.status(500).json({ error: "Unable to send email" });
  }
}
