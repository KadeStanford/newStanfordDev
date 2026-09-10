import Image from "next/image";
import { ArrowUpRight, Check, MapPin, MousePointerClick } from "lucide-react";

const caseStudies = [
  {
    title: "Big Bass Tree Service",
    eyebrow: "Lead-generation website",
    location: "Greater Baton Rouge area",
    image: "/images/bigbass-hero.webp",
    href: "https://bigbasstrees.com/",
    challenge:
      "Turn a local tree-service reputation into a clear online experience that helps homeowners understand the work, trust the company, and request an estimate quickly.",
    solution:
      "I designed and developed a mobile-first website around the two actions that matter most: requesting an estimate and calling. The structure gives individual services and local communities room to rank and convert without making the customer hunt for information.",
    delivered: [
      "Core service pages",
      "Town-specific landing pages",
      "Estimate and phone lead paths",
      "Analytics and conversion tracking",
      "Local SEO and structured data",
    ],
    outcomes: ["Clearer service discovery", "Quote-ready calls to action", "Ad-ready tracking foundation"],
    accent: "emerald",
  },
  {
    title: "Liberty House Specialties",
    eyebrow: "Local retail website",
    location: "Clinton, Louisiana",
    image: "/images/libertyhouse-hero.webp",
    href: "https://libertyhousespecialties.com/",
    challenge:
      "Give a distinctive local shop a useful online home while preserving the personality customers already associate with its storefront and products.",
    solution:
      "I built a responsive website that makes the shop's menu, pottery, ice cream, gift cards, and call-in ordering easier to find. The visual direction carries the character of the physical location into a straightforward browsing experience.",
    delivered: [
      "Responsive custom layout",
      "Menu and product-category paths",
      "Call-in ordering route",
      "Business information and location",
      "Ongoing website care",
    ],
    outcomes: ["Offerings organized clearly", "Easy mobile contact", "Brand character preserved"],
    accent: "amber",
  },
];

const accentStyles = {
  emerald: {
    eyebrow: "text-emerald-300",
    border: "border-emerald-400/25",
    wash: "bg-emerald-400/5",
    icon: "text-emerald-400",
  },
  amber: {
    eyebrow: "text-amber-300",
    border: "border-amber-400/25",
    wash: "bg-amber-400/5",
    icon: "text-amber-400",
  },
};

function CaseStudy({ project, reverse }) {
  const accent = accentStyles[project.accent];

  return (
    <article
      className={`overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/55 ${
        reverse ? "lg:[&>div]:flex-row-reverse" : ""
      }`}
    >
      <div className="flex flex-col lg:flex-row">
        <div className="relative min-h-72 overflow-hidden lg:w-[48%]">
          <Image
            src={project.image}
            alt={`${project.title} website homepage`}
            fill
            className="object-cover object-top transition duration-700 hover:scale-[1.02]"
            sizes="(max-width: 1024px) 100vw, 48vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/80 px-4 py-2 text-sm font-medium text-white backdrop-blur">
            <MapPin size={15} aria-hidden="true" />
            {project.location}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-7 md:p-10 lg:p-12">
          <p className={`text-sm font-bold uppercase tracking-[0.18em] ${accent.eyebrow}`}>
            {project.eyebrow}
          </p>
          <h3 className="mt-3 text-3xl font-bold text-white md:text-4xl">
            {project.title}
          </h3>

          <div className="mt-8 grid gap-7 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                The challenge
              </h4>
              <p className="mt-3 leading-relaxed text-slate-300">
                {project.challenge}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                What I built
              </h4>
              <p className="mt-3 leading-relaxed text-slate-300">
                {project.solution}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-7 border-t border-slate-800 pt-7 md:grid-cols-2">
            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
                Delivered
              </h4>
              <ul className="space-y-2.5">
                {project.delivered.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm text-slate-300">
                    <Check size={16} className={`mt-0.5 shrink-0 ${accent.icon}`} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className={`rounded-2xl border p-5 ${accent.border} ${accent.wash}`}>
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
                <MousePointerClick size={17} className={accent.icon} aria-hidden="true" />
                Built to improve
              </div>
              <ul className="mt-4 space-y-3">
                {project.outcomes.map((outcome) => (
                  <li key={outcome} className="text-sm text-slate-300">
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <a
            href={project.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex w-fit items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/70 px-5 py-3 font-semibold text-white transition hover:border-blue-400/50 hover:bg-blue-500/10 hover:text-blue-300"
          >
            Visit live website
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}

export default function Work() {
  return (
    <section
      id="work"
      className="relative z-10 border-t border-slate-900/50 bg-transparent py-28 md:py-36"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 max-w-3xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-blue-300">
            Selected client work
          </p>
          <h2 className="text-4xl font-bold text-white md:text-5xl">
            Real websites built around real businesses
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-400">
            Each project starts with the way customers actually choose and
            contact the business. The design, pages, and tracking follow from
            that—not from a generic template checklist.
          </p>
        </div>

        <div className="space-y-8">
          {caseStudies.map((project, index) => (
            <CaseStudy key={project.title} project={project} reverse={index % 2 === 1} />
          ))}
        </div>

        <div className="mt-8 flex flex-col justify-between gap-5 rounded-2xl border border-slate-800 bg-slate-900/40 px-7 py-6 md:flex-row md:items-center">
          <p className="max-w-3xl text-sm leading-relaxed text-slate-400">
            Measured results will be added when each project has enough live
            traffic and campaign data to report them responsibly.
          </p>
          <a
            href="https://github.com/KadeStanford"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 font-semibold text-blue-300 transition hover:text-blue-200"
          >
            See development projects
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
