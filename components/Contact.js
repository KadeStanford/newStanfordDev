import React, { useState } from "react";
import {
  MessageSquare,
  Briefcase,
  CheckCircle,
  Target,
  Palette,
  Layers,
  FileText,
  Search,
  Clock,
  Settings,
  Plus,
  X,
  DollarSign,
  Link as LinkIcon,
  Server,
  Globe,
} from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Meteors } from "./Meteors";

export default function Contact() {
  const [contactMode, setContactMode] = useState("general");
  const [colorPalette, setColorPalette] = useState(["#3b82f6", "#1e293b"]);
  const [activeColor, setActiveColor] = useState("#8b5cf6");

  // Project form state
  const [project, setProject] = useState({
    fullName: "",
    company: "",
    email: "",
    phone: "",
    website: "",
    projectType: "website",
    budgetMin: 1000,
    budgetMax: 5000,
    timeline: "",
    pages: "",
    goals: [],
    inspirationLinks: "",
    inspirationNotes: "",
    competitorLinks: "",
    hasBranding: false,
    hasContent: false,
    hasImages: false,
    needsCMS: false,
    hasHosting: false,
    hasDomain: false,
    notes: "",
    preferredContact: "email",
    nda: false,
  });

  const [attachments, setAttachments] = useState([]);
  const [errors, setErrors] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generalMessage, setGeneralMessage] = useState("");

  const MIN_BUDGET = 500;
  const MAX_BUDGET = 10000;
  const STEP = 100;

  const addColorToPalette = () => {
    if (!colorPalette.includes(activeColor)) {
      setColorPalette([...colorPalette, activeColor]);
    }
  };

  const removeColorFromPalette = (colorToRemove) => {
    setColorPalette(colorPalette.filter((c) => c !== colorToRemove));
  };

  const validate = () => {
    const errs = {};
    if (!project.fullName || !project.fullName.trim()) {
      errs.fullName = "Please enter your full name";
    }
    if (!project.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(project.email)) {
      errs.email = "Please enter a valid email address";
    }
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setShowSummary(false);
      toast.error("Please check the form for errors.");
      return;
    }
    setErrors({});
    // If this is the general contact form, send immediately
    if (contactMode === "general") {
      const payload = {
        type: "general",
        fullName: project.fullName,
        email: project.email,
        message: generalMessage,
      };
      // send and reset on success
      setSubmitting(true);
      const toastId = toast.loading("Sending message...");
      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((r) => {
          if (!r.ok) throw new Error("Network response was not ok");
          return r.json();
        })
        .then(() => {
          confetti({ particleCount: 120, spread: 60, origin: { y: 0.6 } });
          toast.success("Message sent! We'll be in touch soon.", {
            id: toastId,
          });
          setProject((p) => ({ ...p, fullName: "", email: "" }));
          setGeneralMessage("");
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to send message. Try again later.", {
            id: toastId,
          });
        })
        .finally(() => setSubmitting(false));
      return;
    }

    setShowSummary(true);
  };

  const finalizeSubmit = async () => {
    setSubmitting(true);
    const toastId = toast.loading("Sending request...");

    try {
      const formattedBudget = `$${project.budgetMin.toLocaleString()} - ${
        project.budgetMax >= MAX_BUDGET
          ? "$10,000+"
          : "$" + project.budgetMax.toLocaleString()
      }`;

      const data = {
        type: "project",
        ...project,
        formattedBudget,
        colorPalette,
      };

      // Send to API
      const resp = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!resp.ok) {
        throw new Error("Failed to send");
      }

      setShowSummary(false);

      // Trigger Confetti
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#3b82f6", "#8b5cf6", "#10b981"],
      });

      toast.success("Request received! We'll be in touch soon.", {
        id: toastId,
      });

      // Reset form
      setProject({
        fullName: "",
        company: "",
        email: "",
        phone: "",
        website: "",
        projectType: "website",
        budgetMin: 1000,
        budgetMax: 5000,
        timeline: "",
        pages: "",
        goals: [],
        inspirationLinks: "",
        inspirationNotes: "",
        competitorLinks: "",
        hasBranding: false,
        hasContent: false,
        hasImages: false,
        needsCMS: false,
        hasHosting: false,
        hasDomain: false,
        notes: "",
        preferredContact: "email",
        nda: false,
      });
      setAttachments([]);
    } finally {
      setSubmitting(false);
    }
  };

  const getIntroText = () => {
    if (contactMode === "general") {
      return "Have a quick question? No obligation — tell us a little and we'll reply promptly.";
    }
    return "No obligation — tell us about your business and we'll provide a clear, friendly estimate.";
  };

  const handleBudgetChange = (e, type) => {
    const value = parseInt(e.target.value);
    if (type === "min") {
      setProject((p) => ({
        ...p,
        budgetMin: Math.min(value, p.budgetMax - STEP),
      }));
    } else {
      setProject((p) => ({
        ...p,
        budgetMax: Math.max(value, p.budgetMin + STEP),
      }));
    }
  };

  const getPercent = (value) =>
    Math.round(((value - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)) * 100);

  return (
    <section id="contact" className="py-32 relative z-10 overflow-hidden">
      {/* Layer 1: Base Gradient (Behind everything) */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 to-blue-950/40 pointer-events-none z-0" />

      {/* Layer 2: Meteors (Mid-ground) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <Meteors number={20} />
      </div>

      {/* Layer 3: Content (Front) */}
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Get a <span className="text-blue-500">Free Estimate</span>
          </h2>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            {getIntroText()}
          </p>

          {/* Toggle Switch */}
          <div className="inline-flex bg-slate-900/80 backdrop-blur-md p-1 rounded-full border border-slate-800 mb-8">
            <button
              onClick={() => setContactMode("general")}
              className={`px-8 py-3 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                contactMode === "general"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              General Question
            </button>
            <button
              onClick={() => setContactMode("project")}
              className={`px-8 py-3 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                contactMode === "project"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Free Estimate
            </button>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-8 md:p-10 shadow-2xl transition-all duration-500">
          {/* GENERAL QUESTION FORM */}
          {contactMode === "general" && (
            <div className="animate-fadeIn">
              <div className="flex items-center gap-3 mb-8">
                <MessageSquare className="text-blue-500" size={24} />
                <h3 className="text-2xl font-bold text-white">
                  Send a Message
                </h3>
              </div>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Your name"
                      value={project.fullName}
                      onChange={(e) =>
                        setProject((p) => ({ ...p, fullName: e.target.value }))
                      } // Capture name for general form too
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="email@example.com"
                      value={project.email}
                      onChange={(e) =>
                        setProject((p) => ({ ...p, email: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Message
                  </label>
                  <textarea
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors h-32 resize-none"
                    placeholder="How can we help you today?"
                    value={generalMessage}
                    onChange={(e) => setGeneralMessage(e.target.value)}
                  ></textarea>
                </div>
                <button
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-lg shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-1 cursor-pointer disabled:opacity-60"
                >
                  Send Message
                </button>
              </form>
            </div>
          )}

          {/* DETAILED PROJECT FORM */}
          {contactMode === "project" && (
            <div className="animate-fadeIn">
              <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-6">
                <Briefcase className="text-purple-500" size={24} />
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Free Estimate — Tell us about your business
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">
                    The more details you provide, the more accurate our estimate
                    will be.
                  </p>
                </div>
              </div>

              <form className="space-y-12" onSubmit={handleSubmit}>
                {/* Section 1: Basics */}
                <div className="space-y-6">
                  <h4 className="text-purple-400 font-semibold uppercase tracking-wider text-xs flex items-center gap-2 border-b border-slate-800 pb-2">
                    <CheckCircle size={14} /> The Basics
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none transition-all"
                        placeholder="John Doe"
                        value={project.fullName}
                        onChange={(e) =>
                          setProject((p) => ({
                            ...p,
                            fullName: e.target.value,
                          }))
                        }
                      />
                      {errors.fullName && (
                        <p className="text-sm text-red-400 mt-2">
                          {errors.fullName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Company/Entity Name
                      </label>
                      <input
                        type="text"
                        className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none transition-all"
                        placeholder="Acme Corp"
                        value={project.company}
                        onChange={(e) =>
                          setProject((p) => ({ ...p, company: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none"
                        placeholder="email@example.com"
                        value={project.email}
                        onChange={(e) =>
                          setProject((p) => ({ ...p, email: e.target.value }))
                        }
                      />
                      {errors.email && (
                        <p className="text-sm text-red-400 mt-2">
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Current Website (if any)
                      </label>
                      <input
                        type="url"
                        className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none"
                        placeholder="https://your-site.com"
                        value={project.website}
                        onChange={(e) =>
                          setProject((p) => ({ ...p, website: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Budget & Logistics */}
                <div className="space-y-6">
                  <h4 className="text-purple-400 font-semibold uppercase tracking-wider text-xs flex items-center gap-2 border-b border-slate-800 pb-2">
                    <DollarSign size={14} /> Budget & Logistics
                  </h4>

                  <div className="mb-8">
                    <div className="flex justify-between items-end mb-4">
                      <label className="block text-sm font-medium text-slate-400">
                        Estimated Budget Range
                      </label>
                      <div className="text-xl font-bold text-white font-mono">
                        ${project.budgetMin.toLocaleString()} —{" "}
                        {project.budgetMax >= MAX_BUDGET
                          ? "$10,000+"
                          : "$" + project.budgetMax.toLocaleString()}
                      </div>
                    </div>

                    <div className="relative w-full h-12">
                      <div className="absolute top-1/2 left-0 right-0 h-2 bg-slate-800 rounded-lg -translate-y-1/2"></div>
                      <div
                        className="absolute top-1/2 h-2 bg-purple-600 rounded-lg -translate-y-1/2 pointer-events-none"
                        style={{
                          left: `${getPercent(project.budgetMin)}%`,
                          right: `${100 - getPercent(project.budgetMax)}%`,
                        }}
                      ></div>

                      <input
                        type="range"
                        min={MIN_BUDGET}
                        max={MAX_BUDGET}
                        step={STEP}
                        value={project.budgetMin}
                        onChange={(e) => handleBudgetChange(e, "min")}
                        className="absolute top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-none z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:bg-white"
                        style={{
                          zIndex:
                            project.budgetMin > MAX_BUDGET - 1000 ? 22 : 20,
                        }}
                      />
                      <input
                        type="range"
                        min={MIN_BUDGET}
                        max={MAX_BUDGET}
                        step={STEP}
                        value={project.budgetMax}
                        onChange={(e) => handleBudgetChange(e, "max")}
                        className="absolute top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-none z-21 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:bg-white"
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-500 font-mono uppercase">
                      <span>${MIN_BUDGET}</span>
                      <span>${MAX_BUDGET.toLocaleString()}+</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Target Timeline
                      </label>
                      <input
                        type="text"
                        className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white"
                        placeholder="e.g. 3 months, Q1 2026"
                        value={project.timeline}
                        onChange={(e) =>
                          setProject((p) => ({
                            ...p,
                            timeline: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        What do you need?
                      </label>
                      <select
                        className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-3 py-3 text-white"
                        value={project.projectType}
                        onChange={(e) =>
                          setProject((p) => ({
                            ...p,
                            projectType: e.target.value,
                          }))
                        }
                      >
                        <option value="website">New Website</option>
                        <option value="ecommerce">E-commerce Store</option>
                        <option value="redesign">Site Redesign</option>
                        <option value="webapp">Web Application</option>
                        <option value="consulting">
                          Consulting / IT Support
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section: Inspiration & Competitors */}
                <div className="space-y-6">
                  <h4 className="text-purple-400 font-semibold uppercase tracking-wider text-xs flex items-center gap-2 border-b border-slate-800 pb-2">
                    <LinkIcon size={14} /> Research & Inspiration
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Inspiration Websites
                    </label>
                    <textarea
                      className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white h-20 text-sm"
                      placeholder="Paste links to websites you like visually or functionally..."
                      value={project.inspirationLinks}
                      onChange={(e) =>
                        setProject((p) => ({
                          ...p,
                          inspirationLinks: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Competitors
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm"
                      placeholder="Who are your main competitors?"
                      value={project.competitorLinks}
                      onChange={(e) =>
                        setProject((p) => ({
                          ...p,
                          competitorLinks: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      What do you like/dislike about these?
                    </label>
                    <textarea
                      className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white h-24 text-sm"
                      placeholder="e.g. I like the clean layout of Site A, but hate the dark colors of Site B..."
                      value={project.inspirationNotes}
                      onChange={(e) =>
                        setProject((p) => ({
                          ...p,
                          inspirationNotes: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Section: Assets & Tech */}
                <div className="space-y-6">
                  <h4 className="text-purple-400 font-semibold uppercase tracking-wider text-xs flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Server size={14} /> Project Readiness
                  </h4>
                  <div className="bg-slate-950/30 border border-slate-800 rounded-xl p-5">
                    <p className="text-sm text-slate-400 mb-4">
                      What do you have ready right now?
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        {
                          key: "hasBranding",
                          label: "Logo / Branding",
                        },
                        {
                          key: "hasContent",
                          label: "Text Content",
                        },
                        {
                          key: "hasImages",
                          label: "Images / Photos",
                        },
                        {
                          key: "needsCMS",
                          label: "Need CMS (Self-edit)",
                        },
                        {
                          key: "hasDomain",
                          label: "Domain Purchased",
                        },
                        {
                          key: "hasHosting",
                          label: "Hosting Purchased",
                        },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <div
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                              project[item.key]
                                ? "bg-purple-600 border-purple-600"
                                : "border-slate-600 bg-slate-900"
                            }`}
                          >
                            {project[item.key] && (
                              <CheckCircle size={12} className="text-white" />
                            )}
                          </div>
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={project[item.key]}
                            onChange={(e) =>
                              setProject((p) => ({
                                ...p,
                                [item.key]: e.target.checked,
                              }))
                            }
                          />
                          <span className="text-sm text-slate-300 group-hover:text-white">
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section: Design (Color Picker) */}
                <div className="space-y-6">
                  <h4 className="text-purple-400 font-semibold uppercase tracking-wider text-xs flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Palette size={14} /> Design Preferences
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-3">
                      Preferred Colors
                    </label>
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-4">
                      <div className="flex items-center gap-2">
                        <div className="relative group flex-shrink-0">
                          <input
                            type="color"
                            value={activeColor}
                            onChange={(e) => setActiveColor(e.target.value)}
                            className="w-12 h-12 rounded cursor-pointer bg-transparent border-0 p-0 overflow-hidden"
                          />
                          <div className="absolute inset-0 rounded-lg ring-1 ring-slate-700 pointer-events-none"></div>
                        </div>
                        <input
                          type="text"
                          value={activeColor}
                          onChange={(e) => setActiveColor(e.target.value)}
                          className="bg-slate-950/50 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm w-28 uppercase focus:border-purple-500 outline-none"
                        />
                        <button
                          onClick={addColorToPalette}
                          type="button"
                          className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-lg border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <Plus size={16} />
                          <span className="text-sm font-medium hidden md:inline">
                            Add
                          </span>
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 items-center min-h-[48px] p-2 rounded-xl border border-slate-800/50 bg-slate-950/30 flex-1 w-full md:w-auto">
                        {colorPalette.length === 0 && (
                          <span className="text-slate-600 text-sm italic px-2">
                            No colors added yet
                          </span>
                        )}
                        {colorPalette.map((c, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-full pl-1 pr-2 py-1 shadow-sm animate-fadeIn"
                          >
                            <div
                              className="w-5 h-5 rounded-full border border-white/10 shadow-inner"
                              style={{ backgroundColor: c }}
                            ></div>
                            <span className="text-xs font-mono text-slate-300">
                              {c}
                            </span>
                            <button
                              onClick={() => removeColorFromPalette(c)}
                              type="button"
                              className="text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-full p-0.5 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white h-28"
                    placeholder="Anything else we should know?"
                    value={project.notes}
                    onChange={(e) =>
                      setProject((p) => ({ ...p, notes: e.target.value }))
                    }
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="preferredContact"
                      checked={project.preferredContact === "email"}
                      onChange={() =>
                        setProject((p) => ({
                          ...p,
                          preferredContact: "email",
                        }))
                      }
                    />
                    <span className="text-sm text-slate-300">Prefer Email</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="preferredContact"
                      checked={project.preferredContact === "phone"}
                      onChange={() =>
                        setProject((p) => ({
                          ...p,
                          preferredContact: "phone",
                        }))
                      }
                    />
                    <span className="text-sm text-slate-300">Prefer Phone</span>
                  </div>
                </div>

                <button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-lg shadow-lg shadow-purple-600/20 transition-all transform hover:-translate-y-1 cursor-pointer">
                  Request Free Estimate
                </button>
              </form>

              {/* SUMMARY MODAL */}
              {showSummary && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={() => setShowSummary(false)}
                  />
                  <div className="relative bg-slate-900 rounded-2xl p-6 w-full max-w-2xl border border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-bold text-white mb-2">
                      Review your request
                    </h3>
                    <p className="text-slate-400 text-sm mb-4">
                      We will review this and reach out — you can edit before
                      sending.
                    </p>
                    <div className="grid grid-cols-1 gap-3 text-sm text-slate-200 border-t border-slate-800 pt-4">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-400">Name:</span>
                        <span className="col-span-2 font-medium">
                          {project.fullName}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-400">Email:</span>
                        <span className="col-span-2 font-medium">
                          {project.email}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-400">Budget:</span>
                        <span className="col-span-2 font-medium text-purple-400">
                          ${project.budgetMin.toLocaleString()} -{" "}
                          {project.budgetMax >= 10000
                            ? "$10,000+"
                            : "$" + project.budgetMax.toLocaleString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-400">Assets:</span>
                        <span className="col-span-2">
                          {[
                            project.hasBranding && "Branding",
                            project.hasContent && "Content",
                            project.hasImages && "Images",
                            project.hasDomain && "Domain",
                            project.hasHosting && "Hosting",
                          ]
                            .filter(Boolean)
                            .join(", ") || "None yet"}
                        </span>
                      </div>
                      {project.inspirationLinks && (
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-slate-400">Inspiration:</span>
                          <span className="col-span-2 truncate">
                            {project.inspirationLinks}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-6 flex gap-3 justify-end">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
                        onClick={() => setShowSummary(false)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500"
                        onClick={finalizeSubmit}
                        disabled={submitting}
                      >
                        {submitting ? "Sending…" : "Confirm & Send"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
