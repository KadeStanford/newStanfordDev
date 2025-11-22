import { createContext, useContext, useEffect, useState } from "react";
// Note: firebase client instances are dynamically imported below to avoid
// running firebase client code during SSR.

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Defer setting up the auth listener until after hydration
    let unsubscribe = () => {};
    let mounted = true;

    (async () => {
      if (typeof window === "undefined") return;

      // Dynamically import Firebase auth + firestore helpers so they
      // don't run during SSR and only load after the page is interactive.
      const [authMod, firestoreMod] = await Promise.all([
        import("firebase/auth"),
        import("firebase/firestore"),
      ]);

      const onAuthStateChanged = authMod.onAuthStateChanged;
      const doc = firestoreMod.doc;
      const getDoc = firestoreMod.getDoc;
      const setDoc = firestoreMod.setDoc;

      // Ensure firebase client instances are available (lib/firebase initializes on client)
      const { auth, db } = await import("../lib/firebase");

      if (!auth) {
        // If auth failed to initialize for any reason, bail out gracefully
        setLoading(false);
        return;
      }

      unsubscribe = onAuthStateChanged(auth, async (authUser) => {
        if (!mounted) return;

        if (authUser) {
          try {
            // Fetch the user's role from Firestore
            const userDocRef = doc(db, "users", authUser.uid);
            const userDoc = await getDoc(userDocRef);

            let userData = {};
            if (userDoc && userDoc.exists && userDoc.exists()) {
              userData = userDoc.data();
            }

            setUser({
              uid: authUser.uid,
              email: authUser.email,
              displayName: authUser.displayName,
              role: userData.role || "client",
            });
          } catch (error) {
            console.error("Error fetching user role:", error);
            setUser({
              uid: authUser.uid,
              email: authUser.email,
              role: "client",
            });
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });
    })();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signUp = async (email, password) => {
    const [authMod, firestoreMod] = await Promise.all([
      import("firebase/auth"),
      import("firebase/firestore"),
    ]);
    const createUserWithEmailAndPassword =
      authMod.createUserWithEmailAndPassword;
    const setDoc = firestoreMod.setDoc;
    const doc = firestoreMod.doc;

    const { auth, db } = await import("../lib/firebase");

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: email,
      role: "client",
      createdAt: new Date().toISOString(),
    });

    return userCredential;
  };

  const signIn = async (email, password) => {
    const authMod = await import("firebase/auth");
    const signInWithEmailAndPassword = authMod.signInWithEmailAndPassword;
    const { auth } = await import("../lib/firebase");
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    const authMod = await import("firebase/auth");
    const signOut = authMod.signOut;
    const { auth } = await import("../lib/firebase");
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
