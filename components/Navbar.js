import React, { useState, useEffect } from "react";
import { Menu, X, Terminal, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import Magnetic from "./Magnetic"; // Import Magnetic

// ... (keep imports and state logic same as before) ...
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const scrollToSection = (id) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navLinks = [
    { name: "About", id: "about" },
    { name: "Services", id: "services" },
    { name: "Work", id: "work" },
    { name: "Why SDS", id: "why-us" },
  ];

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
            <div
              className="flex items-center gap-3 cursor-pointer group"
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
                  Start Project
                </button>
              </Magnetic>
            </div>

            <button
              className="md:hidden p-2 text-slate-300 hover:text-white bg-slate-800/50 rounded-lg border border-slate-700 transition-colors hover:bg-slate-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 origin-left"
          style={{ scaleX }}
        />
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-[80px] z-40 p-4 md:hidden"
          >
            <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-4 flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <button
                    key={link.name}
                    onClick={() => scrollToSection(link.id)}
                    className={`w-full p-4 text-left rounded-xl transition-all flex justify-between items-center group ${
                      isActive
                        ? "bg-slate-800/80 text-white border border-slate-700"
                        : "text-slate-300 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {link.name}
                    <ChevronRight
                      size={16}
                      className={`transition-opacity ${
                        isActive
                          ? "opacity-100 text-blue-400"
                          : "opacity-0 group-hover:opacity-100 text-slate-500"
                      }`}
                    />
                  </button>
                );
              })}
              <div className="h-px bg-slate-800 my-2" />
              <button
                onClick={() => scrollToSection("contact")}
                className="w-full p-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 flex justify-center items-center gap-2"
              >
                Start a Project
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
