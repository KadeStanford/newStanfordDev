const crypto = require("crypto");

function firstHeaderValue(value) {
  if (Array.isArray(value)) return value[0] || "";
  return String(value || "").split(",")[0].trim();
}

function normalizeAddress(value) {
  const address = firstHeaderValue(value);
  if (!address) return "unknown";
  if (address.startsWith("[")) {
    const closing = address.indexOf("]");
    return closing > 0 ? address.slice(1, closing) : address;
  }
  return address.replace(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/, "$1");
}

function getClientAddress(req) {
  return normalizeAddress(
    req.headers["cloudfront-viewer-address"] ||
      req.headers["cf-connecting-ip"] ||
      req.headers["x-vercel-forwarded-for"] ||
      req.headers["x-real-ip"] ||
      req.headers["x-forwarded-for"] ||
      req.socket?.remoteAddress ||
      req.connection?.remoteAddress
  );
}

function hashIdentifier(value, purpose = "request") {
  const salt =
    process.env.RATE_LIMIT_SALT ||
    process.env.FIREBASE_PROJECT_ID ||
    "stanforddev-rate-limit";
  return crypto
    .createHmac("sha256", salt)
    .update(`${purpose}:${value || "unknown"}`)
    .digest("hex");
}

async function consumeRateLimit({
  db,
  req,
  scope,
  max,
  windowMs,
  identifier,
}) {
  if (!db || typeof db.runTransaction !== "function") {
    throw new Error("Durable rate limiting is unavailable");
  }

  const rawIdentifier = identifier || getClientAddress(req);
  const identifierHash = hashIdentifier(rawIdentifier, scope);
  const ref = db.collection("_security_rate_limits").doc(`${scope}_${identifierHash}`);
  const now = Date.now();

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const current = snapshot.exists ? snapshot.data() || {} : {};
    const windowStart = Number(current.windowStart || 0);
    const inCurrentWindow = now - windowStart < windowMs;
    const count = inCurrentWindow ? Number(current.count || 0) : 0;
    const effectiveStart = inCurrentWindow ? windowStart : now;

    if (count >= max) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((effectiveStart + windowMs - now) / 1000)
        ),
      };
    }

    transaction.set(
      ref,
      {
        scope,
        identifierHash,
        count: count + 1,
        windowStart: effectiveStart,
        expiresAt: new Date(effectiveStart + windowMs),
        updatedAt: new Date(now),
      },
      { merge: true }
    );

    return { allowed: true, retryAfterSeconds: 0 };
  });
}

function setPrivateResponseHeaders(res) {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("Pragma", "no-cache");
}

function jsonSize(value) {
  return Buffer.byteLength(JSON.stringify(value ?? null), "utf8");
}

function secretsMatch(provided, expected) {
  if (!provided || !expected) return false;
  const left = Buffer.from(String(provided));
  const right = Buffer.from(String(expected));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

module.exports = {
  consumeRateLimit,
  getClientAddress,
  hashIdentifier,
  jsonSize,
  secretsMatch,
  setPrivateResponseHeaders,
};
