import Image from "next/image";
import { ArrowRight, Mail, MousePointerClick } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroAB() {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (!element) return;

    element.scrollIntoView({ behavior: "smooth" });
    if (id === "contact") {
      window.__openEstimateFormRequested = true;
      window.dispatchEvent(new Event("openEstimateForm"));
    }
  };

  return (
    <section
      id="hero"
      className="relative z-10 min-h-screen flex items-center pt-24 pb-16 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-24 left-[-12%] w-[440px] h-[440px] bg-blue-600/18 rounded-full blur-[115px]" />
        <div className="absolute bottom-8 right-[-10%] w-[560px] h-[560px] bg-purple-600/18 rounded-full blur-[130px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <div className="mb-6 inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
            Local websites + ads
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.02] tracking-tight">
            Better online presence.
            <span className="block text-blue-300">More local leads.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base md:text-lg leading-relaxed text-slate-300">
            Custom websites, simple ad setup, SEO, and tracking for local
            small businesses.
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            {["Website", "Ads", "SEO", "Tracking"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm font-medium text-slate-200"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="mt-8 md:hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-2 shadow-2xl">
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-slate-950">
              <Image
                src="/images/bigbass-hero.webp"
                alt="Big Bass Tree Service website designed by Stanford Development Solutions"
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            </div>
            <div className="flex items-center justify-between px-2 pt-3 pb-1">
              <span className="text-sm font-semibold text-blue-200">
                bigbasstrees.com
              </span>
              <span className="text-xs text-slate-500">Recent build</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => scrollToSection("contact")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-4 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:bg-blue-500"
            >
              Free Local Audit <ArrowRight size={18} />
            </button>
            <a
              href="mailto:stanforddevcontact@gmail.com"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-6 py-4 font-semibold text-white transition-all hover:bg-slate-800"
            >
              Email Kade <Mail size={18} />
            </a>
          </div>

          <div className="mt-5 max-w-xl rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-400">
            Free audit: I review your site, Google/Facebook presence, and lead
            path, then send the first fixes I would make.
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative hidden min-h-[560px] md:block"
        >
          <div className="absolute right-0 top-4 w-[58%] rounded-2xl border border-slate-700 bg-slate-900/70 p-2.5 shadow-xl">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-950">
              <Image
                src="/images/libertyhouse-hero.webp"
                alt="Liberty House Specialties website designed by Stanford Development Solutions"
                fill
                className="object-cover opacity-80"
                sizes="(max-width: 1024px) 50vw, 380px"
              />
            </div>
            <div className="px-2 pt-2">
              <span className="text-xs font-semibold text-blue-200">
                libertyhousespecialties.com
              </span>
            </div>
          </div>

          <div className="absolute left-0 top-28 w-[92%] rounded-3xl border border-slate-700 bg-slate-900/90 p-3 shadow-2xl">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-slate-950">
              <Image
                src="/images/bigbass-hero.webp"
                alt="Big Bass Tree Service website designed by Stanford Development Solutions"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 90vw, 620px"
              />
            </div>
            <div className="flex items-center justify-between px-3 pt-3">
              <span className="text-sm font-semibold text-blue-200">
                bigbasstrees.com
              </span>
              <span className="text-xs text-slate-500">service business</span>
            </div>
          </div>

          <div className="absolute bottom-28 right-0 w-56 rounded-2xl border border-slate-700 bg-slate-950/95 p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-600/20">
                <MousePointerClick className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Built for action
                </p>
                <p className="text-xs text-slate-400">calls, forms, quotes</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
