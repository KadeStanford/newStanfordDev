const { admin, db } = require("./firebaseAdmin");

/**
 * @param {import("http").IncomingMessage} req
 * @returns {Promise<{ uid: string, email?: string }>}
 */
async function verifyAdminFromRequest(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    const e = new Error("Missing Authorization bearer token");
    e.status = 401;
    throw e;
  }
  const idToken = authHeader.split(/\s+/)[1];
  if (!idToken) {
    const e = new Error("Invalid token");
    e.status = 401;
    throw e;
  }

  let decoded;
  try {
    decoded = await admin.auth().verifyIdToken(idToken);
  } catch {
    const e = new Error("Invalid or expired token");
    e.status = 401;
    throw e;
  }

  const snap = await db.collection("users").doc(decoded.uid).get();
  const role = snap.exists ? snap.data().role : null;
  if (role !== "admin") {
    const e = new Error("Admin access required");
    e.status = 403;
    throw e;
  }

  return { uid: decoded.uid, email: decoded.email };
}

module.exports = { verifyAdminFromRequest };
