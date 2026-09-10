import { recordHeartbeat } from "../../lib/analyticsStore";
const { z } = require("zod");
const {
  getClientAddress,
  hashIdentifier,
  setPrivateResponseHeaders,
} = require("../../lib/apiSecurity");

const heartbeatSchema = z.object({
  path: z.string().max(2048).optional(),
});

export const config = { api: { bodyParser: { sizeLimit: "8kb" } } };

export default function handler(req, res) {
  setPrivateResponseHeaders(res);
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  const parsed = heartbeatSchema.safeParse(req.body || {});
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid heartbeat" });

  const visitorHash = hashIdentifier(getClientAddress(req), "heartbeat");
  recordHeartbeat({
    path: parsed.data.path || "/",
    visitorHash,
    ts: Date.now(),
  });

  return res.status(200).json({ ok: true });
}
