// Enhanced contact API: validation (zod), simple IP rate limiter, reCAPTCHA verification,
// and Handlebars email templating.
const { z } = require("zod");
const { renderContactEmail } = require("../../lib/emailTemplates");

// Simple in-memory rate limiter (per-IP). For production use Redis or other durable store.
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = parseInt(process.env.CONTACT_RATE_LIMIT || "5", 10); // default 5 per window
const ipMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = ipMap.get(ip) || [];
  // keep only timestamps within window
  const recent = entry.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  ipMap.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX;
}

const contactSchema = z.object({
  type: z.enum(["general", "project"]).optional(),
  fullName: z.string().min(1, "Full name is required"),
  name: z.string().optional(),
  email: z.string().email("Invalid email address"),
  company: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  projectType: z.string().optional(),
  formattedBudget: z.string().optional(),
  budget: z.any().optional(),
  timeline: z.string().optional(),
  inspirationLinks: z.string().optional(),
  competitorLinks: z.string().optional(),
  colorPalette: z.array(z.string()).optional(),
  attachments: z.array(z.any()).optional(),
  recaptchaToken: z.string().optional(),
});

async function verifyRecaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET;
  if (!secret || !token) return false;
  const params = new URLSearchParams();
  params.append("secret", secret);
  params.append("response", token);
  try {
    const resp = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        body: params,
      }
    );
    const json = await resp.json();
    return json.success === true && (json.score ? json.score >= 0.3 : true);
  } catch (e) {
    console.error(
      "reCAPTCHA verification error:",
      e && e.message ? e.message : e
    );
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const ip =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress || "unknown";
  if (isRateLimited(ip)) {
    return res
      .status(429)
      .json({ message: "Too many requests. Try again later." });
  }

  const raw = req.body || {};

  // Validate shape
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Validation failed", errors: parsed.error.format() });
  }

  const data = parsed.data;

  // Verify reCAPTCHA if token is provided (recommended)
  if (process.env.RECAPTCHA_SECRET) {
    const ok = await verifyRecaptcha(data.recaptchaToken);
    if (!ok) {
      return res.status(400).json({ message: "reCAPTCHA verification failed" });
    }
  }

  // Compose HTML via template
  const html = renderContactEmail(data);

  // Plain text fallback
  const text = `New message (${data.type || "contact"})\n\nName: ${
    data.fullName || ""
  }\nEmail: ${data.email || ""}\nCompany: ${
    data.company || ""
  }\nProject Type: ${data.projectType || ""}\nBudget: ${
    data.formattedBudget || data.budget || ""
  }\nTimeline: ${data.timeline || ""}\n\nMessage:\n${
    data.message || data.notes || ""
  }`;

  // Email configuration
  const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
  const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
  const MAILGUN_BASE_URL =
    process.env.MAILGUN_BASE_URL || "https://api.mailgun.net";
  const MAILGUN_FROM = process.env.MAILGUN_FROM;

  const SMTP_HOST = process.env.SMTP_HOST;
  const SMTP_PORT = process.env.SMTP_PORT
    ? parseInt(process.env.SMTP_PORT, 10)
    : undefined;
  const SMTP_SECURE = process.env.SMTP_SECURE === "true";
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;
  const CONTACT_RECEIVER =
    process.env.CONTACT_RECEIVER || "stanforddevcontact@gmail.com";

  // Prefer Mailgun if configured
  if (MAILGUN_API_KEY && MAILGUN_DOMAIN) {
    try {
      const FormData = require("form-data");
      const Mailgun = require("mailgun.js");
      const mailgun = new Mailgun(FormData);
      const mg = mailgun.client({
        username: "api",
        key: MAILGUN_API_KEY,
        url: MAILGUN_BASE_URL,
      });
      const fromAddress =
        MAILGUN_FROM || data.email || SMTP_USER || `no-reply@${MAILGUN_DOMAIN}`;
      const message = {
        from: fromAddress,
        to: CONTACT_RECEIVER,
        subject:
          data.subject || `Website contact — ${data.type || "submission"}`,
        text,
        html,
      };
      await mg.messages.create(MAILGUN_DOMAIN, message);
      return res
        .status(200)
        .json({ message: "Message sent successfully (Mailgun)" });
    } catch (err) {
      console.error("Mailgun error:", err && err.message ? err.message : err);
      const debug = process.env.DEBUG_EMAIL === "true";
      return res.status(500).json({
        message: "Failed to send message (Mailgun)",
        ...(debug
          ? { error: err && err.message ? String(err.message) : String(err) }
          : {}),
      });
    }
  }

  // Fallback to SMTP
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.error(
      "Missing Mailgun and SMTP configuration in environment variables."
    );
    return res.status(500).json({
      message:
        "Email server is not configured. Configure MAILGUN_API_KEY & MAILGUN_DOMAIN or SMTP_* vars.",
    });
  }

  try {
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const fromAddress = data.email ? `${data.email}` : SMTP_USER;
    await transporter.sendMail({
      from: fromAddress,
      to: CONTACT_RECEIVER,
      subject: data.subject || `Website contact — ${data.type || "submission"}`,
      html,
      text,
    });
    return res
      .status(200)
      .json({ message: "Message sent successfully (SMTP)" });
  } catch (err) {
    console.error(
      "Error sending email (SMTP):",
      err && err.message ? err.message : err
    );
    const debug = process.env.DEBUG_EMAIL === "true";
    return res.status(500).json({
      message: "Failed to send message (SMTP)",
      ...(debug
        ? { error: err && err.message ? String(err.message) : String(err) }
        : {}),
    });
  }
}
