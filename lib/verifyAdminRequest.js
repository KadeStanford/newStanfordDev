const { admin, db } = require("./firebaseAdmin");

function getBearerToken(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) return null;
  return authHeader.split(/\s+/)[1] || null;
}

async function verifyUserToken(idToken) {
  if (!idToken || typeof idToken !== "string") {
    const error = new Error("Authentication required");
    error.status = 401;
    error.code = "MISSING_ID_TOKEN";
    throw error;
  }

  try {
    return await admin.auth().verifyIdToken(idToken);
  } catch (err) {
    const error = new Error("Invalid or expired authentication token");
    error.status = 401;
    error.code = "INVALID_ID_TOKEN";
    error.firebaseCode = err?.code || null;
    throw error;
  }
}

/**
 * @param {string|null|undefined} idToken
 * @returns {Promise<{ uid: string, email?: string }>}
 */
async function verifyAdminToken(idToken) {
  const decoded = await verifyUserToken(idToken);

  const snap = await db.collection("users").doc(decoded.uid).get();
  const role = snap.exists ? snap.data().role : null;
  if (role !== "admin") {
    const e = new Error("Admin access required");
    e.status = 403;
    e.code = "NOT_ADMIN";
    throw e;
  }

  return { uid: decoded.uid, email: decoded.email };
}

/**
 * @param {import("http").IncomingMessage} req
 * @returns {Promise<{ uid: string, email?: string }>}
 */
async function verifyAdminFromRequest(req) {
  return verifyAdminToken(getBearerToken(req));
}

async function verifyUserFromRequest(req) {
  return verifyUserToken(getBearerToken(req));
}

module.exports = {
  verifyAdminFromRequest,
  verifyAdminToken,
  verifyUserFromRequest,
  verifyUserToken,
};
