const admin = require("firebase-admin");

/** Firebase Auth tokens are issued per project; Admin SDK must use an SA for this project. */
const FIREBASE_PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  "stanforddev";

function parseJsonSa(decodedString, label) {
  try {
    return JSON.parse(decodedString);
  } catch (e) {
    console.error(`Failed to parse ${label}:`, e.message || e);
    return null;
  }
}

function tryParseRawServiceAccount(raw, label) {
  if (typeof raw === "object" && raw !== null && raw.private_key) return raw;
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(raw);
  } catch (e1) {
    try {
      const replaced = raw.replace(/\\n/g, "\n");
      return JSON.parse(replaced);
    } catch (e2) {
      try {
        const decoded = Buffer.from(raw, "base64").toString("utf8");
        return JSON.parse(decoded);
      } catch (e3) {
        console.error(`Failed to parse ${label} service account:`, e1.message);
        return null;
      }
    }
  }
}

/** Prefer credentials whose project_id matches the web Firebase app (avoids wrong GOOGLE_CREDENTIALS_BASE64). */
function pickServiceAccount(candidates) {
  const valid = candidates.filter((c) => c && c.private_key && c.client_email);
  if (valid.length === 0) return null;
  const match = valid.find((c) => c.project_id === FIREBASE_PROJECT_ID);
  if (match) return match;
  const sdk = valid.filter((c) =>
    String(c.client_email).includes("firebase-adminsdk")
  );
  if (sdk.length >= 1) {
    const pm = sdk.find((c) => c.project_id === FIREBASE_PROJECT_ID) || sdk[0];
    console.warn(
      `Firebase Admin: using firebase-adminsdk key for project_id=${pm.project_id} (expected ${FIREBASE_PROJECT_ID}).`
    );
    return pm;
  }
  console.warn(
    `Firebase Admin: no service account with project_id=${FIREBASE_PROJECT_ID}; using first available (project_id=${valid[0].project_id}). verifyIdToken may fail.`
  );
  return valid[0];
}

// Initialize firebase-admin once. Expect a service account JSON string
// to be provided in the GOOGLE_CREDENTIALS_BASE64 env var (recommended)
// or FIREBASE_SERVICE_ACCOUNT / GA_SA_KEY vars.
function initAdmin() {
  if (admin.apps && admin.apps.length) return admin;

  const hasFirebaseSA = !!process.env.FIREBASE_SERVICE_ACCOUNT;
  const hasGaSaKey = !!process.env.GA_SA_KEY;
  const hasGaSaBase64 = !!process.env.GA_SA_KEY_BASE64;
  const googleCredsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;

  console.log("Firebase Admin init: env present =>", {
    FIREBASE_PROJECT_ID,
    hasGoogleCredsBase64: !!googleCredsBase64,
    hasFirebaseSA,
    hasGaSaKey,
    hasGaSaBase64,
  });

  const candidates = [];

  if (googleCredsBase64) {
    const decoded = Buffer.from(googleCredsBase64, "base64").toString("utf8");
    const sa = parseJsonSa(decoded, "GOOGLE_CREDENTIALS_BASE64");
    if (sa) candidates.push(sa);
  }

  if (hasGaSaBase64) {
    try {
      const decoded = Buffer.from(
        process.env.GA_SA_KEY_BASE64,
        "base64"
      ).toString("utf8");
      const sa = parseJsonSa(decoded, "GA_SA_KEY_BASE64");
      if (sa) candidates.push(sa);
    } catch (e) {
      console.error("GA_SA_KEY_BASE64 decode failed:", e.message || e);
    }
  }

  if (hasFirebaseSA || hasGaSaKey) {
    const raw =
      process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GA_SA_KEY || "";
    const sa = tryParseRawServiceAccount(raw, "FIREBASE_SERVICE_ACCOUNT/GA_SA_KEY");
    if (sa) candidates.push(sa);
  }

  const sa = pickServiceAccount(candidates);

  if (sa) {
    try {
      if (sa.private_key) sa.private_key = sa.private_key.replace(/\\n/g, "\n");
      admin.initializeApp({
        credential: admin.credential.cert(sa),
        projectId: FIREBASE_PROJECT_ID,
      });
      console.log(
        "Firebase Admin initialized with service account.",
        `project_id=${sa.project_id}`
      );
    } catch (e) {
      console.error(
        "Failed to initialize admin SDK with parsed service account:",
        e
      );
      admin.initializeApp({ projectId: FIREBASE_PROJECT_ID });
    }
  } else {
    console.log(
      "No service account found, initializing with Default Credentials."
    );
    admin.initializeApp({ projectId: FIREBASE_PROJECT_ID });
  }

  return admin;
}

const adminInstance = initAdmin();
const db = adminInstance.firestore();

module.exports = { admin: adminInstance, db };
