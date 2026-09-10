const { db } = require("../../../lib/firebaseAdmin");
const { sendMail } = require("../../../lib/mail/sendMail");
import { invoiceReminderTemplate } from "../../../lib/mail/templates";
const { z } = require("zod");
const { verifyAdminFromRequest } = require("../../../lib/verifyAdminRequest");
const { setPrivateResponseHeaders } = require("../../../lib/apiSecurity");

const reminderSchema = z.object({
  invoiceId: z.string().trim().min(1).max(128),
});

export const config = { api: { bodyParser: { sizeLimit: "16kb" } } };

export default async function handler(req, res) {
  setPrivateResponseHeaders(res);
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    await verifyAdminFromRequest(req);
    const parsed = reminderSchema.safeParse(req.body || {});
    if (!parsed.success)
      return res.status(400).json({ error: "Invalid reminder request" });
    const { invoiceId } = parsed.data;

    const invoiceSnap = await db.collection("invoices").doc(invoiceId).get();
    if (!invoiceSnap.exists)
      return res.status(404).json({ error: "Invoice not found" });

    const invoice = invoiceSnap.data();

    // Resolve client: prefer invoice.clientId, else try project -> clientId
    let client = null;
    let clientId = invoice.clientId;
    if (!clientId && invoice.projectId) {
      try {
        const projSnap = await db
          .collection("projects")
          .doc(invoice.projectId)
          .get();
        if (projSnap.exists) {
          const proj = projSnap.data();
          clientId = proj.clientId || clientId;
        }
      } catch (e) {
        console.warn("Could not fetch project to resolve clientId:", e);
      }
    }

    if (clientId) {
      try {
        const clientSnap = await db.collection("users").doc(clientId).get();
        if (clientSnap.exists) client = clientSnap.data();
      } catch (e) {
        console.warn("Could not fetch client user doc:", e);
      }
    }

    // fallback to invoice-stored email
    const to = client?.email || invoice.clientEmail || invoice.email;
    if (!to)
      return res
        .status(400)
        .json({
          error:
            "No recipient email available for this invoice (no client found and no invoice email)",
        });

    const { subject, html } = invoiceReminderTemplate({ invoice, client });
    const { wrapWithEmailWrapper } = await import(
      "../../../lib/mail/templates"
    );
    const wrapped = wrapWithEmailWrapper(html, {
      preheader: `Invoice ${invoice.number || invoice.id} reminder`,
    });
    await sendMail({ to, subject, html: wrapped });

    return res.status(200).json({ ok: true });
  } catch (err) {
    if (err?.status)
      return res.status(err.status).json({ error: err.message });
    console.error("Invoice reminder error:", err?.message || err);
    return res.status(500).json({ error: "Unable to send invoice reminder" });
  }
}
