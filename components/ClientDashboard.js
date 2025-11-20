import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { signOut, updateProfile } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
  doc as firestoreDoc,
  getDoc,
  setDoc,
  orderBy,
  limit as firestoreLimit,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import StarBackground from "../components/StarBackground";
import Link from "next/link";
import { Home as HomeIcon } from "lucide-react";
import {
  BarChart3,
  FileText,
  LogOut,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  LayoutDashboard,
  CreditCard,
  Settings,
  Plus,
  ChevronRight,
  Menu,
  Calendar,
  X,
  User,
  Phone,
  MapPin,
  Save,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import TestimonialForm from "../components/TestimonialForm";
import { generateInvoicePdf } from "../lib/generateInvoicePdf";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import { toast } from "sonner";

// --- MOCK DATA GENERATOR (For "Create Demo Project" button) ---
const createDemoProject = async (userId) => {
  try {
    await addDoc(collection(db, "projects"), {
      clientId: userId,
      name: "E-Commerce Redesign 2025",
      status: "In Progress",
      progress: 65,
      budget: 15000,
      paid: 7500,
      nextMilestone: "Payment Gateway Integration",
      dueDate: "Oct 24, 2025",
      createdAt: serverTimestamp(),
      updates: [
        {
          title: "Homepage Design Approved",
          date: "2 days ago",
          type: "success",
        },
        {
          title: "Database Schema Finalized",
          date: "1 week ago",
          type: "info",
        },
        {
          title: "Initial Kickoff Meeting",
          date: "2 weeks ago",
          type: "neutral",
        },
      ],
      documents: [
        { name: "Project_Scope_v2.pdf", size: "2.4 MB", type: "pdf" },
        { name: "Brand_Guidelines.pdf", size: "12.1 MB", type: "pdf" },
        { name: "Contract_Signed.pdf", size: "1.1 MB", type: "pdf" },
      ],
      invoices: [
        { id: "INV-001", amount: 7500, status: "Paid", date: "Sep 01, 2025" },
        {
          id: "INV-002",
          amount: 3750,
          status: "Pending",
          date: "Oct 01, 2025",
        },
      ],
    });
    window.location.reload(); // Refresh to fetch new data
  } catch (error) {
    console.error("Error creating demo project:", error);
    alert("Failed to create demo data. Check console.");
  }
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  color = "blue",
  prefix = "",
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group"
  >
    <div
      className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-${color}-500`}
    >
      <Icon size={64} />
    </div>
    <div
      className={`w-12 h-12 rounded-xl bg-${color}-500/10 flex items-center justify-center mb-4`}
    >
      <Icon className={`text-${color}-500`} size={24} />
    </div>
    <p className="text-slate-400 text-sm mb-1 font-medium">{label}</p>
    <h3 className="text-2xl font-bold text-white flex items-center gap-1">
      {prefix}
      <CountUp end={value} duration={2} separator="," />
      {label === "Completion" && "%"}
    </h3>
  </motion.div>
);

const AnalyticsSparkline = ({ data = [], width = 400, height = 48 }) => {
  if (!data || data.length === 0) return null;
  const counts = data.map((d) => d.count);
  const max = Math.max(...counts, 1);
  const w = Math.min(width, Math.max(120, data.length * 36));
  const step = data.length > 1 ? w / (data.length - 1) : w;
  const points = data
    .map((d, i) => {
      const x = Math.round(i * step);
      const y = Math.round(height - (d.count / max) * (height - 6));
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${w} ${height}`}
      preserveAspectRatio="none"
      className="w-full h-full"
    >
      <polyline
        fill="none"
        stroke="#7c3aed"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        vectorEffect="non-scaling-stroke"
      />
      <polyline
        fill="rgba(124,58,237,0.12)"
        stroke="none"
        points={`${points} ${w},${height} 0,${height}`}
      />
    </svg>
  );
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  // store the list of projects and the currently selected project id
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // settings/profile state
  const [profileFields, setProfileFields] = useState({
    displayName: user?.displayName || "",
    phone: "",
    address: "",
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // navigation items:
  // - when a project is selected: show per-project tabs (Overview, Documents, Invoices)
  // - when no project selected: show global tabs (Overview, Testimonials, All Invoices, Settings)
  const navItems = selectedProjectId
    ? [
        { id: "overview", label: "Project Overview", icon: LayoutDashboard },
        { id: "documents", label: "Documents", icon: FileText },
        { id: "invoices", label: "Invoices", icon: CreditCard },
      ]
    : [
        { id: "overview", label: "Project Chooser", icon: Plus }, // Renamed from Overview for clarity in mobile nav
        { id: "testimonials", label: "Testimonials", icon: CheckCircle2 },
        { id: "invoices", label: "All Invoices", icon: CreditCard },
        { id: "settings", label: "Settings", icon: Settings },
      ];

  // if no project is selected, ensure we default to the general overview (project chooser)
  useEffect(() => {
    if (!selectedProjectId && activeTab !== "overview" && projects.length > 0) {
      setActiveTab("overview");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId, projects.length]);

  // Logout helper
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  // Subscribe to the user's project data and clear the fetching spinner
  useEffect(() => {
    if (loading) return; // wait for auth state
    if (!user) {
      setProjects([]);
      setFetching(false);
      return;
    }

    setFetching(true);
    const q = query(
      collection(db, "projects"),
      where("clientId", "==", user.uid)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setProjects(docs);
          // keep previous selection if it still exists, otherwise clear selection
          setSelectedProjectId((prev) =>
            docs.some((d) => d.id === prev) ? prev : null
          );
        } else {
          setProjects([]);
          setSelectedProjectId(null);
        }
        setFetching(false);
      },
      (err) => {
        console.error("Project listener error:", err);
        setFetching(false);
      }
    );

    return () => unsub();
  }, [user, loading]);

  // load user profile fields from users collection when user available
  useEffect(() => {
    if (!user) return;
    setProfileFields((p) => ({ ...p, displayName: user.displayName || "" }));
    const load = async () => {
      try {
        const ref = firestoreDoc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setProfileFields((p) => ({
            ...p,
            phone: data.phone || "",
            address: data.address || "",
          }));
        }
      } catch (e) {
        console.warn("Failed to load user profile doc:", e);
      }
    };
    load();
  }, [user]);

  const saveSettings = async () => {
    if (!user) return toast.error("Not signed in");
    setSavingSettings(true);
    try {
      // update Firebase Auth displayName if changed
      if (
        auth.currentUser &&
        profileFields.displayName !== auth.currentUser.displayName
      ) {
        await updateProfile(auth.currentUser, {
          displayName: profileFields.displayName || null,
        });
      }

      // update users doc (merge)
      const uRef = firestoreDoc(db, "users", user.uid);
      await setDoc(
        uRef,
        {
          displayName: profileFields.displayName || null,
          phone: profileFields.phone || null,
          address: profileFields.address || null,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      toast.success("Settings saved");
    } catch (e) {
      console.error("Failed to save settings:", e);
      toast.error("Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  // derive the currently-selected project object
  const projectData = projects.find((p) => p.id === selectedProjectId) || null;

  // Date formatting helpers to display dates in the user's local timezone
  const formatDateForDisplay = (val) => {
    if (!val) return "—";
    try {
      // handle Firestore Timestamp
      if (val?.toDate) return val.toDate().toLocaleDateString();
      const dt = new Date(val);
      if (isNaN(dt)) return String(val);
      return dt.toLocaleDateString();
    } catch (e) {
      return String(val);
    }
  };

  // Ensure a liveUrl is absolute (has protocol). If admin saved without protocol,
  // prepend https:// so the link opens externally instead of as a site-relative route.
  const ensureAbsoluteUrl = (url) => {
    if (!url) return null;
    const trimmed = String(url).trim();
    if (!trimmed) return null;
    // if it already has a protocol, return as-is
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    // otherwise, assume https
    return `https://${trimmed}`;
  };

  // --- Analytics: fetch recent events for this project and compute daily counts ---
  const [analyticsCounts, setAnalyticsCounts] = useState([]);
  useEffect(() => {
    let mounted = true;
    const loadAnalytics = async () => {
      if (!projectData?.id || !projectData?.analyticsEnabled) return;
      try {
        const eventsRef = collection(
          firestoreDoc(db, "analytics", projectData.id),
          "events"
        );
        const q = query(
          eventsRef,
          orderBy("createdAt", "desc"),
          firestoreLimit(500)
        );
        const snap = await getDocs(q);
        // initialize last 7 days counts
        const counts = {};
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          counts[d.toISOString().slice(0, 10)] = 0;
        }
        snap.docs.forEach((doc) => {
          const d = doc.data();
          const ts = d.createdAt?.toDate
            ? d.createdAt.toDate()
            : new Date(d.createdAt);
          const key = ts.toISOString().slice(0, 10);
          if (counts[key] !== undefined) counts[key] += 1;
        });
        const arr = Object.keys(counts).map((k) => ({
          date: k,
          count: counts[k],
        }));
        if (mounted) setAnalyticsCounts(arr);
      } catch (e) {
        console.warn("Failed to load analytics:", e);
      }
    };
    loadAnalytics();
    return () => (mounted = false);
  }, [projectData?.id, projectData?.analyticsEnabled]);

  const downloadInvoicePdf = async (inv) => {
    try {
      // If the passed `inv` is only a lightweight summary (from project.invoices),
      // fetch the full invoice document from Firestore so we include itemized lines.
      let fullInv = { ...inv };
      try {
        if (inv?.id) {
          const invRef = firestoreDoc(db, "invoices", inv.id);
          const invSnap = await getDoc(invRef);
          if (invSnap.exists()) {
            fullInv = { ...fullInv, ...invSnap.data() };
          }
        }
      } catch (e) {
        console.warn(
          "Could not fetch full invoice doc, proceeding with summary:",
          e
        );
      }

      // Try to enrich client contact info using the current project (has clientId)
      try {
        if (!fullInv.clientName && projectData?.clientId) {
          const userRef = firestoreDoc(db, "users", projectData.clientId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const u = userSnap.data();
            fullInv.clientName =
              fullInv.clientName || u.displayName || u.name || u.email;
            fullInv.clientEmail = fullInv.clientEmail || u.email;
            fullInv.clientPhone = fullInv.clientPhone || u.phone || "";
            fullInv.clientAddress = fullInv.clientAddress || u.address || "";
          }
        }
      } catch (e) {
        console.warn("Could not fetch user contact info:", e);
      }

      const { blob, filename } = await generateInvoicePdf(fullInv, {
        name: "Stanford Dev Solutions",
        address: "19260 White Road Norwood LA 70761",
        email: "Stanforddevcontact@gmail.com",
        phone: "(225) 244-5660",
      });

      const url = URL.createObjectURL(blob);
      try {
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (e) {
        window.open(url, "_blank");
      } finally {
        setTimeout(() => URL.revokeObjectURL(url), 1000 * 60);
      }
    } catch (err) {
      console.error("Failed to generate or download invoice PDF:", err);
      // Fallback printable HTML
      try {
        const html = `
          <html>
            <head>
              <title>Invoice ${inv.number || inv.id}</title>
              <style>
                body { font-family: Arial, Helvetica, sans-serif; color: #111827; padding: 24px }
                .header { display:flex; justify-content:space-between; align-items:center }
                .muted { color: #6b7280 }
                .section { margin-top: 16px }
                .amount { font-size: 20px; font-weight:700 }
              </style>
            </head>
            <body>
              <div class="header">
                <div>
                  <h1>Invoice ${inv.number || inv.id}</h1>
                  <div class="muted">${
                    inv.status || "Unpaid"
                  } • ${formatDateForDisplay(
          inv.dueDate || inv.date || inv.createdAt
        )}</div>
                </div>
                <div class="amount">$${(inv.amount || 0).toLocaleString()}</div>
              </div>
              <div class="section">
                <strong>Due:</strong> ${formatDateForDisplay(
                  inv.dueDate || inv.date || inv.createdAt
                )}
              </div>
              <div class="section">
                <h3>Description</h3>
                <div>${inv.description || ""}</div>
              </div>
            </body>
          </html>
        `;
        const w = window.open("", "_blank");
        if (!w) throw new Error("Popup blocked");
        w.document.write(html);
        w.document.close();
      } catch (err2) {
        console.error("Failed to print invoice:", err2);
        alert(
          "Unable to generate or download invoice PDF. Try a desktop browser."
        );
      }
    }
  };

  if (loading || fetching)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500 selection:text-white flex">
      <StarBackground />

      {/* SIDEBAR (Desktop) */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 z-50 hidden lg:flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="font-bold text-white text-lg">ClientPortal</span>
          </div>
          <div className="mt-3">
            <Link
              href="/"
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2"
            >
              <HomeIcon size={14} />
              Back to Site
            </Link>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {selectedProjectId && (
            <button
              onClick={() => {
                setSelectedProjectId(null);
                setActiveTab("overview");
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-slate-400 hover:text-white hover:bg-slate-800 mb-4"
            >
              <ChevronRight size={20} className="-rotate-180" />
              **Project Chooser**
            </button>
          )}

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                activeTab === item.id
                  ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm text-white font-medium truncate">
                {user?.email}
              </p>
              <p className="text-xs text-slate-500">Client Account</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER (Fixed Top) */}
      <div className="lg:hidden fixed top-0 w-full z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-4 flex justify-between items-center h-16">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white">
            {selectedProjectId
              ? projectData?.name || "Project Dashboard"
              : "ClientPortal"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileNavOpen((s) => !s)}
            aria-label="Toggle navigation"
            className="p-2 rounded-md hover:bg-slate-800/50"
          >
            {mobileNavOpen ? (
              <X size={20} className="text-slate-200" />
            ) : (
              <Menu size={20} className="text-slate-200" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE NAV OVERLAY */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed top-16 left-0 right-0 bottom-0 z-40 bg-slate-900/95 backdrop-blur-lg overflow-y-auto"
          >
            <div className="flex flex-col gap-2 p-4">
              {selectedProjectId && (
                <button
                  onClick={() => {
                    setSelectedProjectId(null);
                    setActiveTab("overview");
                    setMobileNavOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors text-left bg-slate-800 text-white hover:bg-slate-700/80"
                >
                  <ChevronRight size={18} className="-rotate-180" />
                  <span>Switch Projects</span>
                </button>
              )}

              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileNavOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left ${
                      activeTab === item.id
                        ? "bg-blue-600 text-white"
                        : "text-slate-300 hover:bg-slate-800/50"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <div className="mt-4 pt-4 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-700 bg-red-700/20 text-red-400 hover:text-white hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <main className="flex-1 lg:pl-64 relative z-10">
        <div className={`max-w-5xl mx-auto p-4 lg:p-6 mt-16 lg:mt-0`}>
          {projects.length === 0 ? (
            // EMPTY STATE (Code Omitted for Brevity - No Changes Here)
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 lg:py-40"
            >
              <div className="inline-flex p-4 rounded-full bg-slate-800/50 mb-6">
                <LayoutDashboard size={48} className="text-slate-600" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome to your Dashboard
              </h2>
              <p className="text-slate-400 max-w-md mx-auto mb-8">
                You don&apos;t have any active projects linked to this account
                yet. Start a new project request or generate demo data to
                explore the interface.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push("/#contact")}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors"
                >
                  Request New Project
                </button>
                <button
                  onClick={() => createDemoProject(user.uid)}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl font-semibold transition-colors"
                >
                  Generate Demo Data
                </button>
              </div>
            </motion.div>
          ) : (
            // CONTENT WITH PROJECTS
            <AnimatePresence mode="wait">
              {/* GLOBAL VIEWS (When no project is selected) */}
              {!selectedProjectId && (
                <motion.div
                  key="global-view"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* PROJECT CHOOSER (Default Global Overview) */}
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      <h2 className="text-3xl font-bold text-white">
                        Your Projects
                      </h2>
                      <p className="text-slate-400">
                        Select a project to view its details.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        {projects.map((p) => (
                          <div
                            key={p.id}
                            className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-blue-500/50 transition-all"
                          >
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div>
                                <h3 className="text-white font-semibold truncate">
                                  {p.name}
                                </h3>
                                <p className="text-sm text-slate-400">
                                  {p.status} • Due{" "}
                                  {formatDateForDisplay(p.dueDate)}
                                </p>
                              </div>
                            </div>
                            <div className="mt-auto flex justify-between items-center">
                              <p className="text-sm text-slate-400">
                                Progress: {p.progress ?? 0}%
                              </p>
                              <button
                                onClick={() => setSelectedProjectId(p.id)}
                                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium"
                              >
                                View
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* GLOBAL TESTIMONIALS (Code Omitted for Brevity - No Changes Here) */}
                  {activeTab === "testimonials" && (
                    <div className="max-w-prose">
                      <h1 className="text-3xl font-bold text-white mb-6">
                        Submit a Testimonial
                      </h1>
                      <p className="text-slate-400 mb-6 max-w-prose">
                        Share your experience working with us. Submissions are
                        reviewed by our team before appearing on the site.
                      </p>
                      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <TestimonialForm />
                      </div>
                    </div>
                  )}

                  {/* GLOBAL ALL INVOICES (Refactored for mobile first) */}
                  {activeTab === "invoices" && (
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-6">
                        All Projects — Invoices
                      </h1>
                      <div className="space-y-6">
                        {projects.map((p) => (
                          <div
                            key={p.id}
                            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="text-white font-semibold">
                                  {p.name}
                                </h3>
                                <p className="text-sm text-slate-400">
                                  {p.status} • Due{" "}
                                  {formatDateForDisplay(p.dueDate)}
                                </p>
                              </div>
                              <div className="text-sm text-slate-400">
                                Invoices: {p.invoices?.length ?? 0}
                              </div>
                            </div>

                            {p.invoices?.length ? (
                              <>
                                {/* Mobile/Tablet View (Block on all devices but hidden on large screens) */}
                                <div className="block lg:hidden space-y-3">
                                  {p.invoices.map((inv) => (
                                    <div
                                      key={inv.id}
                                      className="bg-slate-950/20 border border-slate-800 rounded-lg p-4 flex items-center justify-between"
                                    >
                                      <div>
                                        <p className="text-sm text-slate-400">
                                          Invoice #{inv.id}
                                        </p>
                                        <p className="text-white font-medium text-lg">
                                          $
                                          {inv.amount?.toLocaleString?.() ??
                                            inv.amount}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                          Due:{" "}
                                          {formatDateForDisplay(
                                            inv.dueDate ||
                                              inv.date ||
                                              inv.createdAt
                                          )}
                                        </p>
                                      </div>
                                      <div className="text-right flex flex-col items-end gap-2">
                                        <span
                                          className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                                            inv.status === "Paid"
                                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                              : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                          }`}
                                        >
                                          {inv.status}
                                        </span>
                                        <button
                                          onClick={() =>
                                            downloadInvoicePdf(inv)
                                          }
                                          className="text-blue-400 hover:text-white text-xs flex items-center gap-1"
                                        >
                                          <Download size={12} /> Download
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Desktop Table View (Hidden on mobile) */}
                                <div className="hidden lg:block overflow-x-auto">
                                  <table className="w-full min-w-[500px] text-left text-sm">
                                    <thead className="bg-slate-950 text-slate-400 uppercase font-medium">
                                      <tr>
                                        <th className="px-6 py-4">
                                          Invoice ID
                                        </th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">
                                          Action
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                      {p.invoices.map((inv) => (
                                        <tr
                                          key={inv.id}
                                          className="hover:bg-slate-800/30 transition-colors"
                                        >
                                          <td className="px-6 py-4 font-medium text-white">
                                            {inv.id}
                                          </td>
                                          <td className="px-6 py-4 text-slate-400">
                                            {formatDateForDisplay(
                                              inv.dueDate ||
                                                inv.date ||
                                                inv.createdAt
                                            )}
                                          </td>
                                          <td className="px-6 py-4 text-white font-mono">
                                            ${inv.amount.toLocaleString()}
                                          </td>
                                          <td className="px-6 py-4">
                                            <span
                                              className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                                                inv.status === "Paid"
                                                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                                  : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                              }`}
                                            >
                                              {inv.status}
                                            </span>
                                          </td>
                                          <td className="px-6 py-4 text-right">
                                            <button
                                              onClick={() =>
                                                downloadInvoicePdf(inv)
                                              }
                                              className="text-blue-400 hover:text-white font-medium text-xs"
                                            >
                                              Download
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </>
                            ) : (
                              <p className="text-slate-400 p-4">
                                No invoices for this project.
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* GLOBAL SETTINGS (Code Omitted for Brevity - No Changes Here) */}
                  {activeTab === "settings" && (
                    <div className="max-w-2xl">
                      <h1 className="text-3xl font-bold text-white mb-8">
                        Account Settings
                      </h1>
                      <div className="space-y-6">
                        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <User size={20} /> Profile Information
                          </h3>
                          <div className="grid gap-4">
                            <div>
                              <label className="block text-sm text-slate-400 mb-1">
                                Email Address
                              </label>
                              <input
                                disabled
                                value={user?.email}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-500 cursor-not-allowed"
                              />
                            </div>

                            <div>
                              <label className="block text-sm text-slate-400 mb-1">
                                Display Name
                              </label>
                              <input
                                value={profileFields.displayName}
                                onChange={(e) =>
                                  setProfileFields((s) => ({
                                    ...s,
                                    displayName: e.target.value,
                                  }))
                                }
                                placeholder="Enter your name"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-sm text-slate-400 mb-1 flex items-center gap-1">
                                <Phone size={14} /> Phone
                              </label>
                              <input
                                value={profileFields.phone}
                                onChange={(e) =>
                                  setProfileFields((s) => ({
                                    ...s,
                                    phone: e.target.value,
                                  }))
                                }
                                placeholder="Phone number"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-sm text-slate-400 mb-1 flex items-center gap-1">
                                <MapPin size={14} /> Address
                              </label>
                              <input
                                value={profileFields.address}
                                onChange={(e) =>
                                  setProfileFields((s) => ({
                                    ...s,
                                    address: e.target.value,
                                  }))
                                }
                                placeholder="Mailing address"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                              />
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
                              <button
                                onClick={saveSettings}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                disabled={savingSettings}
                              >
                                <Save size={16} />
                                {savingSettings ? "Saving…" : "Save Changes"}
                              </button>
                              <button
                                onClick={() => {
                                  // Simplified reset to initial Firebase Auth values
                                  setProfileFields({
                                    displayName: user?.displayName || "",
                                    phone: "",
                                    address: "",
                                  });
                                }}
                                className="px-6 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-800/60 flex items-center justify-center gap-2"
                                disabled={savingSettings}
                              >
                                <RotateCcw size={16} />
                                Reset
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* PROJECT-SPECIFIC VIEWS (When a project is selected) */}
              {selectedProjectId && projectData && (
                <motion.div
                  key={`project-${selectedProjectId}-${activeTab}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  {/* Project Header */}
                  <header className="pt-4 lg:pt-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedProjectId(null);
                            setActiveTab("overview"); // Back to the project chooser
                          }}
                          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white bg-slate-800/30 px-3 py-1 rounded-md"
                        >
                          <ChevronRight size={16} className="-rotate-180" />
                          Back
                        </button>
                        <h1 className="text-xl sm:text-2xl font-bold text-white truncate max-w-[70%]">
                          {projectData.name}
                        </h1>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                        <span className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                          {projectData.status}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDateForDisplay(projectData.dueDate)}
                        </span>
                        {/* MOVED: View Live Site Button */}
                        {(projectData.status === "Completed" ||
                          projectData.completedAt) &&
                          projectData.liveUrl && (
                            <a
                              href={ensureAbsoluteUrl(projectData.liveUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
                            >
                              View Live Site
                              <ExternalLink size={14} />
                            </a>
                          )}
                        {/* END MOVED BUTTON */}
                      </div>
                    </div>
                    {/* Only show per-project nav tabs on larger screens. On mobile, the tabs are in the nav overlay. */}
                    <div className="hidden lg:flex items-center gap-2 border-b border-slate-800 pt-2">
                      {navItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                            activeTab === item.id
                              ? "text-blue-400 border-blue-600"
                              : "text-slate-400 border-transparent hover:border-slate-600"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </header>
                  <div className="pt-2">
                    {/* PROJECT OVERVIEW TAB (Code Omitted for Brevity - Live Site Button Moved Out) */}
                    {activeTab === "overview" && (
                      <div className="space-y-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <StatCard
                            icon={BarChart3}
                            label="Completion"
                            value={projectData.progress}
                            color="blue"
                          />
                          <StatCard
                            icon={CreditCard}
                            label="Budget"
                            value={projectData.budget}
                            color="purple"
                            prefix="$"
                          />
                          <StatCard
                            icon={CheckCircle2}
                            label="Paid"
                            value={projectData.paid}
                            color="green"
                            prefix="$"
                          />
                          <StatCard
                            icon={AlertCircle}
                            label="Open Items"
                            value={2}
                            color="orange"
                          />
                        </div>

                        {projectData.analyticsEnabled &&
                          analyticsCounts?.length > 0 && (
                            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 md:p-6">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-bold text-white">
                                  Site Activity (7d)
                                </h3>
                                <p className="text-sm text-slate-400">
                                  Total:{" "}
                                  {analyticsCounts.reduce(
                                    (s, it) => s + it.count,
                                    0
                                  )}
                                </p>
                              </div>
                              <div className="w-full h-16">
                                <AnalyticsSparkline data={analyticsCounts} />
                              </div>
                            </div>
                          )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          <div className="lg:col-span-2 space-y-8">
                            {/* Progress Section */}
                            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8">
                              <div className="flex justify-between items-end mb-4">
                                <h3 className="text-xl font-bold text-white">
                                  Milestone Progress
                                </h3>
                                <span className="text-blue-400 font-mono">
                                  {projectData.progress}%
                                </span>
                              </div>
                              <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden mb-2">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${projectData.progress}%`,
                                  }}
                                  transition={{
                                    duration: 1.5,
                                    ease: "circOut",
                                  }}
                                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-purple-600"
                                />
                              </div>
                              <p className="text-sm text-slate-400 text-right">
                                Next: {projectData.nextMilestone}
                              </p>
                            </div>

                            {/* Updates */}
                            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8">
                              <h3 className="text-xl font-bold text-white mb-6">
                                Recent Activity
                              </h3>
                              <div className="space-y-6">
                                {projectData.updates?.map((update, i) => (
                                  <div key={i} className="flex gap-4 group">
                                    <div className="flex flex-col items-center">
                                      <div
                                        className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${
                                          update.type === "success"
                                            ? "bg-green-500"
                                            : "bg-blue-500"
                                        }`}
                                      />
                                      {i !== projectData.updates.length - 1 && (
                                        <div className="w-px h-full bg-slate-800 my-1" />
                                      )}
                                    </div>
                                    <div className="pb-2">
                                      <p className="text-slate-200 font-medium group-hover:text-blue-400 transition-colors">
                                        {update.title}
                                      </p>
                                      <p className="text-sm text-slate-500">
                                        {update.date}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-6">
                            {/* CTA Card */}
                            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-900/20">
                              <h3 className="font-bold text-lg mb-2">
                                Need Assistance?
                              </h3>
                              <p className="text-blue-100 text-sm mb-4">
                                Schedule a call directly with the development
                                team.
                              </p>
                              <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                                <Calendar size={18} />
                                Book Meeting
                              </button>
                            </div>

                            {/* Quick Links */}
                            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                              <h3 className="font-bold text-white mb-4">
                                Quick Links
                              </h3>
                              <div className="space-y-2">
                                {projectData.documents
                                  ?.slice(0, 2)
                                  .map((doc, i) => (
                                    <a
                                      key={i}
                                      href="#"
                                      className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors group"
                                    >
                                      <span className="text-sm text-slate-300 truncate">
                                        {doc.name}
                                      </span>
                                      <Download
                                        size={14}
                                        className="text-slate-500 group-hover:text-white"
                                      />
                                    </a>
                                  ))}
                              </div>
                            </div>

                            {/* Live Site Link (Completed Projects) - Redundant now, kept for context but disabled */}
                            {(projectData.status === "Completed" ||
                              projectData.completedAt) &&
                              !projectData.liveUrl && (
                                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                                  <button
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm font-semibold"
                                    disabled
                                  >
                                    No Live URL
                                  </button>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PROJECT DOCUMENTS TAB (Code Omitted for Brevity - No Changes Here) */}
                    {activeTab === "documents" && (
                      <div>
                        <h1 className="text-3xl font-bold text-white mb-8">
                          Project Documents
                        </h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {projectData.documents?.map((doc, i) => (
                            <a
                              key={i}
                              href="#"
                              className="flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-blue-500/50 transition-colors group"
                            >
                              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                                <FileText className="text-blue-400" size={20} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-medium truncate">
                                  {doc.name}
                                </h4>
                                <p className="text-sm text-slate-500">
                                  {doc.size} • {doc.type.toUpperCase()}
                                </p>
                              </div>
                              <button className="sm:hidden text-sm text-slate-400 group-hover:text-blue-400 transition-colors">
                                Download
                              </button>
                              <Download
                                size={18}
                                className="hidden sm:block text-slate-500 group-hover:text-white shrink-0"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* PROJECT INVOICES TAB (Refactored for mobile first) */}
                    {activeTab === "invoices" && (
                      <div>
                        <h1 className="text-3xl font-bold text-white mb-8">
                          Invoices & Billing
                        </h1>
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                          {projectData.invoices?.length ? (
                            <>
                              {/* Mobile/Tablet View */}
                              <div className="block lg:hidden space-y-3 p-4">
                                {projectData.invoices?.map((inv) => (
                                  <div
                                    key={inv.id}
                                    className="bg-slate-950/20 border border-slate-800 rounded-lg p-4 flex items-center justify-between"
                                  >
                                    <div>
                                      <p className="text-sm text-slate-400">
                                        Invoice #{inv.id}
                                      </p>
                                      <p className="text-white font-medium text-lg">
                                        $
                                        {inv.amount?.toLocaleString?.() ??
                                          inv.amount}
                                      </p>
                                      <p className="text-xs text-slate-400">
                                        Due:{" "}
                                        {formatDateForDisplay(
                                          inv.dueDate ||
                                            inv.date ||
                                            inv.createdAt
                                        )}
                                      </p>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                      <span
                                        className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                                          inv.status === "Paid"
                                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                            : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                        }`}
                                      >
                                        {inv.status}
                                      </span>
                                      <button
                                        onClick={() => downloadInvoicePdf(inv)}
                                        className="text-blue-400 hover:text-white text-xs flex items-center gap-1"
                                      >
                                        <Download size={12} /> Download
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Desktop Table View */}
                              <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                  <thead className="bg-slate-950 text-slate-400 uppercase font-medium">
                                    <tr>
                                      <th className="px-6 py-4">Invoice ID</th>
                                      <th className="px-6 py-4">Date</th>
                                      <th className="px-6 py-4">Amount</th>
                                      <th className="px-6 py-4">Status</th>
                                      <th className="px-6 py-4 text-right">
                                        Action
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-800">
                                    {projectData.invoices?.map((inv) => (
                                      <tr
                                        key={inv.id}
                                        className="hover:bg-slate-800/30 transition-colors"
                                      >
                                        <td className="px-6 py-4 font-medium text-white">
                                          {inv.id}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">
                                          {formatDateForDisplay(
                                            inv.dueDate ||
                                              inv.date ||
                                              inv.createdAt
                                          )}
                                        </td>
                                        <td className="px-6 py-4 text-white font-mono">
                                          ${inv.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                          <span
                                            className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                                              inv.status === "Paid"
                                                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                                : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                            }`}
                                          >
                                            {inv.status}
                                          </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                          <button
                                            onClick={() =>
                                              downloadInvoicePdf(inv)
                                            }
                                            className="text-blue-400 hover:text-white font-medium text-xs"
                                          >
                                            Download
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </>
                          ) : (
                            <p className="text-slate-400 p-4 text-center">
                              No invoices for this project.
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* PROJECT SETTINGS/TESTIMONIALS (Code Omitted for Brevity - No Changes Here) */}
                    {(activeTab === "settings" ||
                      activeTab === "testimonials") && (
                      <div className="max-w-prose">
                        <h2 className="text-2xl font-bold text-white mb-4">
                          Global Account View
                        </h2>
                        <p className="text-slate-400 mb-6">
                          Settings and Testimonials are account-wide features.{" "}
                          <button
                            onClick={() => setSelectedProjectId(null)}
                            className="text-blue-400 underline hover:text-blue-300"
                          >
                            Click here
                          </button>{" "}
                          to return to the global view.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}
