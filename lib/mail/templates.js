export function invoiceReminderTemplate({ invoice, client }) {
  const number = invoice.number || invoice.id || "#";
  const due = invoice.dueDate || invoice.due || "(no due date)";
  const rawAmount = invoice.total ?? invoice.amount ?? null;
  const amount = rawAmount != null ? (typeof rawAmount === 'number' ? `$${Number(rawAmount).toLocaleString()}` : `$${rawAmount}`) : "(amount)";

  const subject = `Invoice Reminder: ${number} — Due ${due}`;

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111">
      <h2>Invoice Reminder</h2>
      <p>Hi ${client?.name || client?.email || "there"},</p>
      <p>This is a friendly reminder that invoice <strong>${number}</strong> for <strong>${amount}</strong> is due on <strong>${due}</strong>.</p>
      <p>If you've already paid, thank you — please ignore this message. Otherwise please follow the link to view and pay the invoice.</p>
      <p style="margin-top:18px">Thanks,<br/>StanfordDev</p>
    </div>
  `;

  return { subject, html };
}

export const presets = {
  genericAnnouncement: ({ siteName = "StanfordDev" } = {}) => ({
    subject: `${siteName} — Announcement`,
    html: `<div><h2>${siteName} Announcement</h2><p>Hi —</p><p>We wanted to let you know about an update. Reply to this email if you have questions.</p><p>Thanks,<br/>${siteName}</p></div>`,
  }),
  maintenanceNotice: ({ siteName = "StanfordDev" } = {}) => ({
    subject: `${siteName} — Scheduled Maintenance`,
    html: `<div><h2>Scheduled Maintenance</h2><p>We'll be performing scheduled maintenance on our services. We expect brief downtime. Thanks for your patience.</p></div>`,
  }),
};

export function wrapWithEmailWrapper(innerHtml, opts = {}) {
  const siteName = process.env.MAIL_SITE_NAME || "StanfordDev";
  const preheader = opts.preheader || "";
  const unsubscribeUrl = opts.unsubscribeUrl || "";

  const footerUnsub = unsubscribeUrl
    ? `<p style="font-size:12px;color:#888;margin:12px 0">If you no longer wish to receive these emails, <a href="${unsubscribeUrl}">unsubscribe</a>.</p>`
    : "";

  return `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
  </head>
  <body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#111">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:24px 12px">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 6px 18px rgba(2,6,23,0.08)">
            <tr>
              <td style="padding:20px 24px;background:linear-gradient(90deg,#0ea5e9,#7c3aed);color:#fff">
                <h1 style="margin:0;font-size:18px">${siteName}</h1>
                ${preheader ? `<div style="margin-top:6px;font-size:13px;opacity:0.95">${preheader}</div>` : ""}
              </td>
            </tr>
            <tr>
              <td style="padding:24px">
                <div style="color:#111;line-height:1.5;font-size:15px">
                  ${innerHtml}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;background:#fafafa;color:#666;font-size:13px">
                <div>${siteName} • <span style="opacity:0.8">You received this email because you're a registered client.</span></div>
                ${footerUnsub}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}
