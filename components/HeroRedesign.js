import Image from "next/image";
import { ArrowDownRight, ArrowRight, Check, MapPin } from "lucide-react";

const auditSteps = [
  ["01", "Find the drop-off", "Where visitors lose confidence or momentum."],
  ["02", "Fix the path", "A clearer offer, proof, and next step."],
  ["03", "Measure action", "Track the calls and forms that matter."],
];

export default function HeroRedesign() {
  const openAudit = () => {
    const contact = document.getElementById("contact");
    if (!contact) return;
    window.__openEstimateFormRequested = true;
    window.dispatchEvent(new Event("openEstimateForm"));
    contact.scrollIntoView({ behavior: "smooth" });
  };

  const viewWork = () => {
    document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative z-10 overflow-hidden border-b border-slate-800/80 pt-28 md:pt-36"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(rgba(51,65,85,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(51,65,85,.18) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "linear-gradient(to bottom, black, transparent 82%)",
        }}
      />
      <div
        className="pointer-events-none absolute left-[12%] top-10 h-80 w-80 rounded-full bg-blue-600/15 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid w-full max-w-7xl gap-14 px-6 pb-20 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:gap-20 lg:pb-28">
        <div className="max-w-3xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm font-medium text-blue-200">
            <MapPin size={15} aria-hidden="true" />
            Independent web + growth partner for local businesses
          </div>

          <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-white sm:text-6xl lg:text-[5.2rem]">
            Turn local searches into{" "}
            <span className="text-blue-400">booked work.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
            I design fast, credible websites and the practical marketing system
            around them—SEO, ads, and lead tracking—so more of the right people
            call, request a quote, or walk through your door.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={openAudit}
              className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-blue-500 px-6 text-base font-semibold text-white shadow-[0_18px_50px_-18px_rgba(59,130,246,.75)] transition hover:-translate-y-0.5 hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Get your free local audit
              <ArrowRight
                size={19}
                className="transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              onClick={viewWork}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-6 text-base font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800"
            >
              See selected work
              <ArrowDownRight size={18} aria-hidden="true" />
            </button>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
            {["Clear offer", "Mobile-first", "Lead tracking included"].map(
              (item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
                    <Check size={12} strokeWidth={3} aria-hidden="true" />
                  </span>
                  {item}
                </li>
              )
            )}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/10 blur-2xl" />
          <div className="relative overflow-hidden rounded-[1.65rem] border border-slate-700/80 bg-slate-900/90 p-3 shadow-2xl shadow-black/40">
            <div className="mb-3 flex items-center justify-between px-2 py-1">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
              </div>
              <span className="text-xs font-medium text-slate-500">
                Recent launch · Big Bass Tree Service
              </span>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-950">
              <Image
                src="/images/bigbass-hero.webp"
                alt="Big Bass Tree Service website created by Stanford Development Solutions"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 560px"
                className="object-cover object-top"
              />
            </div>
          </div>

          <div className="relative -mt-5 ml-auto mr-3 w-[92%] rounded-2xl border border-slate-700 bg-slate-950/95 p-5 shadow-2xl backdrop-blur md:w-[86%]">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                  Your free audit
                </p>
                <p className="mt-1 text-lg font-semibold text-white">
                  A practical plan, not a sales deck.
                </p>
              </div>
              <span className="hidden text-xs text-slate-500 sm:block">
                No obligation
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {auditSteps.map(([number, title, detail]) => (
                <div key={number} className="border-l border-slate-700 pl-3">
                  <span className="text-xs font-semibold text-blue-400">
                    {number}
                  </span>
                  <p className="mt-1 text-sm font-semibold text-slate-100">
                    {title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-slate-800/80 bg-slate-950/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-5 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>One partner from first conversation through launch.</p>
          <p className="text-slate-500">
            Websites · Local SEO · Ads setup · Lead tracking
          </p>
        </div>
      </div>
    </section>
  );
}
