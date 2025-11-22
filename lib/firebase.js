import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
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
  // Client-only initialization (singleton)
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db };
