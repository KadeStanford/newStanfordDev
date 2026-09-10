const { z } = require("zod");
const { FieldValue } = require("firebase-admin/firestore");
const { db } = require("../../lib/firebaseAdmin");
const { verifyUserFromRequest } = require("../../lib/verifyAdminRequest");
const {
  consumeRateLimit,
  setPrivateResponseHeaders,
} = require("../../lib/apiSecurity");

const testimonialSchema = z.object({
  name: z.string().trim().min(1).max(120),
  company: z.string().trim().max(120).optional().nullable(),
  message: z.string().trim().min(1).max(4000),
  rating: z.number().int().min(1).max(5),
});

export const config = { api: { bodyParser: { sizeLimit: "16kb" } } };

export default async function handler(req, res) {
  setPrivateResponseHeaders(res);
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await verifyUserFromRequest(req);
    const parsed = testimonialSchema.safeParse(req.body || {});
    if (!parsed.success)
      return res.status(400).json({ error: "Invalid testimonial" });

    const limit = await consumeRateLimit({
      db,
      req,
      scope: "testimonial",
      identifier: user.uid,
      max: 3,
      windowMs: 24 * 60 * 60 * 1000,
    });
    if (!limit.allowed) {
      res.setHeader("Retry-After", String(limit.retryAfterSeconds));
      return res.status(429).json({ error: "Testimonial limit reached" });
    }

    const data = parsed.data;
    await db.collection("testimonials").add({
      name: data.name,
      company: data.company || null,
      message: data.message,
      rating: data.rating,
      approved: false,
      featured: false,
      displayOrder: 0,
      submittedBy: user.uid,
      createdAt: FieldValue.serverTimestamp(),
    });

    return res.status(201).json({ ok: true });
  } catch (error) {
    if (error?.status)
      return res.status(error.status).json({ error: error.message });
    console.error("Testimonial submission error:", error?.message || error);
    return res.status(500).json({ error: "Unable to submit testimonial" });
  }
}
