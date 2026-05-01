const { db } = require("../../../lib/firebaseAdmin");
const { sendMail } = require("../../../lib/mail/sendMail");
import { invoiceReminderTemplate } from "../../../lib/mail/templates";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { invoiceId } = req.body;
    if (!invoiceId) return res.status(400).json({ error: "Missing invoiceId" });

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
    const result = await sendMail({ to, subject, html: wrapped });

    return res.status(200).json({ ok: true, result });
  } catch (err) {
    console.error("Invoice reminder error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
