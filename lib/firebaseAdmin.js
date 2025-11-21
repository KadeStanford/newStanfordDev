const admin = require("firebase-admin");

// Initialize firebase-admin once. Expect a service account JSON string
// to be provided in the GOOGLE_CREDENTIALS_BASE64 env var (recommended)
// or FIREBASE_SERVICE_ACCOUNT / GA_SA_KEY vars.
function initAdmin() {
  if (admin.apps && admin.apps.length) return admin;

  // 1. Check for the Base64 encoded variable (Recommended method)
  const googleCredsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;

  // 2. Check for legacy/alternative variables
  const hasFirebaseSA = !!process.env.FIREBASE_SERVICE_ACCOUNT;
  const hasGaSaKey = !!process.env.GA_SA_KEY;
  const hasGaSaBase64 = !!process.env.GA_SA_KEY_BASE64;

  // Log presence only (do NOT log secret contents)
  console.log("Firebase Admin init: env present =>", {
    hasGoogleCredsBase64: !!googleCredsBase64,
    hasFirebaseSA,
    hasGaSaKey,
    hasGaSaBase64,
  });

  let sa = null;

  // PRIORITY 1: GOOGLE_CREDENTIALS_BASE64
  if (googleCredsBase64) {
    try {
      const decoded = Buffer.from(googleCredsBase64, "base64").toString("utf8");
      sa = JSON.parse(decoded);
    } catch (e) {
      console.error("Failed to parse GOOGLE_CREDENTIALS_BASE64:", e);
    }
  }

  // PRIORITY 2: GA_SA_KEY_BASE64 (Old Base64 var)
  if (!sa && hasGaSaBase64) {
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

  // PRIORITY 3: Explicit FIREBASE_SERVICE_ACCOUNT or GA_SA_KEY (Raw Strings)
  if (!sa && (hasFirebaseSA || hasGaSaKey)) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GA_SA_KEY;
    if (typeof raw === "object") {
      sa = raw;
    } else if (typeof raw === "string") {
      try {
        sa = JSON.parse(raw);
      } catch (e1) {
        try {
          // Handle escaped newlines commonly found in AWS/Vercel env vars
          const replaced = raw.replace(/\\n/g, "\n");
          sa = JSON.parse(replaced);
        } catch (e2) {
          // Last ditch effort: try decoding as base64 just in case
          try {
            const decoded = Buffer.from(raw, "base64").toString("utf8");
            sa = JSON.parse(decoded);
          } catch (e3) {
            console.error(
              "Failed to parse service account from env vars (tried raw, escaped-newlines, base64):",
              e1
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
      console.log("Firebase Admin initialized with service account.");
    } catch (e) {
      console.error(
        "Failed to initialize admin SDK with parsed service account:",
        e
      );
      // Fallback to default (ADC) if cert fails
      admin.initializeApp();
    }
  } else {
    // Use default credentials (e.g., in Cloud Run / Vercel with proper role)
    console.log(
      "No service account found, initializing with Default Credentials."
    );
    admin.initializeApp();
  }

  return admin;
}

const adminInstance = initAdmin();
const db = adminInstance.firestore();

module.exports = { admin: adminInstance, db };
