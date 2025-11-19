export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const data = req.body || {};

  // Build a styled HTML summary of the incoming data
  const buildHtml = (payload) => {
    const escape = (str) => {
      if (str === undefined || str === null) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    };

    const now = new Date().toLocaleString();

    const type = escape(payload.type || "contact");
    const name = escape(payload.fullName || payload.name || "—");
    const email = escape(payload.email || "—");
    const company = escape(payload.company || "—");
    const projectType = escape(payload.projectType || "—");
    const budget = escape(payload.formattedBudget || payload.budget || "—");
    const timeline = escape(payload.timeline || "—");
    const preferred = escape(payload.preferredContact || "—");
    const message = escape(
      payload.message || payload.description || payload.notes || ""
    );

    const inspiration = escape(payload.inspirationLinks || "");
    const competitors = escape(payload.competitorLinks || "");

    // Assets / readiness flags
    const assets = [
      payload.hasBranding && "Branding",
      payload.hasContent && "Content",
      payload.hasImages && "Images",
      payload.needsCMS && "CMS",
      payload.hasDomain && "Domain",
      payload.hasHosting && "Hosting",
    ]
      .filter(Boolean)
      .join(", ");

    // Color palette rendering
    let colorHtml = "<span style='color:#94a3b8;font-style:italic'>None</span>";
    if (Array.isArray(payload.colorPalette) && payload.colorPalette.length) {
      colorHtml = payload.colorPalette
        .map((c) => {
          const safe = escape(c);
          return `
            <span style="display:inline-block;margin-right:6px;vertical-align:middle">
              <span style="display:inline-block;width:18px;height:18px;border-radius:4px;border:1px solid #ddd;background:${safe};vertical-align:middle;margin-right:6px"></span>
              <span style="font-family:monospace;font-size:13px;color:#111">${safe}</span>
            </span>`;
        })
        .join("");
    }

    // Attachments list (names only)
    let attachmentsHtml = "None";
    if (Array.isArray(payload.attachments) && payload.attachments.length) {
      attachmentsHtml = payload.attachments
        .map((a) => escape(a.name || a))
        .join(", ");
    }

    return `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color:#0f172a; background:#f8fafc; padding:20px;">
        <div style="max-width:700px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e6edf3">
          <div style="background:linear-gradient(90deg,#7c3aed,#06b6d4);padding:18px 20px;color:#fff">
            <h1 style="margin:0;font-size:18px;font-weight:700">New ${
              type === "general" ? "General Message" : "Project Request"
            }</h1>
            <div style="margin-top:6px;font-size:13px;opacity:0.95">Received: ${now}</div>
          </div>

          <div style="padding:18px 20px;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;color:#0f172a">
              <tbody>
                <tr>
                  <td style="width:160px;padding:8px 0;font-weight:600;color:#475569">Name</td>
                  <td style="padding:8px 0">${name}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:600;color:#475569">Email</td>
                  <td style="padding:8px 0"><a href="mailto:${email}" style="color:#0ea5e9;text-decoration:none">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:600;color:#475569">Company</td>
                  <td style="padding:8px 0">${company}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:600;color:#475569">Project Type</td>
                  <td style="padding:8px 0">${projectType}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:600;color:#475569">Budget</td>
                  <td style="padding:8px 0">${budget}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:600;color:#475569">Timeline</td>
                  <td style="padding:8px 0">${timeline}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:600;color:#475569">Preferred Contact</td>
                  <td style="padding:8px 0">${preferred}</td>
                </tr>
              </tbody>
            </table>

            <div style="margin-top:14px;padding-top:14px;border-top:1px solid #eef2f7">
              <h3 style="margin:0 0 8px 0;font-size:13px;color:#0f172a">Message</h3>
              <div style="font-size:14px;color:#334155;line-height:1.5;white-space:pre-wrap">${
                message ||
                '<span style="color:#94a3b8">(No message provided)</span>'
              }</div>
            </div>

            <div style="margin-top:14px;display:flex;gap:24px;flex-wrap:wrap">
              <div style="flex:1;min-width:220px">
                <h4 style="margin:6px 0;font-size:13px;color:#0f172a">Assets / Readiness</h4>
                <div style="color:#334155">${
                  assets || '<span style="color:#94a3b8">None listed</span>'
                }</div>
              </div>

              <div style="flex:1;min-width:220px">
                <h4 style="margin:6px 0;font-size:13px;color:#0f172a">Color Palette</h4>
                <div style="display:flex;flex-wrap:wrap;gap:8px">${colorHtml}</div>
              </div>
            </div>

            ${
              inspiration || competitors
                ? `
              <div style="margin-top:14px;padding-top:14px;border-top:1px solid #eef2f7">
                ${
                  inspiration
                    ? `<div style="margin-bottom:8px"><strong style="color:#475569">Inspiration:</strong> <span style="color:#334155">${inspiration}</span></div>`
                    : ""
                }
                ${
                  competitors
                    ? `<div><strong style="color:#475569">Competitors:</strong> <span style="color:#334155">${competitors}</span></div>`
                    : ""
                }
              </div>
            `
                : ""
            }

            <div style="margin-top:18px;padding-top:12px;border-top:1px dashed #e6edf3;font-size:12px;color:#64748b">
              <div><strong>Attachments:</strong> ${attachmentsHtml}</div>
            </div>

          </div>

          <div style="background:#f1f5f9;padding:12px 20px;font-size:12px;color:#64748b;text-align:center">
            This message was sent from your website contact form.
          </div>
        </div>
      </div>
    `;
  };

  const nodemailer = require("nodemailer");

  // Read SMTP configuration from environment variables for security
  const SMTP_HOST = process.env.SMTP_HOST;
  const SMTP_PORT = process.env.SMTP_PORT
    ? parseInt(process.env.SMTP_PORT, 10)
    : undefined;
  const SMTP_SECURE = process.env.SMTP_SECURE === "true"; // true or false
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;
  const CONTACT_RECEIVER =
    process.env.CONTACT_RECEIVER || "stanforddevcontact@gmail.com";

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.error("Missing SMTP configuration in environment variables");
    return res.status(500).json({ message: "Email server is not configured" });
  }

  try {
    // Safe debug: log presence of SMTP config (do NOT log actual secret values)
    console.log("SMTP config presence:", {
      host: !!SMTP_HOST,
      port: !!SMTP_PORT,
      secure: !!process.env.SMTP_SECURE,
      user: !!SMTP_USER,
    });

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const html = buildHtml(data);

    const fromAddress = data.email ? `${data.email}` : SMTP_USER;

    await transporter.sendMail({
      from: fromAddress,
      to: CONTACT_RECEIVER,
      subject: data.subject || `Website contact — ${data.type || "submission"}`,
      html,
    });

    return res.status(200).json({ message: "Message sent successfully" });
  } catch (err) {
    console.error("Error sending email:", err && err.message ? err.message : err);
    // If DEBUG_EMAIL=true in environment, return the error message in the response for debugging
    const debug = process.env.DEBUG_EMAIL === "true";
    return res.status(500).json({
      message: "Failed to send message",
      ...(debug ? { error: err && err.message ? String(err.message) : String(err) } : {}),
    });
  }
}
