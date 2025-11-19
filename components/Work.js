import React, { useCallback } from "react";
import Image from "next/image";
import {
  ChevronRight,
  Github,
  ExternalLink,
  Layout,
  ChevronLeft,
} from "lucide-react";
import Tilt from "react-parallax-tilt";
import useEmblaCarousel from "embla-carousel-react";

function ProjectCard({ title, desc, tags, color, demoLink, repoLink, image }) {
  // ... (Keep ProjectCard logic exactly the same) ...
  const gradientMap = {
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-pink-500",
    green: "from-emerald-500 to-teal-500",
    pink: "from-pink-500 to-rose-500",
  };

  return (
    <Tilt
      tiltMaxAngleX={3}
      tiltMaxAngleY={3}
      scale={1.02}
      transitionSpeed={2000}
      className="h-full"
    >
      <div className="group h-full bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl overflow-hidden hover:border-slate-600 transition-all shadow-lg hover:shadow-blue-900/20 flex flex-col">
        <div
          className={`h-48 relative overflow-hidden bg-slate-900/40 shrink-0`}
        >
          {image && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="relative w-full h-full">
                <Image
                  src={`/images/${image}`}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
              <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/10 transition-colors" />
            </div>
          )}

          <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors" />
          <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur px-3 py-1 rounded-full border border-slate-700 text-xs font-mono text-white z-10">
            v1.0.0
          </div>
          <div className="absolute -right-6 -bottom-6 text-white opacity-10 transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500 z-10">
            <Layout size={120} />
          </div>
        </div>

        <div className="p-6 flex flex-col grow">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-grow">
            {desc}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-md border border-slate-700"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 border-t border-slate-800 pt-4 mt-auto">
            {demoLink ? (
              <a
                href={demoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-white hover:text-blue-400 transition-colors cursor-pointer"
              >
                <ExternalLink size={16} /> Live Demo
              </a>
            ) : (
              <span className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-not-allowed">
                <ExternalLink size={16} /> Live Demo
              </span>
            )}

            {repoLink && (
              <a
                href={repoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <Github size={16} /> Code
              </a>
            )}
          </div>
        </div>
      </div>
    </Tilt>
  );
}

export default function Work() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const projects = [
    {
      title: "Liberty House Specialties",
      desc: "A fully responsive commercial website featuring a modern catalog and custom contact forms.",
      tags: ["Next.js", "Tailwind", "Commercial"],
      color: "blue",
      image: "libertyHouse.png",
      demoLink: "https://libertyhousespecialties.com/",
      repoLink: "https://github.com/KadeStanford/example-site1",
    },
    {
      title: "Atlas IT",
      desc: "A comprehensive IT solutions dashboard designed for efficient network monitoring and asset management.",
      tags: ["React", "Dashboard", "Analytics"],
      color: "purple",
      image: "AtlasIT.png",
      demoLink: null,
      repoLink: "https://github.com/KadeStanford/atlas_it",
    },
    {
      title: "MarkType",
      desc: "A sophisticated markdown editor focused on distraction-free writing and seamless preview rendering.",
      tags: ["TypeScript", "Markdown", "Editor"],
      color: "green",
      image: "MarkType.png",
      demoLink: null,
      repoLink: "https://github.com/KadeStanford/MarkType",
    },
    {
      title: "Lion Connect",
      desc: "A mobile app designed to connect students with local business careers.",
      tags: ["React Native", "Mobile App", "iOS/Android"],
      color: "pink",
      image: null,
      demoLink: null,
      repoLink: null,
    },
  ];

  return (
    <section
      id="work"
      className="py-24 relative z-10 border-t border-slate-900/50 bg-transparent"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section: Improved Mobile Layout */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Featured Work
            </h2>
            <p className="text-slate-400">
              A selection of projects crafted with precision.
            </p>
          </div>

          {/* Controls Container: Stack on mobile, Row on desktop */}
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            {/* Arrows */}
            <div className="flex gap-2">
              <button
                onClick={scrollPrev}
                className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer border border-slate-700 hover:border-slate-500"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={scrollNext}
                className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer border border-slate-700 hover:border-slate-500"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Github Link */}
            <a
              href="https://github.com/KadeStanford"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 flex items-center gap-2 font-medium cursor-pointer px-4 py-2 rounded-full hover:bg-blue-500/10 transition-all"
            >
              GitHub <ChevronRight size={16} />
            </a>
          </div>
        </div>

        {/* Embla Carousel Container */}
        {/* Removed negative margins on mobile to prevent overflow */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-4">
            {projects.map((project, index) => (
              // Adjusted widths: 85% on mobile (so next card peeks), 48% tablet, 32% desktop
              <div
                key={index}
                className="flex-[0_0_85%] min-w-0 sm:flex-[0_0_48%] lg:flex-[0_0_32%] pl-4"
              >
                <ProjectCard
                  title={project.title}
                  desc={project.desc}
                  tags={project.tags}
                  color={project.color}
                  image={project.image}
                  demoLink={project.demoLink}
                  repoLink={project.repoLink}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
