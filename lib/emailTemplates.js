const Handlebars = require("handlebars");

const templateSource = `
<div style="font-family: Arial, sans-serif; color:#0f172a; background:#f8fafc; padding:20px;">
  <div style="max-width:720px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e6edf3">
    <div style="background:linear-gradient(90deg,#2563eb,#7c3aed);padding:18px 20px;color:#fff">
      <h1 style="margin:0;font-size:18px;font-weight:700">New {{#if isProject}}Project Request{{else}}Message{{/if}}</h1>
      <div style="margin-top:6px;font-size:13px;opacity:0.95">Received: {{receivedAt}}</div>
    </div>

    <div style="padding:18px 20px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#0f172a">
        <tbody>
          <tr>
            <td style="width:170px;padding:8px 0;font-weight:600;color:#475569">Name</td>
            <td style="padding:8px 0">{{escape fullName}}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:600;color:#475569">Email</td>
            <td style="padding:8px 0"><a href="mailto:{{email}}" style="color:#0ea5e9;text-decoration:none">{{escape email}}</a></td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:600;color:#475569">Phone</td>
            <td style="padding:8px 0">{{escape phone}}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:600;color:#475569">Company</td>
            <td style="padding:8px 0">{{escape company}}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:600;color:#475569">Current Website</td>
            <td style="padding:8px 0">{{escape website}}</td>
          </tr>
          {{#if isProject}}
          <tr>
            <td style="padding:8px 0;font-weight:600;color:#475569">Project Type</td>
            <td style="padding:8px 0">{{escape projectType}}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:600;color:#475569">Budget</td>
            <td style="padding:8px 0">{{escape formattedBudget}}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:600;color:#475569">Timeline</td>
            <td style="padding:8px 0">{{escape timeline}}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:600;color:#475569">Pages</td>
            <td style="padding:8px 0">{{escape pages}}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:600;color:#475569">Preferred Contact</td>
            <td style="padding:8px 0">{{escape preferredContact}}</td>
          </tr>
          {{/if}}
        </tbody>
      </table>

      <div style="margin-top:14px;padding-top:14px;border-top:1px solid #eef2f7">
        <h3 style="margin:0 0 8px 0;font-size:13px;color:#0f172a">Message</h3>
        <div style="font-size:14px;color:#334155;line-height:1.5;white-space:pre-wrap">{{#if message}}{{escape message}}{{else}}<span style="color:#94a3b8">(No message provided)</span>{{/if}}</div>
      </div>

      {{#if isProject}}
      <div style="margin-top:14px;padding-top:14px;border-top:1px solid #eef2f7">
        <h3 style="margin:0 0 8px 0;font-size:13px;color:#0f172a">Project Details</h3>
        <div style="font-size:14px;color:#334155;line-height:1.6">
          <div><strong>Inspiration:</strong> {{escape inspirationLinks}}</div>
          <div><strong>Competitors:</strong> {{escape competitorLinks}}</div>
          <div><strong>Inspiration notes:</strong> {{escape inspirationNotes}}</div>
          <div><strong>Ready now:</strong> {{escape readiness}}</div>
          <div><strong>Color palette:</strong> {{escape colorPaletteText}}</div>
        </div>
      </div>
      {{/if}}

      {{#if attachments.length}}
      <div style="margin-top:18px;padding-top:12px;border-top:1px dashed #e6edf3;font-size:12px;color:#64748b">
        <div><strong>Attachments:</strong> {{attachments}}</div>
      </div>
      {{/if}}
    </div>

    <div style="background:#f1f5f9;padding:12px 20px;font-size:12px;color:#64748b;text-align:center">
      This message was sent from your website contact form.
    </div>
  </div>
</div>
`;

Handlebars.registerHelper("escape", function (str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
});

const template = Handlebars.compile(templateSource);

function renderContactEmail(payload = {}) {
  const readiness =
    [
      payload.hasBranding && "Logo / branding",
      payload.hasContent && "Text content",
      payload.hasImages && "Images / photos",
      payload.needsCMS && "Needs CMS",
      payload.hasDomain && "Domain purchased",
      payload.hasHosting && "Hosting purchased",
    ]
      .filter(Boolean)
      .join(", ") || "Not specified";

  const colorPalette = Array.isArray(payload.colorPalette)
    ? payload.colorPalette
    : [];

  const data = {
    receivedAt: new Date().toLocaleString(),
    isProject: payload.type === "project",
    fullName: payload.fullName || payload.name || "-",
    email: payload.email || "-",
    phone: payload.phone || "-",
    company: payload.company || "-",
    website: payload.website || "-",
    projectType: payload.projectType || "-",
    formattedBudget: payload.formattedBudget || payload.budget || "-",
    timeline: payload.timeline || "-",
    pages: payload.pages || "-",
    preferredContact: payload.preferredContact || "-",
    inspirationLinks: payload.inspirationLinks || "-",
    competitorLinks: payload.competitorLinks || "-",
    inspirationNotes: payload.inspirationNotes || "-",
    readiness,
    colorPaletteText: colorPalette.join(", ") || "-",
    message: payload.message || payload.notes || "",
    attachments: Array.isArray(payload.attachments)
      ? payload.attachments.map((a) => a.name || a).join(", ")
      : "",
  };

  return template(data);
}

module.exports = { renderContactEmail };
