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
} from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  Users,
  Plus,
  Briefcase,
  ArrowLeft,
  LogOut,
  ShieldAlert,
  Mail as MailIcon,
  MessageSquare,
} from "lucide-react";
import AdminMailConsole from "../components/AdminMailConsole";
import { toast } from "sonner";
import { generateInvoicePdf } from "../lib/generateInvoicePdf";

// --- Tabbed Interface Components ---

// Testimonial Management Panel
const TestimonialPanel = ({
  testimonials,
  testimonialsLoading,
  formatDateForDisplay,
  approveTestimonial,
  toggleFeatured,
  setDisplayOrder,
  deleteTestimonial,
}) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 h-full">
    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
      <MessageSquare className="text-blue-400" size={24} /> Manage Testimonials
    </h2>

    {testimonialsLoading ? (
      <p className="text-sm text-slate-400">Loading testimonials...</p>
    ) : testimonials.length === 0 ? (
      <p className="text-sm text-slate-400">No testimonials found.</p>
    ) : (
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-3">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="p-4 bg-slate-950/20 rounded-xl border border-slate-800 flex justify-between gap-6 items-start"
          >
            <div className="flex-1">
              <p className="text-sm text-white font-medium">
                {t.name} {t.company ? `— ${t.company}` : ""}
              </p>
              <p className="text-xs text-slate-500 mb-2">
                Created: {formatDateForDisplay(t.createdAt)}
              </p>
              <p className="text-sm text-slate-200 italic">
                &quot;{t.message}&quot;
              </p>
            </div>
            <div className="w-56 flex flex-col items-end gap-2 flex-shrink-0">
              <div className="flex justify-between w-full text-xs font-medium border-b border-slate-700 pb-1 mb-1">
                <span
                  className={t.approved ? "text-green-400" : "text-red-400"}
                >
                  {t.approved ? "Approved" : "Unapproved"}
                </span>
                <span
                  className={t.featured ? "text-amber-400" : "text-slate-500"}
                >
                  {t.featured ? "Featured" : "Not Featured"}
                </span>
                <span className="text-slate-400">
                  Order: {t.displayOrder ?? 0}
                </span>
              </div>

              {!t.approved && (
                <button
                  onClick={() => approveTestimonial(t)}
                  className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm text-white w-full transition-colors"
                >
                  Approve
                </button>
              )}
              <button
                onClick={() => toggleFeatured(t)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-sm text-amber-400 w-full transition-colors"
              >
                {t.featured ? "Unfeature" : "Feature"}
              </button>
              <button
                onClick={() => setDisplayOrder(t)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-sm text-slate-300 w-full transition-colors"
              >
                Set Order
              </button>
              <button
                onClick={() => deleteTestimonial(t)}
                className="px-3 py-1 bg-red-700/30 hover:bg-red-700/50 rounded text-sm text-red-300 w-full transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAllProjects, setShowAllProjects] = useState(false);
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

  // Testimonials admin state
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);

  const COMPANY_INFO = {
    name: "Stanford Dev Solutions",
    address: "19260 White Road Norwood LA 70761",
    email: "Stanforddevcontact@gmail.com",
    phone: "(225) 244-5660",
  };

  // Date helpers
  const dateInputToISOStringLocal = (dateStr) => {
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
      if (val?.toDate) return val.toDate().toLocaleDateString();
      const dt = new Date(val);
      if (isNaN(dt)) return String(val);
      return dt.toLocaleDateString();
    } catch (e) {
      return String(val);
    }
  };

  // Form State for New Project
  const [projectName, setProjectName] = useState("");
  const [budget, setBudget] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "admin") {
        toast.error("Access Denied: Admins only.");
        router.push("/dashboard");
        return;
      }
      fetchUsers();
      fetchProjects();
      fetchTestimonials();
    }
  }, [user, loading, router]);

  // --- Testimonial Handlers ---
  const fetchTestimonials = async () => {
    setTestimonialsLoading(true);
    try {
      const q = query(
        collection(db, "testimonials"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTestimonials(list);
    } catch (err) {
      console.error("Failed to fetch testimonials", err);
      toast.error("Failed to load testimonials");
    } finally {
      setTestimonialsLoading(false);
    }
  };

  const approveTestimonial = async (t) => {
    try {
      const ref = firestoreDoc(db, "testimonials", t.id);
      await updateDoc(ref, { approved: true });
      toast.success("Testimonial approved");
      fetchTestimonials();
    } catch (err) {
      console.error("Approve failed", err);
      toast.error("Failed to approve testimonial");
    }
  };

  const toggleFeatured = async (t) => {
    try {
      const ref = firestoreDoc(db, "testimonials", t.id);
      await updateDoc(ref, { featured: !t.featured });
      toast.success(t.featured ? "Unfeatured" : "Featured");
      fetchTestimonials();
    } catch (err) {
      console.error("Toggle feature failed", err);
      toast.error("Failed to update testimonial");
    }
  };

  const setDisplayOrder = async (t) => {
    try {
      const val = window.prompt(
        "Enter display order (integer, lower shows first)",
        String(t.displayOrder || 0)
      );
      if (val === null) return;
      const num = Number(val);
      if (Number.isNaN(num)) {
        toast.error("Invalid number");
        return;
      }
      const ref = firestoreDoc(db, "testimonials", t.id);
      await updateDoc(ref, { displayOrder: num });
      toast.success("Display order updated");
      fetchTestimonials();
    } catch (err) {
      console.error("Set order failed", err);
      toast.error("Failed to set order");
    }
  };

  const deleteTestimonial = async (t) => {
    try {
      const ok = window.confirm(
        "Delete this testimonial? This cannot be undone."
      );
      if (!ok) return;
      const ref = firestoreDoc(db, "testimonials", t.id);
      await deleteDoc(ref);
      toast.success("Testimonial deleted");
      fetchTestimonials();
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete testimonial");
    }
  };

  // --- Project and User Handlers ---

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
    setActiveTab("projects");
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
        // --- ADDED: Save GA Property ID ---
        gaPropertyId: editProject.gaPropertyId || "",
      };
      await updateDoc(ref, payload);
      toast.success("Project updated");

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
        const invRef = firestoreDoc(db, "invoices", editingInvoice.id);
        await updateDoc(invRef, invoicePayload);

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
        const invRef = await addDoc(collection(db, "invoices"), invoicePayload);
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
        const fullInvoice = { id: invRef.id, ...invoicePayload };
        await downloadInvoicePdfAdmin(fullInvoice);
      }

      setInvoiceNumber("");
      setInvoiceAmount("");
      setInvoiceDescription("");
      setInvoiceDueDate("");
      setInvoiceItems([{ description: "", qty: 1, unitPrice: 0 }]);

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
    } catch (err) {
      console.error("Failed to load invoice for edit:", err);
      toast.error("Failed to load invoice for editing.");
    }
  };

  const deleteInvoice = async (invSummary) => {
    if (!invSummary?.id) return;
    if (!confirm("Delete this invoice? This cannot be undone.")) return;
    try {
      const invRef = firestoreDoc(db, "invoices", invSummary.id);
      await deleteDoc(invRef);

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
      const invRef = firestoreDoc(db, "invoices", invSummary.id);
      const invSnap = await getDoc(invRef);
      if (!invSnap.exists()) return;
      const currentStatus = invSnap.data()?.status || "Unpaid";
      const newStatus = currentStatus === "Paid" ? "Unpaid" : "Paid";

      await updateDoc(invRef, { status: newStatus });

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
      setActiveTab("dashboard");
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
      await addDoc(collection(db, "projects"), {
        clientId: selectedUser.id,
        name: projectName,
        status: "Just Started",
        progress: 0,
        budget: Number(budget),
        paid: 0,
        nextMilestone: "Project Kickoff",
        dueDate: dueDate,
        // --- ADDED: Init GA Property ID ---
        gaPropertyId: "",
        createdAt: serverTimestamp(),
        updates: [
          { title: "Project Created", date: "Just now", type: "neutral" },
        ],
        documents: [],
        invoices: [],
      });

      toast.success(`Project created for ${selectedUser.email}`);

      setProjectName("");
      setBudget("");
      setDueDate("");
      setSelectedUser(null);
      fetchProjects();
      setActiveTab("projects");
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project.");
    }
  };

  const renderRightPanelContent = () => {
    if (activeTab === "testimonials") {
      return (
        <TestimonialPanel
          testimonials={testimonials}
          testimonialsLoading={testimonialsLoading}
          formatDateForDisplay={formatDateForDisplay}
          approveTestimonial={approveTestimonial}
          toggleFeatured={toggleFeatured}
          setDisplayOrder={setDisplayOrder}
          deleteTestimonial={deleteTestimonial}
        />
      );
    }

    if (selectedProject) {
      return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <div className="mb-6 border-b border-slate-800 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <button
                  onClick={() => {
                    setSelectedProject(null);
                    setEditProject(null);
                  }}
                  aria-label="Back to projects"
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="min-w-0">
                  <h2 className="text-2xl font-bold text-white truncate">
                    {selectedProject.name}
                  </h2>
                  <div className="mt-1 flex items-center gap-3 text-sm text-slate-400">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-200">
                      {editProject?.status || selectedProject.status}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">Client:</span>
                    <span className="font-mono text-slate-300">
                      {selectedProject.clientId}
                    </span>
                  </div>
                  <div className="mt-3 w-72 max-w-full">
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{
                          width: `${Number(
                            editProject?.progress ??
                              selectedProject.progress ??
                              0
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-slate-400">
                      Progress:{" "}
                      {Number(
                        editProject?.progress ?? selectedProject.progress ?? 0
                      )}
                      %
                      <span className="ml-3 text-slate-500">
                        Budget: $
                        {Number(
                          editProject?.budget ?? selectedProject.budget ?? 0
                        ).toLocaleString()}
                      </span>
                      <span className="ml-3 text-slate-500">
                        Paid: $
                        {Number(
                          editProject?.paid ?? selectedProject.paid ?? 0
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDeleteProject}
                  className="px-3 py-2 bg-red-700/20 text-red-400 rounded-lg hover:bg-red-700/30"
                >
                  Delete
                </button>
                <button
                  onClick={async () => {
                    if (!selectedProject) return;
                    try {
                      let live = window.prompt(
                        "Enter the live site URL (optional). Leave blank if not available:",
                        selectedProject.liveUrl || ""
                      );
                      if (live) {
                        live = String(live).trim();
                        if (live && !/^https?:\/\//i.test(live)) {
                          live = `https://${live}`;
                        }
                      }

                      const ref = firestoreDoc(
                        db,
                        "projects",
                        selectedProject.id
                      );
                      await updateDoc(ref, {
                        status: "Completed",
                        progress: 100,
                        completedAt: serverTimestamp(),
                        liveUrl: live || selectedProject.liveUrl || null,
                        analyticsEnabled: !!(
                          selectedProject.analyticsEnabled || live
                        ),
                      });

                      toast.success("Project marked completed");
                      fetchProjects();
                    } catch (err) {
                      console.error("Failed to mark complete:", err);
                      toast.error("Failed to mark project completed");
                    }
                  }}
                  className="px-3 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700"
                >
                  Mark Complete
                </button>
              </div>
            </div>
          </div>

          {/* Project Edit Form */}
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

            {/* --- ADDED: GA Property ID Input --- */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                GA4 Property ID
              </label>
              <input
                value={editProject?.gaPropertyId || ""}
                onChange={(e) =>
                  setEditProject({
                    ...editProject,
                    gaPropertyId: e.target.value,
                  })
                }
                placeholder="e.g. 345678901"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:border-blue-500 outline-none"
              />
              <p className="text-xs text-slate-500 mt-1">
                Required for Analytics tab. Found in GA Admin {">"} Property
                Settings.
              </p>
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

            <div className="pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow hover:opacity-95 transition-all font-semibold"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditProject({ ...selectedProject });
                    setNewUpdateText("");
                  }}
                  className="px-4 py-3 bg-slate-800 text-slate-200 rounded-lg border border-slate-700 hover:bg-slate-800/80"
                >
                  Reset
                </button>
              </div>
              <div className="text-sm text-slate-400">
                Last saved:{" "}
                <span className="text-slate-300">
                  {formatDateForDisplay(
                    selectedProject.updatedAt || selectedProject.createdAt
                  )}
                </span>
              </div>
            </div>
          </form>

          {/* Project Updates Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-2">Updates</h3>
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
                            <p className="text-xs text-slate-400">{u.date}</p>
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
                              onClick={() => deleteUpdateAtIndex(originalIndex)}
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
            <h3 className="text-lg font-semibold text-white mb-2">Invoices</h3>

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
                  value={invoiceDueDate ? isoToDateInput(invoiceDueDate) : ""}
                  onChange={(e) =>
                    setInvoiceDueDate(dateInputToISOStringLocal(e.target.value))
                  }
                  className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white"
                />

                <div className="col-span-1 md:col-span-2 flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      value={invoiceDescription}
                      onChange={(e) => setInvoiceDescription(e.target.value)}
                      placeholder="Description (optional)"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Items editor */}
              <div className="mt-3 space-y-2">
                {invoiceItems.map((it, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
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
                          s + Number(it.qty || 0) * Number(it.unitPrice || 0),
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
                    {editingInvoice ? "Save Invoice" : "Create & Link Invoice"}
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
                        {inv.status === "Paid" ? "Mark Unpaid" : "Mark Paid"}
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
                                "Reminder failed: " + (data.error || "unknown")
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
      );
    } else if (selectedUser) {
      return (
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
      );
    } else {
      return (
        <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl p-12 bg-slate-900/20">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Briefcase size={32} className="text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-300 mb-2">
            Welcome, Administrator
          </h3>
          <p className="text-sm max-w-xs text-center">
            Use the navigation above to manage projects, clients, or
            testimonials.
          </p>
        </div>
      );
    }
  };

  const visibleProjects = showAllProjects
    ? projects
    : selectedUser
    ? projects.filter((p) => p.clientId === selectedUser.id)
    : projects;

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

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: User/Project List (Navigation) */}
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
                onClick={() => {
                  setSelectedUser(u);
                  setSelectedProject(null);
                  setActiveTab("projects");
                  setShowAllProjects(false);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedUser?.id === u.id
                    ? "bg-blue-600/20 border-blue-500"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{u.email}</p>
                    {u.displayName && (
                      <p className="text-sm text-slate-300 truncate mt-1">
                        {u.displayName}
                      </p>
                    )}
                    <div className="mt-1 flex flex-wrap gap-2 items-center">
                      {u.phone && (
                        <p className="text-xs text-slate-400 truncate">
                          📞 {u.phone}
                        </p>
                      )}
                      {u.address && (
                        <p className="text-xs text-slate-400 truncate">
                          📍 {u.address}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      UID: {u.id}
                      {u.createdAt ? (
                        <span className="text-slate-400 ml-2">
                          • Joined: {formatDateForDisplay(u.createdAt)}
                        </span>
                      ) : null}
                    </p>
                  </div>

                  {u.role === "admin" && (
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded uppercase font-bold">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            ))}
            {/* Projects List */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm text-slate-400 uppercase tracking-wide">
                  Projects
                </h3>
                <label className="text-xs text-slate-400 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showAllProjects}
                    onChange={() => setShowAllProjects((s) => !s)}
                    className="accent-blue-500 mr-1"
                  />
                  <span>Show all</span>
                </label>
              </div>
              {visibleProjects.length === 0 && (
                <p className="text-slate-500 text-sm">
                  {selectedUser && !showAllProjects
                    ? "No projects found for this client."
                    : "No projects found."}
                </p>
              )}
              {visibleProjects.map((p) => (
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

        {/* RIGHT: Tabbed Action Panel */}
        <div className="lg:col-span-2">
          {/* Tabs Navigation */}
          <div className="mb-4 flex gap-4 border-b border-slate-800">
            <button
              onClick={() => setActiveTab("projects")}
              className={`flex items-center gap-2 py-2 px-3 text-sm font-medium transition-all ${
                activeTab === "projects"
                  ? "border-b-2 border-blue-500 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Briefcase size={16} /> Projects & Clients
            </button>
            <button
              onClick={() => {
                setActiveTab("testimonials");
                setSelectedProject(null);
                setSelectedUser(null);
              }}
              className={`flex items-center gap-2 py-2 px-3 text-sm font-medium transition-all ${
                activeTab === "testimonials"
                  ? "border-b-2 border-blue-500 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <MessageSquare size={16} /> Testimonials
            </button>
          </div>

          {/* Tab Content */}
          {renderRightPanelContent()}
        </div>
      </main>
    </div>
  );
}
