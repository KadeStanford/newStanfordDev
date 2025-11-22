import { initializeApp, getApps } from "firebase/app";
// Note: avoid importing firebase/auth and firebase/firestore at module
// evaluation time to prevent browser-only code (like auth iframe) from
// being pulled into the server or the initial client bundle. We'll
// dynamically import these modules on the client when needed.
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAtuS506wEejpuY8eIr8mi8ubUtGQAPZ48",
  authDomain: "stanforddev.firebaseapp.com",
  projectId: "stanforddev",
  storageBucket: "stanforddev.firebasestorage.app",
  messagingSenderId: "10346329626",
  appId: "1:10346329626:web:4f7cbe6e6a14c80022c3a3",
  measurementId: "G-VH2JGKE1PJ",
};
// Initialize Firebase only on the client to avoid loading
// auth/iframe and other browser-only resources during SSR.
// We still export `auth` and `db` to keep the current import pattern,
// but they will be undefined on the server.
let app;
let auth;
let db;

if (typeof window !== "undefined") {
  // Client-only initialization (singleton). Dynamically import auth/firestore
  // so the module loader doesn't eagerly evaluate browser-only code.
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

  (async () => {
    try {
      const authMod = await import("firebase/auth");
      const firestoreMod = await import("firebase/firestore");
      auth = authMod.getAuth(app);
      db = firestoreMod.getFirestore(app);
    } catch (e) {
      // If dynamic import fails, leave auth/db undefined and log for debugging.
      // This should not block SSR because auth/db are not required on server.
      // eslint-disable-next-line no-console
      console.warn("Dynamic firebase import failed:", e);
    }
  })();
}

export { auth, db };
