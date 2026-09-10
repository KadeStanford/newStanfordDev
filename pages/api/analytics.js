import { getStats } from "../../lib/analyticsStore";
const { verifyAdminFromRequest } = require("../../lib/verifyAdminRequest");
const { setPrivateResponseHeaders } = require("../../lib/apiSecurity");

export default async function handler(req, res) {
  setPrivateResponseHeaders(res);
  if (req.method !== "GET")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    await verifyAdminFromRequest(req);
    return res.status(200).json(getStats());
  } catch (error) {
    return res
      .status(error?.status || 401)
      .json({ error: error?.message || "Unauthorized" });
  }
}
