import { recordHeartbeat } from "../../lib/analyticsStore";

export default function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  const { path } = req.body || {};
  const ip =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
  const ua = req.headers["user-agent"] || "unknown";
  recordHeartbeat({ path: path || "/", ua, ip, ts: Date.now() });

  return res.status(200).json({ ok: true });
}
