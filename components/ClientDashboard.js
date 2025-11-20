import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
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
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";

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

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [projectData, setProjectData] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      // Real-time listener for project data
      const q = query(
        collection(db, "projects"),
        where("clientId", "==", user.uid)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          // Use the first project found for this demo
          const data = snapshot.docs[0].data();
          setProjectData({ id: snapshot.docs[0].id, ...data });
        } else {
          setProjectData(null);
        }
        setFetching(false);
      });

      return () => unsubscribe();
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
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

      {/* SIDEBAR */}
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

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "documents", label: "Documents", icon: FileText },
            { id: "invoices", label: "Invoices", icon: CreditCard },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
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

      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 w-full z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-4 flex justify-between items-center">
        <span className="font-bold text-white">ClientPortal</span>
        <button onClick={handleLogout}>
          <LogOut size={20} />
        </button>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 lg:pl-64 relative z-10">
        <div className="max-w-5xl mx-auto p-6 pt-24 lg:pt-10">
          {!projectData ? (
            // EMPTY STATE
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
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
            // DASHBOARD CONTENT
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <header>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {projectData.name}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        {projectData.status}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> Due {projectData.dueDate}
                      </span>
                    </div>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                      {/* Progress Section */}
                      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
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
                            animate={{ width: `${projectData.progress}%` }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-purple-600"
                          />
                        </div>
                        <p className="text-sm text-slate-400 text-right">
                          Next: {projectData.nextMilestone}
                        </p>
                      </div>

                      {/* Updates */}
                      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
                        <h3 className="text-xl font-bold text-white mb-6">
                          Recent Activity
                        </h3>
                        <div className="space-y-6">
                          {projectData.updates?.map((update, i) => (
                            <div key={i} className="flex gap-4 group">
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-3 h-3 rounded-full mt-1.5 ${
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
                      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-900/20">
                        <h3 className="font-bold text-lg mb-2">
                          Need Assistance?
                        </h3>
                        <p className="text-blue-100 text-sm mb-4">
                          Schedule a call directly with the development team.
                        </p>
                        <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 py-2 rounded-lg text-sm font-semibold transition-colors">
                          Book Meeting
                        </button>
                      </div>

                      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h3 className="font-bold text-white mb-4">
                          Quick Links
                        </h3>
                        <div className="space-y-2">
                          {projectData.documents?.slice(0, 2).map((doc, i) => (
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
                    </div>
                  </div>
                </motion.div>
              )}

              {/* DOCUMENTS TAB */}
              {activeTab === "documents" && (
                <motion.div
                  key="documents"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h1 className="text-3xl font-bold text-white mb-8">
                    Project Documents
                  </h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projectData.documents?.map((doc, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-blue-500/50 transition-colors group cursor-pointer"
                      >
                        <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
                          <FileText className="text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium truncate">
                            {doc.name}
                          </h4>
                          <p className="text-sm text-slate-500">
                            {doc.size} • {doc.type.toUpperCase()}
                          </p>
                        </div>
                        <button className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
                          <Download size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* INVOICES TAB */}
              {activeTab === "invoices" && (
                <motion.div
                  key="invoices"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h1 className="text-3xl font-bold text-white mb-8">
                    Invoices & Billing
                  </h1>
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-950 text-slate-400 uppercase font-medium">
                        <tr>
                          <th className="px-6 py-4">Invoice ID</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Amount</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Action</th>
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
                              {inv.date}
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
                              <button className="text-blue-400 hover:text-white font-medium text-xs">
                                Download
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-2xl"
                >
                  <h1 className="text-3xl font-bold text-white mb-8">
                    Account Settings
                  </h1>
                  <div className="space-y-6">
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                      <h3 className="text-xl font-bold text-white mb-4">
                        Profile Information
                      </h3>
                      <div className="grid gap-4">
                        <div>
                          <label className="block text-sm text-slate-400 mb-1">
                            Email Address
                          </label>
                          <input
                            disabled
                            value={user.email}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-500 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-400 mb-1">
                            Display Name
                          </label>
                          <input
                            placeholder="Enter your name"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                          />
                        </div>
                        <button className="w-max px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors">
                          Save Changes
                        </button>
                      </div>
                    </div>
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
