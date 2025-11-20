import dynamic from "next/dynamic";
import useABTest from "../lib/useABTest";
import Hero from "./Hero";

// Lazy-load the heavy Hero to avoid loading both variants
const HeroLite = () => (
  <section
    id="hero"
    className="relative z-10 min-h-screen flex items-center pt-20 overflow-hidden"
  >
    <div className="max-w-7xl mx-auto px-6 w-full grid md:grid-cols-2 gap-12 items-center relative z-10">
      <div className="space-y-8">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-semibold uppercase">
          New Variant — Focused on Conversions
        </div>

        <div>
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
            Fast, Reliable, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400">
              Revenue-First Websites
            </span>
          </h1>
        </div>

        <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
          Conversion-first engineering: A/B tested messaging, performance
          optimizations, and analytics wired to growth experiments.
        </p>

        <div className="flex gap-4">
          <a
            href="#contact"
            className="px-8 py-4 bg-emerald-600 text-white rounded-lg font-semibold"
          >
            Start a Project
          </a>
          <a
            href="#work"
            className="px-8 py-4 bg-slate-800 text-white rounded-lg"
          >
            See Work
          </a>
        </div>
      </div>

      <div className="hidden md:block" />
    </div>
  </section>
);

export default function HeroAB() {
  const variant = useABTest("hero_variant", ["A", "B"]);

  if (!variant) return null; // avoid flicker

  if (variant === "B") {
    return <HeroLite />;
  }

  return <Hero />;
}
