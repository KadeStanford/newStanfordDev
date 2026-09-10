import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
} from "lucide-react";

const processSteps = [
  {
    number: "01",
    title: "Audit",
    detail: "We identify the clearest opportunities to improve trust and lead flow.",
  },
  {
    number: "02",
    title: "Written scope",
    detail: "You receive a defined plan, timeline, price, and list of deliverables.",
  },
  {
    number: "03",
    title: "Build & launch",
    detail: "I handle the design, development, testing, and launch directly.",
  },
  {
    number: "04",
    title: "Care & growth",
    detail: "Ongoing support and advertising are available when you need them.",
  },
];

export default function About() {
  return (
    <section id="about" className="relative z-10 py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/70">
          <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
            <div className="relative min-h-[30rem] overflow-hidden border-b border-slate-800 bg-gradient-to-br from-blue-950/70 via-slate-950 to-slate-900 lg:border-b-0 lg:border-r">
              <div
                className="absolute inset-0 opacity-30"
                aria-hidden="true"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(59,130,246,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,.18) 1px, transparent 1px)",
                  backgroundSize: "36px 36px",
                }}
              />
              <Image
                src="/images/kadeCutout.png"
                alt="Kade Stanford, web developer and digital marketer"
                fill
                className="object-contain object-bottom px-6 pt-10"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/10 bg-slate-950/85 p-5 backdrop-blur-md sm:inset-x-8 sm:bottom-8">
                <p className="text-lg font-semibold text-white">Kade Stanford</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-300">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={15} className="text-blue-400" /> Louisiana based
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <GraduationCap size={16} className="text-blue-400" /> B.S. in
                    Information Technology
                  </span>
                </div>
              </div>
            </div>

            <div className="p-7 sm:p-10 lg:p-14">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
                Founder led, start to finish
              </p>
              <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                You work directly with the person building it.
              </h2>
              <div className="mt-7 max-w-2xl space-y-5 text-base leading-7 text-slate-300 sm:text-lg">
                <p>
                  I&apos;m Kade, an independent web developer and digital marketer
                  helping local service businesses turn their online presence into
                  a clearer path to calls and quote requests.
                </p>
                <p>
                  There is no account-manager handoff. I plan, design, build,
                  launch, host, and maintain your website—and when growth is the
                  next priority, I can manage Google and Meta advertising with the
                  same hands-on approach.
                </p>
              </div>

              <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex gap-3">
                  <GraduationCap className="mt-0.5 shrink-0 text-blue-400" size={22} />
                  <div>
                    <p className="font-semibold text-white">
                      Bachelor of Science in Information Technology
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      Southeastern Louisiana University · December 2025
                    </p>
                  </div>
                </div>
              </div>

              <ul className="mt-8 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                {[
                  "One direct point of contact",
                  "A defined scope before work begins",
                  "Responsive, mobile-first builds",
                  "Support after the site launches",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-blue-400"
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() =>
                    document
                      .getElementById("contact")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-500"
                >
                  Start a free audit <ArrowRight size={18} />
                </button>
                <button
                  onClick={() =>
                    document
                      .getElementById("work")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-6 py-3 font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-900"
                >
                  See my work
                </button>
              </div>

              <div className="mt-8 flex items-center gap-3 border-t border-slate-800 pt-6">
                {[
                  {
                    href: "https://github.com/KadeStanford",
                    label: "Kade Stanford on GitHub",
                    Icon: Github,
                  },
                  {
                    href: "https://www.linkedin.com/in/kadestanford",
                    label: "Kade Stanford on LinkedIn",
                    Icon: Linkedin,
                  },
                  {
                    href: "mailto:stanforddevcontact@gmail.com",
                    label: "Email Kade Stanford",
                    Icon: Mail,
                  },
                ].map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    aria-label={label}
                    className="rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-slate-400 transition-colors hover:border-blue-500/60 hover:text-blue-300"
                  >
                    <Icon size={19} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 bg-slate-900/30 px-7 py-9 sm:px-10 lg:px-14">
            <div className="mb-7 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                What working together looks like
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                A straightforward process with no mystery in the middle.
              </h3>
            </div>
            <ol className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {processSteps.map((step) => (
                <li key={step.number} className="border-l border-slate-700 pl-4">
                  <span className="font-mono text-xs font-semibold text-blue-400">
                    {step.number}
                  </span>
                  <p className="mt-2 font-semibold text-white">{step.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {step.detail}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
