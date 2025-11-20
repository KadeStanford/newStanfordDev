import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  Terminal,
  ChevronRight,
  ArrowRight,
  User,
  Lock, // Added Lock icon
  LogOut as LogOutIcon,
} from "lucide-react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import Magnetic from "./Magnetic";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  // Safe access to auth context
  const authContext = useAuth();
  const user = authContext ? authContext.user : null; // User now includes 'role'
  const router = useRouter();

  const handleLogout = async () => {
    try {
      if (authContext && authContext.logout) {
        await authContext.logout();
      }
      toast.success("Signed out");
      router.push("/");
    } catch (err) {
      console.error("Logout failed", err);
      toast.error("Logout failed");
    }
  };

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Handle Scroll for background blurring
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle Active Section Detection
  useEffect(() => {
    const sections = document.querySelectorAll("section");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((section) => observer.observe(section));
    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  // Lock Body Scroll when Mobile Menu is Open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const scrollToSection = (id) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      // Small timeout to allow menu to close smoothly before scrolling
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth" });

        // Auto-select "Free Estimate" logic
        if (id === "contact") {
          // Dispatch custom event to notify Contact component
          window.dispatchEvent(new Event("openEstimateForm"));

          // Auto-focus logic
          setTimeout(() => {
            const input = element.querySelector("input, textarea, select");
            if (input) {
              input.focus({ preventScroll: true });
            }
          }, 800);
        }
      }, 300);
    }
  };

  const navLinks = [
    { name: "About", id: "about" },
    { name: "Services", id: "services" },
    { name: "Work", id: "work" },
    { name: "Why SDS", id: "why-us" },
  ];

  // --- OPTIMIZED FLUID ANIMATIONS ---
  const fluidEase = [0.22, 1, 0.36, 1];

  const menuVariants = {
    closed: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.4,
        ease: "easeInOut",
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: fluidEase,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const linkVariants = {
    closed: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.2, ease: "easeIn" },
    },
    open: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: fluidEase },
    },
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    return user.role === "admin" ? "/admin" : "/dashboard";
  };

  const getDashboardText = () => {
    if (!user) return "Client Login";
    return user.role === "admin" ? "Admin Panel" : "Dashboard";
  };

  const getDashboardIcon = (size) => {
    if (!user) return <User size={size} />;
    return user.role === "admin" ? <Lock size={size} /> : <User size={size} />;
  };

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer group z-50 relative"
              onClick={() => scrollToSection("hero")}
            >
              <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl text-white shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
                <Terminal size={20} />
                <div className="absolute inset-0 rounded-xl bg-white/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                SDS<span className="text-blue-400">.</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 bg-slate-900/50 p-1.5 rounded-full border border-slate-800/50 backdrop-blur-md shadow-xl relative">
              {navLinks.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <button
                    key={link.name}
                    onClick={() => scrollToSection(link.id)}
                    className={`relative px-5 py-2 text-sm font-medium rounded-full transition-colors duration-300 ${
                      isActive
                        ? "text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activePill"
                        className="absolute inset-0 bg-slate-700/80 rounded-full shadow-inner border border-slate-600/50"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                    <span className="relative z-10">{link.name}</span>
                    {isActive && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                        className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)] z-20"
                      />
                    )}
                  </button>
                );
              })}
              <div className="w-px h-6 bg-slate-800 mx-2" />

              {/* Login/Dashboard Link - Now uses Role Check */}
              <a
                href={getDashboardLink()}
                className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ${
                  user && user.role === "admin"
                    ? "text-purple-400 hover:text-purple-300 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {getDashboardIcon(16)}
                {getDashboardText()}
              </a>

              <div className="w-px h-6 bg-slate-800 mx-2" />

              {/* MAGNETIC BUTTON WRAPPER */}
              <Magnetic>
                <button
                  onClick={() => scrollToSection("contact")}
                  className={`relative px-6 py-2 rounded-full text-sm font-semibold shadow-lg transition-all flex items-center gap-2 overflow-hidden ${
                    activeSection === "contact"
                      ? "bg-white text-blue-600 shadow-white/20 ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900"
                      : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
                  }`}
                >
                  Get Estimate
                </button>
              </Magnetic>
              {user && (
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="ml-3 p-2 rounded-lg text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors"
                >
                  <LogOutIcon size={16} />
                </button>
              )}
            </div>

            {/* Mobile Menu Button (Visible on top of overlay) */}
            <button
              className="md:hidden relative z-50 p-2 text-slate-300 hover:text-white bg-slate-800/50 rounded-lg border border-slate-700 transition-colors hover:bg-slate-700 active:scale-95"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={24} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Scroll Progress Bar */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 origin-left"
          style={{ scaleX }}
        />
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-xl md:hidden flex flex-col justify-center px-6"
          >
            {/* Background decorative blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-600/20 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-purple-600/20 rounded-full blur-[60px] pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-6">
              {navLinks.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <motion.button
                    key={link.name}
                    variants={linkVariants}
                    onClick={() => scrollToSection(link.id)}
                    className={`text-4xl font-bold text-left flex items-center gap-4 group ${
                      isActive ? "text-white" : "text-slate-500"
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span
                      className={`transition-colors duration-300 ${
                        isActive ? "text-white" : "group-hover:text-slate-300"
                      }`}
                    >
                      {link.name}
                    </span>
                    {isActive && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                    )}
                  </motion.button>
                );
              })}

              <motion.div
                variants={linkVariants}
                className="h-px bg-slate-800 w-full my-4"
              />

              {/* Mobile Login Link - Now uses Role Check */}
              <motion.div variants={linkVariants} className="w-full">
                <a
                  href={getDashboardLink()}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 text-2xl font-semibold transition-colors mb-6 ${
                    user && user.role === "admin"
                      ? "text-purple-400 hover:text-purple-300"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {getDashboardIcon(28)}
                  {getDashboardText()}
                </a>
              </motion.div>

              <motion.button
                variants={linkVariants}
                onClick={() => scrollToSection("contact")}
                className="w-full p-6 bg-blue-600 text-white rounded-2xl font-bold text-xl shadow-xl shadow-blue-600/20 flex justify-between items-center group"
                whileTap={{ scale: 0.95 }}
              >
                Get Estimate
                <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition-colors">
                  <ArrowRight size={24} />
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
