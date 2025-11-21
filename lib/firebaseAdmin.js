const admin = require("firebase-admin");

// Initialize firebase-admin once. Expect a service account JSON string
// to be provided in the FIREBASE_SERVICE_ACCOUNT env var when running
// on a development machine or in environments where Application Default
// Credentials are not available.
function initAdmin() {
  if (admin.apps && admin.apps.length) return admin;

  // Prefer explicit Firebase service account; fall back to GA service account
  // if the Firebase one isn't provided. Finally fall back to ADC.
  const hasFirebaseSA = !!process.env.FIREBASE_SERVICE_ACCOUNT;
  const hasGaSaKey = !!process.env.GA_SA_KEY;
  const hasGaSaBase64 = !!process.env.GA_SA_KEY_BASE64;

  // Log presence only (do NOT log secret contents)
  console.log("Firebase Admin init: env present =>", {
    hasFirebaseSA,
    hasGaSaKey,
    hasGaSaBase64,
  });

  let sa = null;
  // If a dedicated base64 var is provided, prefer it (safe for hosts)
  if (hasGaSaBase64) {
    try {
      const decoded = Buffer.from(
        process.env.GA_SA_KEY_BASE64,
        "base64"
      ).toString("utf8");
      sa = JSON.parse(decoded);
    } catch (e) {
      console.error(
        "Failed to parse GA_SA_KEY_BASE64 service account JSON:",
        e
      );
    }
  }

  // Next prefer explicit FIREBASE_SERVICE_ACCOUNT or GA_SA_KEY (escaped-newline safe)
  if (!sa && (hasFirebaseSA || hasGaSaKey)) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GA_SA_KEY;
    if (typeof raw === "object") {
      sa = raw;
    } else if (typeof raw === "string") {
      // Try parsing directly, then with escaped newlines replaced, then as base64
      try {
        sa = JSON.parse(raw);
      } catch (e1) {
        try {
          const replaced = raw.replace(/\\n/g, "\n");
          sa = JSON.parse(replaced);
        } catch (e2) {
          try {
            const decoded = Buffer.from(raw, "base64").toString("utf8");
            sa = JSON.parse(decoded);
          } catch (e3) {
            console.error(
              "Failed to parse service account from FIREBASE_SERVICE_ACCOUNT/GA_SA_KEY (tried raw, escaped-newlines, base64):",
              e1,
              e2,
              e3
            );
          }
        }
      }
    }
  }

  if (sa) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(sa),
      });
    } catch (e) {
      console.error(
        "Failed to initialize admin SDK with parsed service account:",
        e
      );
      admin.initializeApp();
    }
  } else {
    // Use default credentials (e.g., in Cloud Run / Vercel with proper role)
    admin.initializeApp();
  }

  return admin;
}

const adminInstance = initAdmin();
const db = adminInstance.firestore();

module.exports = { admin: adminInstance, db };
