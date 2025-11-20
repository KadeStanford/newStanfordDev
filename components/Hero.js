import React from "react";
import { ArrowRight, Code2, Zap } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import Magnetic from "./Magnetic";

// VS Code-like Color Map (for static display)
const styleMap = {
  keyword: "#ef4444", // Pink/Red for const, import, if, return
  variable: "#60a5fa", // Light Blue for variables/functions
  comment: "#64748b", // Slate for comments
  string: "#10b981", // Green for strings/paths
  component: "#a78bfa", // Purple for React Components/Tags
  literal: "#facc15", // Yellow for numbers, booleans
};

// Static, syntax-highlighted code content
const StaticCode = () => (
  <div
    className="space-y-0 text-white font-mono text-sm"
    style={{ lineHeight: "1.5em" }}
  >
    <span style={{ color: styleMap.comment }}>
      {"// 1. Define Client Goals and Branding"}
    </span>
    <br />
    <span style={{ color: styleMap.keyword }}>const</span>{" "}
    <span style={{ color: styleMap.variable }}>BUSINESS_GOALS</span>{" "}
    <span style={{ color: styleMap.variable }}>=</span> [
    <span style={{ color: styleMap.string }}>{"'Conversion'"}</span>,
    <span style={{ color: styleMap.string }}>{"'Scalability'"}</span>,
    <span style={{ color: styleMap.string }}>{"'Performance'"}</span>
    ];
    <br />
    <span style={{ color: styleMap.keyword }}>const</span>{" "}
    <span style={{ color: styleMap.variable }}>brand_id</span>{" "}
    <span style={{ color: styleMap.variable }}>=</span>{" "}
    <span style={{ color: styleMap.literal }}>102</span>;
    <br />
    <br />
    <span style={{ color: styleMap.comment }}>
      {"// 2. Execute Development Pipeline"}
    </span>
    <br />
    <span style={{ color: styleMap.keyword }}>async function</span>{" "}
    <span style={{ color: styleMap.variable }}>buildSite</span>(
    <span style={{ color: styleMap.variable }}>goals</span>) {"{"}
    <br />
    <span className="pl-4">
      <span style={{ color: styleMap.variable }}>design_system</span> ={" "}
      <span style={{ color: styleMap.variable }}>createDesignSystem</span>(
      <span style={{ color: styleMap.variable }}>brand_id</span>);
    </span>
    <br />
    <span className="pl-4">
      <span style={{ color: styleMap.keyword }}>if</span> (
      <span style={{ color: styleMap.variable }}>design_system</span>.
      <span style={{ color: styleMap.variable }}>ready</span>) {"{"}
    </span>
    <br />
    <span className="pl-8">
      <span style={{ color: styleMap.keyword }}>await</span>{" "}
      <span style={{ color: styleMap.variable }}>deploy</span>(
      <span style={{ color: styleMap.string }}>{"'Next.js'"}</span>);
    </span>
    <br />
    <span className="pl-4">{"}"}</span>
    <br />
    <span style={{ color: styleMap.keyword }}>return</span>{" "}
    <span style={{ color: styleMap.variable }}>checkSuccess</span>(
    <span style={{ color: styleMap.variable }}>goals</span>);
    <br />
    {"}"}
    <br />
    <br />
    <span style={{ color: styleMap.comment }}>
      {"// Launch Sequence Initialized"}
    </span>
  </div>
);

export default function Hero() {
  const { scrollY } = useScroll();
  // Adjusted fade range from [0, 75] to [0, 300] for a slower, smoother fade
  const blobOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Animation variants for the orbiting badges
  // Traveling around a rectangular path
  const orbitTransition = {
    duration: 12,
    repeat: Infinity,
    ease: "linear",
  };

  return (
    <section
      id="hero"
      className="relative z-10 min-h-screen flex items-center pt-20 overflow-hidden"
    >
      {/* --- Background Gradient Blobs (Fading on Scroll) --- */}
      <motion.div
        style={{ opacity: blobOpacity }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-20 left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" />
        <div className="absolute bottom-10 right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-pulse delay-1000" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 w-full grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-8">
          {/* Animated Badge with Shimmer */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex relative overflow-hidden items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold tracking-wide uppercase"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent animate-shimmer z-0 pointer-events-none" />
            <span className="relative flex h-3 w-3 z-10">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <span className="relative z-10">Accepting New Projects!</span>
          </motion.div>

          {/* Typewriter Title */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
              Your Vision, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient">
                <TypeAnimation
                  sequence={[
                    "Customized.",
                    2000,
                    "Engineered.",
                    2000,
                    "Live.",
                    2000,
                  ]}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                  cursor={false}
                />
                <span className="hero-cursor" aria-hidden="true" />
              </span>
            </h1>
          </motion.div>

          {/* Animated Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-lg text-slate-400 max-w-xl leading-relaxed"
          >
            We take your unique vision and translate it directly into a
            high-performance, conversion-focused digital reality. Forget
            templates—we build custom experiences designed exclusively to
            achieve your goals and scale with your business.
          </motion.p>

          {/* Magnetic Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Magnetic>
              <button
                onClick={() => scrollToSection("contact")}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 cursor-pointer hover:scale-105 active:scale-95"
              >
                Get Started <ArrowRight size={18} />
              </button>
            </Magnetic>

            <Magnetic>
              <button
                onClick={() => scrollToSection("work")}
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-all border border-slate-700 cursor-pointer hover:scale-105 active:scale-95"
              >
                View Work
              </button>
            </Magnetic>
          </motion.div>
        </div>

        {/* Abstract Visual / Code Block */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.4, type: "spring" }}
          className="relative hidden md:block h-[480px] w-full mt-20"
        >
          {/* Wrapper for rotation & hover effects.
              The Badges are inside this wrapper so they rotate WITH the card on hover.
          */}
          <div className="relative w-full h-full transform rotate-3 hover:rotate-0 transition-all duration-500 group">
            {/* The Card Itself (Clipped Content) */}
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden z-20">
              <div className="p-6 space-y-3 opacity-90 group-hover:opacity-100 transition-opacity relative h-full">
                {/* Traffic Light Dots */}
                <div className="flex gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>

                {/* Render Static Code Content */}
                <StaticCode />
              </div>
            </div>

            {/* --- Badge 1: Orbit Path (Blue) --- */}
            {/* Starts Top Right -> Bottom Right -> Bottom Left -> Top Left -> Top Right */}
            <motion.div
              className="absolute z-30"
              animate={{
                top: ["-6%", "94%", "94%", "-6%", "-6%"],
                left: ["94%", "94%", "-6%", "-6%", "94%"],
              }}
              transition={orbitTransition}
            >
              <div className="bg-blue-600 p-4 rounded-2xl shadow-lg">
                <Code2 className="text-white w-6 h-6" />
              </div>
            </motion.div>

            {/* --- Badge 2: Orbit Path (Purple) --- */}
            {/* Starts Bottom Left -> Top Left -> Top Right -> Bottom Right -> Bottom Left */}
            {/* Offset to be opposite of Badge 1 */}
            <motion.div
              className="absolute z-30"
              animate={{
                top: ["94%", "-6%", "-6%", "94%", "94%"],
                left: ["-6%", "-6%", "94%", "94%", "-6%"],
              }}
              transition={orbitTransition}
            >
              <div className="bg-purple-600 p-4 rounded-2xl shadow-lg">
                <Zap className="text-white w-6 h-6" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Bottom shadow overlay removed per request */}
    </section>
  );
}
