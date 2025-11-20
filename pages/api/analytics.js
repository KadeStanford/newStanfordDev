import { getStats } from "../../lib/analyticsStore";

export default function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ message: "Method not allowed" });

  // In future: if POSTHOG_API_KEY is provided, proxy query to PostHog and merge results
  const stats = getStats();
  return res.status(200).json(stats);
}
