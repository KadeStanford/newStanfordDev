import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Github, Linkedin, Mail, ArrowUpRight } from "lucide-react";
import Tilt from "react-parallax-tilt";
import { RoughNotation, RoughNotationGroup } from "react-rough-notation";

// Render annotations only after a short mount delay so the library can
// measure the DOM element sizes reliably. This prevents NaN coordinates
// in generated SVG paths when measurements happen too early.
function AnnotationWrapper() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsReady(true), 120);
    return () => clearTimeout(t);
  }, []);

  if (!isReady) {
    // Render plain text as a safe fallback while measurements stabilize.
    return (
      <p className="text-slate-300 leading-relaxed max-w-2xl text-lg">
        I build <span className="text-blue-400">fast</span>,{" "}
        <span className="text-purple-400">accessible</span>, and beautiful
        websites for small businesses. I focus on{" "}
        <span className="bg-yellow-400/10 px-1 rounded text-yellow-300">
          custom solutions
        </span>{" "}
        that convert visitors into customers while keeping maintenance simple
        for non-technical owners.
      </p>
    );
  }

  return (
    <RoughNotationGroup show={true}>
      <p className="text-slate-300 leading-relaxed max-w-2xl text-lg">
        I build{" "}
        <RoughNotation type="underline" color="#3b82f6">
          fast
        </RoughNotation>
        ,{" "}
        <RoughNotation type="underline" color="#8b5cf6">
          accessible
        </RoughNotation>
        , and beautiful websites for small businesses. I focus on{" "}
        <RoughNotation type="highlight" color="#3b82f620" multiline>
          custom solutions
        </RoughNotation>{" "}
        that convert visitors into customers while keeping maintenance simple
        for non-technical owners.
      </p>
    </RoughNotationGroup>
  );
}

export default function About() {
  return (
    <section id="about" className="py-36 md:py-44 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center">
          {/* Left Column: Image with Effects */}
          <div className="w-full md:w-1/3">
            <Tilt
              tiltMaxAngleX={7}
              tiltMaxAngleY={7}
              scale={1.03}
              transitionSpeed={1500}
              perspective={1000}
              className="group"
            >
              <div className="relative w-72 h-72 md:w-80 md:h-80 mx-auto md:mx-0">
                <div
                  className="absolute -inset-2 rounded-2xl overflow-hidden"
                  aria-hidden="true"
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 opacity-60 blur-2xl transform rotate-6 group-hover:rotate-0 transition-all duration-700 animate-gradient"
                    style={{
                      backgroundSize: "200% 200%",
                      animationDuration: "10s",
                    }}
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-indigo-400 to-blue-600 opacity-30 blur-3xl transform rotate-12 group-hover:rotate-0 transition-all duration-700 animate-gradient"
                    style={{
                      backgroundSize: "200% 200%",
                      animationDuration: "14s",
                      animationDelay: "4s",
                    }}
                  />
                </div>

                <div className="relative w-full h-full rounded-2xl border border-slate-700 overflow-hidden z-10 bg-slate-800/30 backdrop-blur-sm transform-gpu transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105">
                  <Image
                    src="/images/kadeCutout.png"
                    alt="Kade Stanford"
                    fill
                    className="object-contain drop-shadow-2xl transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-2"
                    sizes="(max-width: 768px) 18rem, 20rem"
                  />
                  <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur text-white px-3 py-1 rounded-full text-sm font-semibold border border-slate-700/50">
                    Kade Stanford
                  </div>
                  <div className="absolute top-3 right-3 bg-white/10 backdrop-blur rounded-full w-10 h-10 flex items-center justify-center border border-white/10 text-blue-300">
                    <ArrowUpRight size={20} />
                  </div>
                </div>
              </div>
            </Tilt>
          </div>

          {/* Right Column: Content */}
          <div className="w-full md:w-2/3 space-y-8 text-center md:text-left">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Meet the Developer
              </h2>
              <h3 className="text-2xl md:text-3xl text-blue-400 font-medium">
                Kade Stanford — Full Stack Web Developer
              </h3>
            </div>

            <AnnotationWrapper />

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2 justify-center md:justify-start">
              <button
                onClick={() =>
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
              >
                Start a Project
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("work")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border border-slate-600 text-slate-200 rounded-lg hover:bg-slate-800 hover:border-slate-500 transition-all hover:scale-105 active:scale-95"
              >
                View Portfolio
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3 text-left">
                <h4 className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                  Core Services
                </h4>
                <ul className="text-slate-300 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>{" "}
                    Custom marketing websites
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>{" "}
                    Performance & SEO improvements
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>{" "}
                    E‑commerce and integrations
                  </li>
                </ul>
              </div>
              <div className="space-y-3 text-left">
                <h4 className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                  Tech Stack
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Next.js",
                    "React",
                    "Tailwind",
                    "Node",
                    "Express",
                    "SEO",
                  ].map((s) => (
                    <span
                      key={s}
                      className="text-xs bg-slate-800/50 px-2.5 py-1 rounded-md border border-slate-700 text-blue-200 font-mono hover:bg-slate-800 transition-colors cursor-default"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center md:justify-start pt-4 border-t border-slate-800/50">
              <a
                href="https://github.com/KadeStanford"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-slate-800 rounded-lg hover:bg-blue-600 hover:text-white transition-colors group"
              >
                <Github
                  size={20}
                  className="text-slate-400 group-hover:text-white transition-colors"
                />
              </a>
              <a
                href="https://www.linkedin.com/in/kadestanford"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-slate-800 rounded-lg hover:bg-blue-600 hover:text-white transition-colors group"
              >
                <Linkedin
                  size={20}
                  className="text-slate-400 group-hover:text-white transition-colors"
                />
              </a>
              <a
                href="mailto:stanforddevcontact@gmail.com"
                className="p-2.5 bg-slate-800 rounded-lg hover:bg-blue-600 hover:text-white transition-colors group"
              >
                <Mail
                  size={20}
                  className="text-slate-400 group-hover:text-white transition-colors"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
