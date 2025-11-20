import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  updateDoc,
  doc as firestoreDoc,
  deleteDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import {
  Users,
  Plus,
  Briefcase,
  LayoutDashboard,
  ArrowLeft,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [newUpdateText, setNewUpdateText] = useState("");

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
      await fetchProjects();
      // keep the project selected and refresh the edit state
      const refreshed = { ...editProject };
      setSelectedProject(refreshed);
      setEditProject(refreshed);
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update project.");
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
      await fetchProjects();
      setSelectedProject(null);
    } catch (err) {
      console.error("Add update failed:", err);
      toast.error("Failed to add update.");
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
            onClick={logout}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: User List */}
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
                      value={editProject?.dueDate || ""}
                      onChange={(e) =>
                        setEditProject({
                          ...editProject,
                          dueDate: e.target.value,
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
                  {(selectedProject.updates || [])
                    .slice()
                    .reverse()
                    .map((u, i) => (
                      <div
                        key={i}
                        className="p-3 bg-slate-950/30 rounded-lg border border-slate-800"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-white font-medium">
                              {u.title}
                            </p>
                            <p className="text-xs text-slate-400">{u.date}</p>
                          </div>
                          <span className="text-xs text-slate-400">
                            {u.type}
                          </span>
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
                      type="text"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                      placeholder="Oct 24, 2025"
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
