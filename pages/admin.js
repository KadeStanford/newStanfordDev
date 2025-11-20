import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  updateDoc,
  doc as firestoreDoc,
  deleteDoc,
  arrayUnion,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  Users,
  Plus,
  Briefcase,
  LayoutDashboard,
  ArrowLeft,
  LogOut,
  ShieldAlert,
  Mail as MailIcon,
} from "lucide-react";
import AdminMailConsole from "../components/AdminMailConsole";
import { toast } from "sonner";
import { generateInvoicePdf } from "../lib/generateInvoicePdf";

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showMailConsole, setShowMailConsole] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [newUpdateText, setNewUpdateText] = useState("");
  const [editingUpdateIndex, setEditingUpdateIndex] = useState(null);
  const [editingUpdateText, setEditingUpdateText] = useState("");

  // Invoice form state
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceDescription, setInvoiceDescription] = useState("");
  const [invoiceDueDate, setInvoiceDueDate] = useState("");

  // Itemized invoice state and edit mode
  const [invoiceItems, setInvoiceItems] = useState([
    { description: "", qty: 1, unitPrice: 0 },
  ]);
  const [editingInvoice, setEditingInvoice] = useState(null);

  // Company information (customize as needed)
  const COMPANY_INFO = {
    name: "Stanford Dev Solutions",
    address: "19260 White Road Norwood LA 70761",
    email: "Stanforddevcontact@gmail.com",
    phone: "(225) 244-5660",
  };

  // Date helpers to preserve user's local date selection and display in their timezone
  const dateInputToISOStringLocal = (dateStr) => {
    // dateStr expected in YYYY-MM-DD from <input type="date"> and should be interpreted in the user's local timezone
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-").map((s) => Number(s));
    const dt = new Date(y, m - 1, d);
    return dt.toISOString();
  };

  const isoToDateInput = (iso) => {
    if (!iso) return "";
    try {
      const dt = new Date(iso);
      if (isNaN(dt)) return "";
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      const d = String(dt.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    } catch (e) {
      return "";
    }
  };

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

  // Form State
  const [projectName, setProjectName] = useState("");
  const [budget, setBudget] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Fetch users only if Admin
  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "admin") {
        toast.error("Access Denied: Admins only.");
        router.push("/dashboard");
        return;
      }
      fetchUsers();
      fetchProjects();
    }
  }, [user, loading, router]);

  const fetchProjects = async () => {
    try {
      const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProjects(list);
      return list;
    } catch (err) {
      console.error("Error fetching projects:", err);
      toast.error("Failed to load projects.");
    }
  };

  const handleSelectProject = (p) => {
    setSelectedProject(p);
    setEditProject({ ...p });
    setSelectedUser(null);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!selectedProject || !editProject) return;
    try {
      const ref = firestoreDoc(db, "projects", selectedProject.id);
      const payload = {
        name: editProject.name,
        status: editProject.status,
        progress: Number(editProject.progress),
        budget: Number(editProject.budget),
        paid: Number(editProject.paid || 0),
        nextMilestone: editProject.nextMilestone,
        dueDate: editProject.dueDate,
      };
      await updateDoc(ref, payload);
      toast.success("Project updated");
      // Refresh projects and keep the project open with updated data
      const updatedList = await fetchProjects();
      const refreshed = updatedList.find((p) => p.id === selectedProject.id);
      if (refreshed) {
        setSelectedProject(refreshed);
        setEditProject({ ...refreshed });
      } else {
        setSelectedProject({ ...selectedProject, ...payload });
        setEditProject({ ...selectedProject, ...payload });
      }
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update project.");
    }
  };

  const handleCreateInvoice = async (e) => {
    e?.preventDefault?.();
    if (!selectedProject) return;

    // calculate total from items
    const total = invoiceItems.reduce(
      (s, it) => s + Number(it.qty || 0) * Number(it.unitPrice || 0),
      0
    );

    if (!invoiceNumber.trim()) {
      toast.error("Please provide invoice number.");
      return;
    }

    try {
      const invoicePayload = {
        projectId: selectedProject.id,
        number: invoiceNumber.trim(),
        amount: Number(total),
        description: invoiceDescription || "",
        dueDate: invoiceDueDate || "",
        status: editingInvoice?.status || "Unpaid",
        items: invoiceItems,
        createdAt: serverTimestamp(),
      };

      if (editingInvoice) {
        // Update existing invoice doc
        const invRef = firestoreDoc(db, "invoices", editingInvoice.id);
        await updateDoc(invRef, invoicePayload);

        // Update project summary entry
        const projRef = firestoreDoc(db, "projects", selectedProject.id);
        const projSnap = await getDoc(projRef);
        if (projSnap.exists()) {
          const projData = projSnap.data();
          const updatedSummaries = (projData.invoices || []).map((s) =>
            s.id === editingInvoice.id
              ? {
                  id: editingInvoice.id,
                  number: invoicePayload.number,
                  amount: invoicePayload.amount,
                  dueDate: invoicePayload.dueDate,
                  status: invoicePayload.status,
                }
              : s
          );
          await updateDoc(projRef, { invoices: updatedSummaries });
        }

        toast.success("Invoice updated");
        setEditingInvoice(null);
      } else {
        // Create new invoice
        const invRef = await addDoc(collection(db, "invoices"), invoicePayload);

        // Link summary to project
        const projRef = firestoreDoc(db, "projects", selectedProject.id);
        const summary = {
          id: invRef.id,
          number: invoicePayload.number,
          amount: invoicePayload.amount,
          dueDate: invoicePayload.dueDate,
          status: invoicePayload.status,
        };
        await updateDoc(projRef, { invoices: arrayUnion(summary) });

        toast.success("Invoice created and linked to project");

        // Prepare full invoice object and download PDF
        const fullInvoice = { id: invRef.id, ...invoicePayload };
        await downloadInvoicePdfAdmin(fullInvoice);
      }

      // Reset form
      setInvoiceNumber("");
      setInvoiceAmount("");
      setInvoiceDescription("");
      setInvoiceDueDate("");
      setInvoiceItems([{ description: "", qty: 1, unitPrice: 0 }]);

      // Refresh and keep selected
      const updatedList = await fetchProjects();
      const refreshed = updatedList.find((p) => p.id === selectedProject.id);
      if (refreshed) {
        setSelectedProject(refreshed);
        setEditProject({ ...refreshed });
      }
    } catch (err) {
      console.error("Create invoice failed:", err);
      toast.error("Failed to create or update invoice.");
    }
  };

  // Generate and download a nicely formatted invoice PDF.
  // If a lightweight invoice summary is passed (from project.invoices),
  // attempt to fetch the full invoice doc from `invoices` collection to include description and createdAt.
  const downloadInvoicePdfAdmin = async (invSummary) => {
    try {
      let invoiceData = invSummary || {};
      if (invSummary?.id) {
        try {
          const snap = await getDoc(
            firestoreDoc(db, "invoices", invSummary.id)
          );
          if (snap.exists()) invoiceData = { id: snap.id, ...snap.data() };
        } catch (e) {
          console.warn("Could not fetch full invoice doc, using summary", e);
        }
      }

      const { blob, filename } = await generateInvoicePdf(
        invoiceData,
        COMPANY_INFO
      );
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
      console.error("Failed to generate invoice PDF:", err);
      toast.error(
        "Failed to generate PDF. Install 'jspdf' or allow popups to use print fallback."
      );
    }
  };

  // Edit an existing invoice: load full invoice data into form
  const editInvoice = async (invSummary) => {
    try {
      let inv = invSummary;
      if (invSummary?.id) {
        const snap = await getDoc(firestoreDoc(db, "invoices", invSummary.id));
        if (snap.exists()) inv = { id: snap.id, ...snap.data() };
      }
      setEditingInvoice({ id: inv.id, status: inv.status });
      setInvoiceNumber(inv.number || "");
      setInvoiceDescription(inv.description || "");
      setInvoiceDueDate(inv.dueDate || "");
      setInvoiceItems(inv.items || [{ description: "", qty: 1, unitPrice: 0 }]);
      // scroll to form or keep UI focused
    } catch (err) {
      console.error("Failed to load invoice for edit:", err);
      toast.error("Failed to load invoice for editing.");
    }
  };

  const deleteInvoice = async (invSummary) => {
    if (!invSummary?.id) return;
    if (!confirm("Delete this invoice? This cannot be undone.")) return;
    try {
      // delete invoice doc
      const invRef = firestoreDoc(db, "invoices", invSummary.id);
      await deleteDoc(invRef);

      // remove from project summaries
      const projRef = firestoreDoc(db, "projects", selectedProject.id);
      const projSnap = await getDoc(projRef);
      if (projSnap.exists()) {
        const projData = projSnap.data();
        const updated = (projData.invoices || []).filter(
          (s) => s.id !== invSummary.id
        );
        await updateDoc(projRef, { invoices: updated });
      }

      toast.success("Invoice deleted");
      const updatedList = await fetchProjects();
      const refreshed = updatedList.find((p) => p.id === selectedProject.id);
      if (refreshed) {
        setSelectedProject(refreshed);
        setEditProject({ ...refreshed });
      }
    } catch (err) {
      console.error("Failed to delete invoice:", err);
      toast.error("Failed to delete invoice.");
    }
  };

  const markInvoicePaid = async (invSummary) => {
    if (!invSummary?.id) return;
    try {
      // Fetch current invoice status so we can toggle
      const invRef = firestoreDoc(db, "invoices", invSummary.id);
      const invSnap = await getDoc(invRef);
      if (!invSnap.exists()) return;
      const currentStatus = invSnap.data()?.status || "Unpaid";
      const newStatus = currentStatus === "Paid" ? "Unpaid" : "Paid";

      // Update invoice doc with toggled status
      await updateDoc(invRef, { status: newStatus });

      // update project summary entry to reflect new status
      const projRef = firestoreDoc(db, "projects", selectedProject.id);
      const projSnap = await getDoc(projRef);
      if (projSnap.exists()) {
        const projData = projSnap.data();
        const updatedSummaries = (projData.invoices || []).map((s) =>
          s.id === invSummary.id ? { ...s, status: newStatus } : s
        );
        await updateDoc(projRef, { invoices: updatedSummaries });
      }

      toast.success(`Invoice marked ${newStatus.toLowerCase()}`);
      const updatedList = await fetchProjects();
      const refreshed = updatedList.find((p) => p.id === selectedProject.id);
      if (refreshed) {
        setSelectedProject(refreshed);
        setEditProject({ ...refreshed });
      }
    } catch (err) {
      console.error("Failed to toggle invoice status:", err);
      toast.error("Failed to update invoice status.");
    }
  };

  const handleAddUpdate = async () => {
    if (!selectedProject || !newUpdateText.trim()) return;
    try {
      const ref = firestoreDoc(db, "projects", selectedProject.id);
      const updateEntry = {
        title: newUpdateText.trim(),
        date: new Date().toLocaleString(),
        type: "info",
      };
      await updateDoc(ref, { updates: arrayUnion(updateEntry) });
      toast.success("Update added");
      setNewUpdateText("");
      const updatedList = await fetchProjects();
      const refreshed = updatedList.find((p) => p.id === selectedProject.id);
      if (refreshed) {
        setSelectedProject(refreshed);
        setEditProject({ ...refreshed });
      }
    } catch (err) {
      console.error("Add update failed:", err);
      toast.error("Failed to add update.");
    }
  };

  // Start editing a specific update (by its array index)
  const startEditUpdate = (index) => {
    if (!selectedProject) return;
    const updates = selectedProject.updates || [];
    const u = updates[index];
    if (!u) return;
    setEditingUpdateIndex(index);
    setEditingUpdateText(u.title || "");
  };

  const cancelEditUpdate = () => {
    setEditingUpdateIndex(null);
    setEditingUpdateText("");
  };

  const saveEditedUpdate = async () => {
    if (editingUpdateIndex === null || !selectedProject) return;
    try {
      const ref = firestoreDoc(db, "projects", selectedProject.id);
      const snap = await getDoc(ref);
      if (!snap.exists()) throw new Error("Project not found");
      const projData = snap.data();
      const updates = projData.updates || [];
      const updated = updates.map((item, idx) =>
        idx === editingUpdateIndex
          ? {
              ...item,
              title: editingUpdateText.trim(),
              date: new Date().toLocaleString(),
            }
          : item
      );
      await updateDoc(ref, { updates: updated });
      toast.success("Update saved");
      const updatedList = await fetchProjects();
      const refreshed = updatedList.find((p) => p.id === selectedProject.id);
      if (refreshed) {
        setSelectedProject(refreshed);
        setEditProject({ ...refreshed });
      }
      setEditingUpdateIndex(null);
      setEditingUpdateText("");
    } catch (err) {
      console.error("Save edited update failed:", err);
      toast.error("Failed to save update.");
    }
  };

  const deleteUpdateAtIndex = async (index) => {
    if (!selectedProject) return;
    if (!confirm("Delete this update? This cannot be undone.")) return;
    try {
      const ref = firestoreDoc(db, "projects", selectedProject.id);
      const snap = await getDoc(ref);
      if (!snap.exists()) throw new Error("Project not found");
      const projData = snap.data();
      const updates = projData.updates || [];
      const updated = updates.filter((_, i) => i !== index);
      await updateDoc(ref, { updates: updated });
      toast.success("Update deleted");
      const updatedList = await fetchProjects();
      const refreshed = updatedList.find((p) => p.id === selectedProject.id);
      if (refreshed) {
        setSelectedProject(refreshed);
        setEditProject({ ...refreshed });
      }
    } catch (err) {
      console.error("Delete update failed:", err);
      toast.error("Failed to delete update.");
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    if (!confirm("Delete this project? This action cannot be undone.")) return;
    try {
      const ref = firestoreDoc(db, "projects", selectedProject.id);
      await deleteDoc(ref);
      toast.success("Project deleted");
      await fetchProjects();
      setSelectedProject(null);
      setEditProject(null);
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete project.");
    }
  };

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, "users"));
      const querySnapshot = await getDocs(q);
      const usersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users.");
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      // Create the project document linked to the selected user
      await addDoc(collection(db, "projects"), {
        clientId: selectedUser.id, // LINKING: This connects the project to the client's dashboard
        name: projectName,
        status: "Just Started",
        progress: 0,
        budget: Number(budget),
        paid: 0,
        nextMilestone: "Project Kickoff",
        dueDate: dueDate,
        createdAt: serverTimestamp(),
        updates: [
          { title: "Project Created", date: "Just now", type: "neutral" },
        ],
        documents: [],
        invoices: [],
      });

      toast.success(`Project created for ${selectedUser.email}`);

      // Reset form
      setProjectName("");
      setBudget("");
      setDueDate("");
      setSelectedUser(null);
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-8">
      <header className="max-w-6xl mx-auto mb-10 flex justify-between items-center border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <ShieldAlert className="text-red-500" /> Admin Control Center
          </h1>
          <p className="text-slate-400">Manage clients and deploy projects.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-white font-medium">{user?.email}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">
              Administrator
            </p>
          </div>
          <button
            onClick={() => setShowMailConsole(true)}
            title="Mail Console"
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <MailIcon size={18} />
          </button>
          <button
            onClick={logout}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>
      {/* Mail Console Slide-over */}
      {showMailConsole && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMailConsole(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full md:w-1/2 lg:w-1/3 p-6">
            <div className="h-full bg-slate-900 border border-slate-800 rounded-l-2xl p-6 overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Mail Console</h3>
                <button
                  onClick={() => setShowMailConsole(false)}
                  className="px-3 py-2 bg-slate-800 rounded"
                >
                  Close
                </button>
              </div>
              <AdminMailConsole />
            </div>
          </div>
        </div>
      )}
      {/* LEFT: User List */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 h-fit">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users size={20} className="text-blue-500" /> Client Database
          </h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {users.length === 0 && (
              <p className="text-slate-500 text-sm">No users found.</p>
            )}
            {users.map((u) => (
              <div
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedUser?.id === u.id
                    ? "bg-blue-600/20 border-blue-500"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex justify-between items-start">
                  <p className="text-white font-medium truncate w-full">
                    {u.email}
                  </p>
                  {u.role === "admin" && (
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded uppercase font-bold">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate mt-1">
                  UID: {u.id}
                </p>
              </div>
            ))}
            {/* Projects List */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <h3 className="text-sm text-slate-400 uppercase tracking-wide mb-3">
                Projects
              </h3>
              {projects.length === 0 && (
                <p className="text-slate-500 text-sm">No projects found.</p>
              )}
              {projects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelectProject(p)}
                  className={`p-3 rounded-lg border mb-2 cursor-pointer transition-all ${
                    selectedProject?.id === p.id
                      ? "bg-purple-600/10 border-purple-500"
                      : "bg-slate-950 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="truncate">
                      <p className="text-sm text-white font-medium truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {p.clientId} • {p.status}
                      </p>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      ${p.budget?.toLocaleString?.() ?? p.budget}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Action Panel */}
        <div className="lg:col-span-2">
          {selectedProject ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Manage Project
                  </h2>
                  <p className="text-slate-400">
                    Project:{" "}
                    <span className="text-blue-400 font-mono">
                      {selectedProject.name}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedProject(null);
                      setEditProject(null);
                    }}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <button
                    onClick={handleDeleteProject}
                    className="p-2 bg-red-700/20 text-red-400 rounded-lg hover:bg-red-700/30"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveProject} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Project Name
                  </label>
                  <input
                    value={editProject?.name || ""}
                    onChange={(e) =>
                      setEditProject({ ...editProject, name: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Status
                    </label>
                    <select
                      value={editProject?.status || "Just Started"}
                      onChange={(e) =>
                        setEditProject({
                          ...editProject,
                          status: e.target.value,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white"
                    >
                      <option>Just Started</option>
                      <option>In Progress</option>
                      <option>Paused</option>
                      <option>Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Progress (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editProject?.progress ?? 0}
                      onChange={(e) =>
                        setEditProject({
                          ...editProject,
                          progress: e.target.value,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Budget ($)
                    </label>
                    <input
                      type="number"
                      value={editProject?.budget ?? 0}
                      onChange={(e) =>
                        setEditProject({
                          ...editProject,
                          budget: e.target.value,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Paid ($)
                    </label>
                    <input
                      type="number"
                      value={editProject?.paid ?? 0}
                      onChange={(e) =>
                        setEditProject({ ...editProject, paid: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Next Milestone
                    </label>
                    <input
                      value={editProject?.nextMilestone || ""}
                      onChange={(e) =>
                        setEditProject({
                          ...editProject,
                          nextMilestone: e.target.value,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={
                        editProject?.dueDate
                          ? isoToDateInput(editProject.dueDate)
                          : ""
                      }
                      onChange={(e) =>
                        setEditProject({
                          ...editProject,
                          dueDate: dateInputToISOStringLocal(e.target.value),
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditProject({ ...selectedProject });
                      setNewUpdateText("");
                    }}
                    className="px-4 py-3 bg-slate-800 text-white rounded-lg"
                  >
                    Reset
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Updates
                </h3>
                <div className="flex gap-2 mb-3">
                  <input
                    value={newUpdateText}
                    onChange={(e) => setNewUpdateText(e.target.value)}
                    placeholder="Write an update..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white"
                  />
                  <button
                    onClick={handleAddUpdate}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-3">
                  {(() => {
                    const updates = selectedProject.updates || [];
                    const displayed = updates.slice().reverse();
                    return displayed.map((u, i) => {
                      const originalIndex = updates.length - 1 - i;
                      const isEditing = editingUpdateIndex === originalIndex;
                      return (
                        <div
                          key={originalIndex}
                          className="p-3 bg-slate-950/30 rounded-lg border border-slate-800"
                        >
                          {isEditing ? (
                            <div className="flex flex-col gap-2">
                              <textarea
                                value={editingUpdateText}
                                onChange={(e) =>
                                  setEditingUpdateText(e.target.value)
                                }
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                                rows={3}
                              />
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={cancelEditUpdate}
                                  className="px-3 py-1 bg-slate-800 rounded text-sm text-slate-300"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={saveEditedUpdate}
                                  className="px-3 py-1 bg-blue-600 rounded text-sm text-white"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm text-white font-medium">
                                  {u.title}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {u.date}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 mr-3">
                                  {u.type}
                                </span>
                                <button
                                  onClick={() => startEditUpdate(originalIndex)}
                                  className="px-3 py-1 bg-slate-800 rounded text-sm text-yellow-400 hover:text-white"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    deleteUpdateAtIndex(originalIndex)
                                  }
                                  className="px-3 py-1 bg-red-800 rounded text-sm text-red-300 hover:text-white"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
              {/* Invoices Section */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Invoices
                </h3>

                <form onSubmit={handleCreateInvoice} className="mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      required
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      placeholder="Invoice #"
                      className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white"
                    />

                    <input
                      type="date"
                      value={
                        invoiceDueDate ? isoToDateInput(invoiceDueDate) : ""
                      }
                      onChange={(e) =>
                        setInvoiceDueDate(
                          dateInputToISOStringLocal(e.target.value)
                        )
                      }
                      className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white"
                    />

                    <div className="col-span-1 md:col-span-2 flex items-center gap-2">
                      <div className="flex-1">
                        <input
                          value={invoiceDescription}
                          onChange={(e) =>
                            setInvoiceDescription(e.target.value)
                          }
                          placeholder="Description (optional)"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Items editor */}
                  <div className="mt-3 space-y-2">
                    {invoiceItems.map((it, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-12 gap-2 items-center"
                      >
                        <input
                          className="col-span-7 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                          placeholder="Item description"
                          value={it.description}
                          onChange={(e) => {
                            const next = [...invoiceItems];
                            next[i].description = e.target.value;
                            setInvoiceItems(next);
                          }}
                        />
                        <input
                          type="number"
                          className="col-span-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                          value={it.qty}
                          min={1}
                          onChange={(e) => {
                            const next = [...invoiceItems];
                            next[i].qty = Number(e.target.value);
                            setInvoiceItems(next);
                          }}
                        />
                        <input
                          type="number"
                          className="col-span-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                          value={it.unitPrice}
                          min={0}
                          onChange={(e) => {
                            const next = [...invoiceItems];
                            next[i].unitPrice = Number(e.target.value);
                            setInvoiceItems(next);
                          }}
                        />
                        <div className="col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              const next = invoiceItems.filter(
                                (_, idx) => idx !== i
                              );
                              setInvoiceItems(
                                next.length
                                  ? next
                                  : [{ description: "", qty: 1, unitPrice: 0 }]
                              );
                            }}
                            className="px-2 py-1 bg-red-700/20 rounded text-sm text-red-300"
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    ))}

                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          setInvoiceItems([
                            ...invoiceItems,
                            { description: "", qty: 1, unitPrice: 0 },
                          ])
                        }
                        className="px-3 py-2 bg-slate-800 rounded text-sm text-slate-200"
                      >
                        + Add Item
                      </button>
                    </div>
                  </div>

                  {/* Totals and actions */}
                  <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-400">Total</p>
                      <p className="text-xl font-bold text-white">
                        $
                        {invoiceItems
                          .reduce(
                            (s, it) =>
                              s +
                              Number(it.qty || 0) * Number(it.unitPrice || 0),
                            0
                          )
                          .toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-3 bg-green-600 text-white rounded-lg"
                      >
                        {editingInvoice
                          ? "Save Invoice"
                          : "Create & Link Invoice"}
                      </button>
                      {editingInvoice && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingInvoice(null);
                            setInvoiceNumber("");
                            setInvoiceDescription("");
                            setInvoiceDueDate("");
                            setInvoiceItems([
                              { description: "", qty: 1, unitPrice: 0 },
                            ]);
                          }}
                          className="px-4 py-3 bg-slate-800 text-white rounded-lg"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </form>

                <div className="space-y-3">
                  {(selectedProject.invoices || [])
                    .slice()
                    .reverse()
                    .map((inv, idx) => (
                      <div
                        key={inv.id || idx}
                        className="p-3 bg-slate-950/20 rounded-lg border border-slate-800 flex justify-between items-center"
                      >
                        <div>
                          <p className="text-sm text-white font-medium">
                            #{inv.number} — $
                            {inv.amount?.toLocaleString?.() ?? inv.amount}
                          </p>
                          <p className="text-xs text-slate-400">
                            Due: {inv.dueDate || "—"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-slate-400 mr-2">
                            {inv.status || "Unpaid"}
                          </div>
                          <button
                            onClick={() => downloadInvoicePdfAdmin(inv)}
                            className="px-3 py-1 bg-slate-800 rounded text-sm text-blue-400 hover:text-white"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => editInvoice(inv)}
                            className="px-3 py-1 bg-slate-800 rounded text-sm text-yellow-400 hover:text-white"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => markInvoicePaid(inv)}
                            className={`px-3 py-1 bg-slate-800 rounded text-sm ${
                              inv.status === "Paid"
                                ? "text-yellow-400"
                                : "text-green-400"
                            } hover:text-white`}
                          >
                            {inv.status === "Paid"
                              ? "Mark Unpaid"
                              : "Mark Paid"}
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch("/api/mail/reminder", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({ invoiceId: inv.id }),
                                });
                                const data = await res.json();
                                if (data.ok) {
                                  toast.success("Reminder sent");
                                } else {
                                  toast.error(
                                    "Reminder failed: " +
                                      (data.error || "unknown")
                                  );
                                }
                              } catch (err) {
                                console.error("Reminder send failed", err);
                                toast.error("Failed to send reminder");
                              }
                            }}
                            className="px-3 py-1 bg-slate-800 rounded text-sm text-amber-400 hover:text-white"
                          >
                            Send Reminder
                          </button>
                          <button
                            onClick={() => deleteInvoice(inv)}
                            className="px-3 py-1 bg-red-800 rounded text-sm text-red-300 hover:text-white"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : selectedUser ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Start New Project
                  </h2>
                  <p className="text-slate-400">
                    Selected Client:{" "}
                    <span className="text-blue-400 font-mono">
                      {selectedUser.email}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Project Name
                  </label>
                  <input
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                    placeholder="e.g. Corporate Website Redesign"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Total Budget ($)
                    </label>
                    <input
                      required
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Due Date
                    </label>
                    <input
                      required
                      type="date"
                      value={dueDate ? isoToDateInput(dueDate) : ""}
                      onChange={(e) =>
                        setDueDate(dateInputToISOStringLocal(e.target.value))
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                      placeholder=""
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-95">
                    <Plus size={20} /> Create Project & Initialize Dashboard
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl p-12 bg-slate-900/20">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Briefcase size={32} className="text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-300 mb-2">
                No Client Selected
              </h3>
              <p className="text-sm max-w-xs text-center">
                Select a client from the database list on the left to manage
                their account or start a new project.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
