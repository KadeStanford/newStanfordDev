const admin = require("firebase-admin");

// Initialize firebase-admin once. Expect a service account JSON string
// to be provided in the FIREBASE_SERVICE_ACCOUNT env var when running
// on a development machine or in environments where Application Default
// Credentials are not available.
function initAdmin() {
  if (admin.apps && admin.apps.length) return admin;

  // Prefer explicit Firebase service account; fall back to GA service account
  // if the Firebase one isn't provided. Finally fall back to ADC.
  const saJson =
    process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GA_SA_KEY || null;
  if (saJson) {
    try {
      const sa = typeof saJson === "object" ? saJson : JSON.parse(saJson);
      admin.initializeApp({
        credential: admin.credential.cert(sa),
      });
    } catch (e) {
      console.error("Failed to parse service account JSON for admin SDK:", e);
      // fallback to application default
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
