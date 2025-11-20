import dynamic from "next/dynamic";
import useABTest from "../lib/useABTest";
import Hero from "./Hero";
import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";

// Improved lightweight hero variant aimed at conversions
const HeroLite = () => {
  return (
    <section
      id="hero"
      className="relative z-10 min-h-screen flex items-center pt-20 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 w-full grid md:grid-cols-1 gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <motion.div className="inline-flex relative overflow-hidden items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold tracking-wide uppercase">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent animate-shimmer z-0 pointer-events-none" />
            <span className="relative flex h-3 w-3 z-10">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="relative z-10">Accepting New Projects!</span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
            We build websites that
            <span className="ml-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400">
              <TypeAnimation
                sequence={[
                  "convert.",
                  2000,
                  "load fast.",
                  2000,
                  "scale.",
                  2000,
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
                cursor={false}
              />
              <span
                aria-hidden
                className="ml-2 inline-block w-1 h-6 md:h-8 bg-emerald-400 rounded-sm animate-pulse"
              />
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-xl">
            Custom, performance-first websites with built-in analytics and
            experiments to help your business grow. We focus on results, not
            buzzwords.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="#contact"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold shadow"
            >
              Request a Free Estimate
            </a>
            <a
              href="/login"
              className="px-6 py-3 border border-slate-700 text-slate-200 rounded-lg hover:bg-slate-800"
            >
              Login or Sign Up
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default function HeroAB() {
  const variant = useABTest("hero_variant", ["A", "B"]);

  if (!variant) return null; // avoid flicker

  if (variant === "B") {
    return <HeroLite />;
  }

  return <Hero />;
}
