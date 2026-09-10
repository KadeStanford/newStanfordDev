import { ArrowRight, Check, CircleDollarSign, ShieldCheck } from "lucide-react";

const websiteOffers = [
  {
    name: "Launch Page",
    price: "$1,000",
    cadence: "starting project price",
    description:
      "One focused page for a new or very small business that needs a professional place to send customers.",
    features: [
      "One conversion-focused page",
      "Mobile-first custom design",
      "Contact form and analytics",
      "Basic search setup",
    ],
  },
  {
    name: "Local Business Website",
    price: "$2,500",
    cadence: "starting project price",
    description:
      "The right fit for most service businesses: a credible site that clearly explains the work and creates inquiries.",
    featured: true,
    features: [
      "Up to 5 core pages",
      "Custom design and development",
      "Service-focused copy guidance",
      "Lead and analytics tracking",
      "On-page SEO foundation",
    ],
  },
  {
    name: "Lead-Generation Website",
    price: "$3,500",
    cadence: "starting project price",
    description:
      "For businesses targeting several services, locations, or campaigns with a more complete lead-generation system.",
    features: [
      "Expanded service and location pages",
      "Campaign landing pages",
      "Advanced conversion tracking",
      "Local search structure",
      "Custom integrations as scoped",
    ],
  },
];

const marketingOffers = [
  {
    name: "Google Ads",
    setup: "$1,250 setup",
    monthly: "$600/month",
    description:
      "Google Search and eligible Local Services campaigns for people actively looking for your services.",
    features: [
      "Account, campaign, and tracking setup",
      "Ongoing search-term and bid refinement",
      "Monthly reporting and strategy call",
    ],
  },
  {
    name: "Google + Meta",
    setup: "$1,750 setup",
    monthly: "$900/month",
    description:
      "Coordinated Google, Facebook, and Instagram campaigns with one measurement system.",
    featured: true,
    features: [
      "Google and Meta campaign management",
      "Retargeting and audience testing",
      "Tracking dashboard and monthly review",
    ],
  },
  {
    name: "Growth Partner",
    setup: "Custom setup",
    monthly: "From $1,250/month",
    description:
      "Hands-on marketing support when you also need content, review management, customer reactivation, or rapid campaigns.",
    features: [
      "Everything in Google + Meta",
      "Defined content-production allowance",
      "Additional channels scoped in writing",
    ],
  },
];

function FeatureList({ features }) {
  return (
    <ul className="mt-6 flex-1 space-y-3">
      {features.map((feature) => (
        <li key={feature} className="flex gap-3 text-sm text-slate-300">
          <Check
            size={17}
            className="mt-0.5 shrink-0 text-blue-400"
            aria-hidden="true"
          />
          {feature}
        </li>
      ))}
    </ul>
  );
}

export default function Pricing() {
  const requestAudit = () => {
    window.__openEstimateFormRequested = true;
    window.dispatchEvent(new Event("openEstimateForm"));
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="pricing" className="relative z-10 py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm font-semibold text-blue-200">
            <CircleDollarSign size={17} aria-hidden="true" />
            Clear starting points
          </div>
          <h2 className="text-4xl font-bold text-white md:text-5xl">
            Know the likely investment before we talk
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-400">
            These prices cover common starting scopes. Your free audit leads to
            a written proposal showing exactly what is included before any paid
            work begins.
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-blue-300">
            Websites
          </p>
          <h3 className="mb-8 text-2xl font-bold text-white md:text-3xl">
            Built once, designed to keep working
          </h3>
          <div className="grid gap-6 lg:grid-cols-3">
            {websiteOffers.map((offer) => (
              <article
                key={offer.name}
                className={`relative flex h-full flex-col rounded-2xl border p-7 ${
                  offer.featured
                    ? "border-blue-400/50 bg-blue-500/10 shadow-2xl shadow-blue-950/30"
                    : "border-slate-800 bg-slate-900/60"
                }`}
              >
                {offer.featured && (
                  <span className="absolute right-5 top-5 rounded-full bg-blue-500 px-3 py-1 text-xs font-bold text-white">
                    Most popular
                  </span>
                )}
                <h4 className="pr-24 text-xl font-bold text-white">
                  {offer.name}
                </h4>
                <div className="mt-5">
                  <span className="text-4xl font-bold tracking-tight text-white">
                    {offer.price}
                  </span>
                  <p className="mt-1 text-sm text-slate-500">{offer.cadence}</p>
                </div>
                <p className="mt-5 text-sm leading-relaxed text-slate-300">
                  {offer.description}
                </p>
                <FeatureList features={offer.features} />
              </article>
            ))}
          </div>
        </div>

        <div className="mt-20">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-purple-300">
            Advertising
          </p>
          <h3 className="mb-3 text-2xl font-bold text-white md:text-3xl">
            Management fees stay separate from your ad budget
          </h3>
          <p className="mb-8 max-w-3xl text-slate-400">
            Advertising charges go directly to Google or Meta on your card. My
            fee covers setup, management, measurement, and the agreed reporting
            or content workload.
          </p>
          <div className="grid gap-6 lg:grid-cols-3">
            {marketingOffers.map((offer) => (
              <article
                key={offer.name}
                className={`flex h-full flex-col rounded-2xl border p-7 ${
                  offer.featured
                    ? "border-purple-400/50 bg-purple-500/10"
                    : "border-slate-800 bg-slate-900/60"
                }`}
              >
                <h4 className="text-xl font-bold text-white">{offer.name}</h4>
                <p className="mt-5 text-2xl font-bold text-white">
                  {offer.setup}
                </p>
                <p className="mt-1 text-xl font-semibold text-purple-300">
                  {offer.monthly}
                </p>
                <p className="mt-5 text-sm leading-relaxed text-slate-300">
                  {offer.description}
                </p>
                <FeatureList features={offer.features} />
              </article>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-2xl border border-emerald-400/25 bg-emerald-400/5 p-7">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-emerald-400" aria-hidden="true" />
              <h3 className="text-xl font-bold text-white">
                Website Care & Hosting — $175/month
              </h3>
            </div>
            <p className="mt-4 leading-relaxed text-slate-300">
              Includes hosting, monitoring, routine maintenance, and up to two
              small content requests or 60 minutes of edits each month,
              whichever comes first.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Unused time does not roll over. New pages, redesigns, integrations,
              campaign work, and feature development receive a separate quote
              before work starts.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-7">
            <h3 className="text-xl font-bold text-white">Creative add-ons</h3>
            <p className="mt-4 leading-relaxed text-slate-300">
              Static ad graphics start at $250 for a defined batch. Video,
              ongoing social content, email campaigns, and SMS campaigns are
              scoped separately based on quantity and frequency.
            </p>
          </article>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-5 rounded-2xl border border-slate-800 bg-slate-900/40 px-7 py-6 text-center md:flex-row md:text-left">
          <p className="max-w-3xl text-sm leading-relaxed text-slate-400">
            Starting prices are planning figures, not binding quotes. Ad spend,
            domains, premium software, and unusual third-party costs are
            separate unless your written proposal says otherwise.
          </p>
          <button
            type="button"
            onClick={requestAudit}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
          >
            Get my exact scope
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
