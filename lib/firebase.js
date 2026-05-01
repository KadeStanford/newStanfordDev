import { initializeApp, getApps } from "firebase/app";

/**
 * Bundled defaults (must match Firebase Console for project `stanforddev`).
 * Hosting env vars are optional; enable with NEXT_PUBLIC_FIREBASE_USE_ENV=true after
 * every NEXT_PUBLIC_FIREBASE_* value is copied exactly from the Console.
 */
const BUNDLED_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAtuS506wEejpuY8eIr8mi8ubUtGQAPZ48",
  authDomain: "stanforddev.firebaseapp.com",
  projectId: "stanforddev",
  storageBucket: "stanforddev.firebasestorage.app",
  messagingSenderId: "10346329626",
  appId: "1:10346329626:web:4f7cbe6e6a14c80022c3a3",
  measurementId: "G-VH2JGKE1PJ",
};

function firebaseConfigFromEnv() {
  const map = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId:
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
      BUNDLED_FIREBASE_CONFIG.measurementId,
  };
  const ok =
    map.apiKey &&
    map.authDomain &&
    map.projectId === "stanforddev" &&
    map.storageBucket &&
    map.messagingSenderId &&
    map.appId;
  return ok ? map : null;
}

function buildFirebaseConfig() {
  const useEnv =
    process.env.NEXT_PUBLIC_FIREBASE_USE_ENV === "true" ||
    process.env.NEXT_PUBLIC_FIREBASE_USE_ENV === "1";
  if (!useEnv) return BUNDLED_FIREBASE_CONFIG;
  const fromEnv = firebaseConfigFromEnv();
  if (!fromEnv) {
    // eslint-disable-next-line no-console
    console.warn(
      "[firebase] NEXT_PUBLIC_FIREBASE_USE_ENV is on but env config is incomplete or projectId !== stanforddev — using bundled config."
    );
    return BUNDLED_FIREBASE_CONFIG;
  }
  return fromEnv;
}

const firebaseConfig = buildFirebaseConfig();

let app;
let auth;
let db;

if (typeof window !== "undefined") {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

  (async () => {
    try {
      const authMod = await import("firebase/auth");
      const firestoreMod = await import("firebase/firestore");
      auth = authMod.getAuth(app);
      db = firestoreMod.getFirestore(app);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Dynamic firebase import failed:", e);
    }
  })();
}

/**
 * Reliable auth for API calls: module-level `auth` may still be undefined right after import
 * because it is assigned inside an async IIFE.
 */
export async function getFirebaseAuth() {
  if (typeof window === "undefined") return null;
  const [{ getApps, initializeApp }, { getAuth }] = await Promise.all([
    import("firebase/app"),
    import("firebase/auth"),
  ]);
  const cfg = buildFirebaseConfig();
  const appInst =
    getApps().length > 0 ? getApps()[0] : initializeApp(cfg);
  return getAuth(appInst);
}

export { auth, db };
