import React, { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import Link from "next/link"; // Import Link from next/link
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, Terminal } from "lucide-react";
import StarBackground from "../components/StarBackground";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true); // Toggle state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password validation rules
  const [pwRules, setPwRules] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
  });
  const [pwScore, setPwScore] = useState(0);
  const [loading, setLoading] = useState(false);

  // Get Auth functions and user state
  const { signIn, signUp, user } = useAuth(); // Import user here
  const router = useRouter();
  const [remember, setRemember] = useState(true);

  // Evaluate password strength (kept for signup UI)
  const evaluatePassword = (pw) => {
    const length = pw.length >= 8;
    const lowercase = /[a-z]/.test(pw);
    const uppercase = /[A-Z]/.test(pw);
    const number = /[0-9]/.test(pw);
    const special = /[^A-Za-z0-9]/.test(pw);

    const score = [length, lowercase, uppercase, number, special].filter(
      Boolean
    ).length;
    setPwRules({ length, lowercase, uppercase, number, special });
    setPwScore(score);
  };

  const toggleMode = () => {
    const next = !isLogin;
    toast(next ? "Switched to Login" : "Switched to Sign Up", {
      duration: 2000,
    });
    setIsLogin(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let authResponse;
      if (isLogin) {
        // --- LOGIN LOGIC ---
        authResponse = await signIn(email, password);
        toast.success("Welcome back!");
      } else {
        // --- SIGN UP LOGIC ---
        if (password !== confirmPassword) {
          toast.error("Passwords do not match.");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          toast.error("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }

        authResponse = await signUp(email, password);
        toast.success("Account created successfully!");
      }

      // After authentication attempt to read the user's role from Firestore
      // and route accordingly. If role can't be read, fall back to client dashboard.
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          router.push("/dashboard");
        } else {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          const role =
            userSnap.exists() && userSnap.data().role
              ? userSnap.data().role
              : "client";
          if (role === "admin") {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Auth Error:", error.code, error.message);

      // Friendly error messages
      if (error.code === "auth/email-already-in-use") {
        toast.error("That email is already in use.");
      } else if (error.code === "auth/weak-password") {
        toast.error("Password should be at least 6 characters.");
      } else if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        toast.error("Invalid email or password.");
      } else if (error.code === "auth/invalid-api-key") {
        toast.error("System Error: Invalid API Key (Check lib/firebase.js)");
      } else {
        toast.error(`Error: ${error.message}`);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden font-sans text-slate-200">
      <StarBackground />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-8"
      >
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20 mb-6">
            <Terminal size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? "Client Portal" : "Create Account"}
          </h1>
          <p className="text-slate-400">
            {isLogin
              ? "Access your project analytics & files."
              : "Start your journey with StanfordDev."}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="on">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  size={20}
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="client@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  size={20}
                />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (!isLogin) evaluatePassword(e.target.value);
                  }}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Signup-only fields */}
            {!isLogin && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      size={20}
                    />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                </div>

                {/* Password Strength Meter */}
                <div className="bg-slate-950/30 p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Strength:</span>
                    <span
                      className={`text-xs font-bold ${
                        pwScore >= 4
                          ? "text-green-400"
                          : pwScore >= 2
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {pwScore <= 2
                        ? "Weak"
                        : pwScore === 3
                        ? "Fair"
                        : "Strong"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full transition-all duration-300 ${
                        pwScore >= 4
                          ? "bg-green-500"
                          : pwScore >= 2
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${(pwScore / 5) * 100}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div
                      className={`text-[10px] flex items-center gap-1 ${
                        pwRules.length ? "text-green-400" : "text-slate-500"
                      }`}
                    >
                      {pwRules.length ? "✓" : "•"} 8+ Chars
                    </div>
                    <div
                      className={`text-[10px] flex items-center gap-1 ${
                        pwRules.uppercase ? "text-green-400" : "text-slate-500"
                      }`}
                    >
                      {pwRules.uppercase ? "✓" : "•"} Uppercase
                    </div>
                    <div
                      className={`text-[10px] flex items-center gap-1 ${
                        pwRules.number ? "text-green-400" : "text-slate-500"
                      }`}
                    >
                      {pwRules.number ? "✓" : "•"} Number
                    </div>
                    <div
                      className={`text-[10px] flex items-center gap-1 ${
                        pwRules.special ? "text-green-400" : "text-slate-500"
                      }`}
                    >
                      {pwRules.special ? "✓" : "•"} Special
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}{" "}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Remember me checkbox - helps browsers offer to save credentials */}
          <div className="mt-4 flex items-center gap-2">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 text-blue-600 bg-slate-800 border-slate-700 rounded focus:ring-blue-500"
            />
            <label htmlFor="remember" className="text-sm text-slate-400">
              Remember me
            </label>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-slate-500 hover:text-white text-sm transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
