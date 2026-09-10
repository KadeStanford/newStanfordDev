// Enhanced contact API: validation, durable abuse controls, reCAPTCHA verification,
// and Handlebars email templating.
const { z } = require("zod");
const { renderContactEmail } = require("../../lib/emailTemplates");
const { sendMail } = require("../../lib/mail/sendMail");
const { db } = require("../../lib/firebaseAdmin");
const {
  consumeRateLimit,
  setPrivateResponseHeaders,
} = require("../../lib/apiSecurity");

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = Math.max(
  1,
  Math.min(25, parseInt(process.env.CONTACT_RATE_LIMIT || "5", 10) || 5)
);

const optionalText = (max) => z.string().trim().max(max).optional().nullable();

const contactSchema = z.object({
  type: z.enum(["general", "project"]).optional(),
  fullName: z.string().trim().min(1, "Full name is required").max(120),
  name: optionalText(120),
  email: z
    .union([z.literal(""), z.string().trim().email("Invalid email address").max(320)])
    .optional(),
  phone: optionalText(50),
  website: optionalText(2048),
  company: optionalText(160),
  message: z.string().trim().min(1, "Message is required").max(5000),
  notes: optionalText(5000),
  projectType: optionalText(80),
  formattedBudget: optionalText(80),
  budget: z.union([z.string().max(80), z.number().finite()]).optional(),
  timeline: optionalText(160),
  pages: z.union([z.string().max(40), z.number().int().min(0).max(1000)]).optional(),
  goals: z.array(z.string().max(160)).max(20).optional(),
  inspirationLinks: optionalText(5000),
  inspirationNotes: optionalText(5000),
  competitorLinks: optionalText(5000),
  hasBranding: z.boolean().optional(),
  hasContent: z.boolean().optional(),
  hasImages: z.boolean().optional(),
  needsCMS: z.boolean().optional(),
  hasDomain: z.boolean().optional(),
  hasHosting: z.boolean().optional(),
  preferredContact: z.enum(["email", "phone"]).optional(),
  colorPalette: z.array(z.string().regex(/^#[0-9a-fA-F]{6}$/)).max(12).optional(),
  attachments: z.array(z.object({ name: z.string().max(255) }).passthrough()).max(5).optional(),
  recaptchaToken: z.string().max(4096).optional(),
}).refine((data) => Boolean(data.email || data.phone), {
  message: "Email or phone is required",
  path: ["email"],
});

export const config = { api: { bodyParser: { sizeLimit: "64kb" } } };

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

function isLocalDevelopmentRequest(req) {
  if (process.env.NODE_ENV !== "development") return false;
  const hostname = String(req.headers.host || "")
    .split(":")[0]
    .toLowerCase();
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export default async function handler(req, res) {
  setPrivateResponseHeaders(res);
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method Not Allowed" });
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

  if (!isLocalDevelopmentRequest(req)) {
    try {
      const limit = await consumeRateLimit({
        db,
        req,
        scope: "contact",
        max: RATE_LIMIT_MAX,
        windowMs: RATE_LIMIT_WINDOW_MS,
      });
      if (!limit.allowed) {
        res.setHeader("Retry-After", String(limit.retryAfterSeconds));
        return res
          .status(429)
          .json({ message: "Too many requests. Try again later." });
      }
    } catch (error) {
      console.error("Contact rate limit error:", error?.message || error);
      return res.status(503).json({ message: "Contact service unavailable" });
    }
  }

  // Verify reCAPTCHA if token is provided (recommended)
  if (process.env.RECAPTCHA_SECRET && !isLocalDevelopmentRequest(req)) {
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
  }\nPhone: ${data.phone || ""}\nWebsite: ${
    data.website || ""
  }\nProject Type: ${data.projectType || ""}\nBudget: ${
    data.formattedBudget || data.budget || ""
  }\nTimeline: ${data.timeline || ""}\nPages: ${
    data.pages || ""
  }\nPreferred Contact: ${data.preferredContact || ""}\n\nMessage:\n${
    data.message || data.notes || ""
  }`;

  const CONTACT_RECEIVER =
    process.env.CONTACT_RECEIVER || "stanforddevcontact@gmail.com";

  try {
    await sendMail({
      to: CONTACT_RECEIVER,
      replyTo: data.email || undefined,
      subject: `Website contact — ${data.type || "submission"}`,
      html,
      text,
    });
    return res.status(200).json({ message: "Message sent successfully" });
  } catch (err) {
    console.error("Mailgun error:", err?.cause || err?.message || err);
    return res.status(500).json({ message: "Failed to send message" });
  }
}
