import React from "react";
import { BentoGrid, BentoGridItem } from "./ui/BentoGrid";
import { Globe, Wrench, Cpu, Code, Wifi, Smartphone } from "lucide-react";
import NetworkBackground from "./NetworkBackground";

// --- REUSABLE COMPONENTS ---

const GridPattern = () => (
  <div
    className="absolute inset-0 w-full h-full opacity-[0.15] pointer-events-none"
    style={{
      backgroundImage: `linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(to right, #cbd5e1 1px, transparent 1px)`,
      backgroundSize: "20px 20px",
    }}
  />
);

// --- EXISTING GRAPHICS (Unchanged) ---

const BrowserGraphic = () => (
  <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
    <GridPattern />
    <div className="w-[85%] h-[80%] bg-slate-950 border border-slate-700 rounded-lg shadow-2xl flex flex-col overflow-hidden relative z-10 group-hover:scale-105 transition-transform duration-500">
      <div className="h-6 bg-slate-800 border-b border-slate-700 flex items-center px-2 gap-1.5">
        <div className="w-2 h-2 rounded-full bg-red-500/80"></div>
        <div className="w-2 h-2 rounded-full bg-yellow-500/80"></div>
        <div className="w-2 h-2 rounded-full bg-green-500/80"></div>
      </div>
      <div className="flex-1 flex">
        <div className="w-8 border-r border-slate-800 bg-slate-900/50"></div>
        <div className="flex-1 p-3 space-y-2">
          <div className="w-3/4 h-2 bg-slate-800 rounded-full animate-pulse"></div>
          <div className="w-1/2 h-2 bg-slate-800 rounded-full delay-75"></div>
          <div className="w-full h-16 bg-slate-800/50 rounded mt-2 border border-slate-800 border-dashed"></div>
        </div>
      </div>
    </div>
  </div>
);

const TerminalGraphic = () => (
  <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
    <GridPattern />
    <div className="w-[90%] h-[70%] bg-slate-950 border border-slate-800 rounded shadow-xl p-3 font-mono text-[10px] text-slate-400 flex flex-col justify-center group-hover:border-pink-500/30 transition-colors z-10">
      <div className="flex justify-between text-xs text-slate-600 mb-2 border-b border-slate-800 pb-1">
        <span>script.py</span>
        <span>Running...</span>
      </div>
      <p>
        <span className="text-pink-500">def</span>{" "}
        <span className="text-blue-400">optimize</span>():
      </p>
      <p className="pl-4 text-slate-500"># Auto-scaling logic</p>
      <p className="pl-4">
        return <span className="text-green-400">True</span>
      </p>
      <div className="mt-1 flex items-center gap-1">
        <span className="text-green-500">➜</span>
        <span className="animate-pulse bg-slate-500 w-2 h-4 inline-block"></span>
      </div>
    </div>
  </div>
);

const NetworkGraphic = () => (
  <div className="w-full h-full relative flex items-center justify-center bg-slate-900 overflow-hidden">
    <GridPattern />
    <div className="relative w-full h-full flex items-center justify-center z-10">
      <div className="absolute w-4 h-4 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)] z-20 group-hover:scale-125 transition-transform"></div>
      <div className="absolute w-32 h-32 border border-slate-700 rounded-full opacity-50 animate-[spin_10s_linear_infinite]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-slate-400 rounded-full"></div>
      </div>
      <div className="absolute w-48 h-48 border border-slate-800 rounded-full opacity-30 animate-[spin_15s_linear_infinite_reverse]">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-slate-500 rounded-full"></div>
      </div>
      <div className="absolute top-1/2 left-1/2 w-20 h-[1px] bg-gradient-to-r from-purple-500 to-transparent -translate-y-1/2 rotate-45"></div>
      <div className="absolute top-1/2 left-1/2 w-20 h-[1px] bg-gradient-to-r from-purple-500 to-transparent -translate-y-1/2 -rotate-45"></div>
    </div>
  </div>
);

const MobileGraphic = () => (
  <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
    <GridPattern />
    <div className="w-24 h-36 bg-slate-950 border-2 border-slate-700 rounded-2xl relative z-10 shadow-xl transform rotate-12 group-hover:rotate-0 transition-all duration-500">
      <div className="absolute inset-1 bg-slate-900 rounded-xl overflow-hidden flex flex-col">
        <div className="h-4 bg-slate-800 flex items-center justify-center gap-1">
          <div className="w-8 h-1 bg-slate-900 rounded-full"></div>
        </div>
        <div className="flex-1 p-2 space-y-1">
          <div className="w-full h-8 bg-violet-900/20 rounded"></div>
          <div className="grid grid-cols-2 gap-1">
            <div className="h-6 bg-slate-800 rounded"></div>
            <div className="h-6 bg-slate-800 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- NEW GRAPHICS ---

// UPDATED: Motherboard/Chip Schematic for "IT Support & Repair"
const HardwareGraphic = () => (
  <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
    <GridPattern />
    <div className="relative z-10 group-hover:scale-105 transition-transform duration-500">
      {/* Central Chip */}
      <div className="w-16 h-16 bg-slate-800 border border-slate-600 rounded flex items-center justify-center relative shadow-xl">
        <div className="w-8 h-8 border border-slate-500/50 rounded-sm flex items-center justify-center">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        </div>
        {/* Pins */}
        <div className="absolute -left-1 top-2 w-1 h-2 bg-slate-500"></div>
        <div className="absolute -left-1 top-6 w-1 h-2 bg-slate-500"></div>
        <div className="absolute -left-1 bottom-2 w-1 h-2 bg-slate-500"></div>
        <div className="absolute -right-1 top-2 w-1 h-2 bg-slate-500"></div>
        <div className="absolute -right-1 top-6 w-1 h-2 bg-slate-500"></div>
        <div className="absolute -right-1 bottom-2 w-1 h-2 bg-slate-500"></div>
      </div>

      {/* Traces (Circuit Lines) */}
      <div className="absolute top-1/2 left-full w-12 h-[2px] bg-slate-700 -translate-y-1/2">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-600 rounded-full"></div>
      </div>
      <div className="absolute top-1/2 right-full w-8 h-[2px] bg-slate-700 -translate-y-1/2">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-600 rounded-full"></div>
      </div>
      <div className="absolute left-1/2 bottom-full w-[2px] h-8 bg-slate-700 -translate-x-1/2"></div>

      {/* Decorative 'Capacitor' circles */}
      <div className="absolute -top-6 -left-6 w-4 h-4 border border-slate-600 rounded-full bg-slate-900/80"></div>
      <div className="absolute -bottom-4 -right-8 w-6 h-6 border border-slate-600 rounded-full bg-slate-900/80"></div>
    </div>
  </div>
);

// UPDATED: Kanban/Workflow Board for "Tech Consulting"
const ConsultingGraphic = () => (
  <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
    <GridPattern />
    {/* Kanban Board Container */}
    <div className="w-4/5 h-3/4 bg-slate-950 border border-slate-800 rounded-lg p-2 flex gap-2 z-10 shadow-xl group-hover:-translate-y-1 transition-transform duration-300">
      {/* Column 1 */}
      <div className="flex-1 bg-slate-900/50 rounded border border-slate-800/50 flex flex-col gap-1.5 p-1.5">
        <div className="w-full h-1.5 bg-slate-700 rounded-full mb-1 opacity-50"></div>
        <div className="w-full h-6 bg-slate-800 rounded border border-slate-700"></div>
        <div className="w-full h-6 bg-slate-800 rounded border border-slate-700"></div>
      </div>
      {/* Column 2 */}
      <div className="flex-1 bg-slate-900/50 rounded border border-slate-800/50 flex flex-col gap-1.5 p-1.5">
        <div className="w-full h-1.5 bg-slate-700 rounded-full mb-1 opacity-50"></div>
        <div className="w-full h-8 bg-teal-900/20 border border-teal-500/30 rounded relative overflow-hidden">
          <div className="absolute top-0 left-0 w-[1px] h-full bg-teal-500/50 animate-[shimmer_2s_infinite]"></div>
        </div>
      </div>
      {/* Column 3 */}
      <div className="flex-1 bg-slate-900/50 rounded border border-slate-800/50 flex flex-col gap-1.5 p-1.5">
        <div className="w-full h-1.5 bg-slate-700 rounded-full mb-1 opacity-50"></div>
        <div className="w-full h-6 bg-slate-800 rounded border border-slate-700 opacity-50"></div>
        <div className="w-full h-6 bg-slate-800 rounded border border-slate-700 opacity-50"></div>
        <div className="w-full h-6 bg-slate-800 rounded border border-slate-700 opacity-50"></div>
      </div>
    </div>
  </div>
);

export default function Services() {
  const services = [
    {
      title: "Web Development",
      icon: <Globe className="h-5 w-5 text-blue-400" />,
      description:
        "Custom high-performance websites using Next.js, React, and Tailwind CSS.",
      header: <BrowserGraphic />,
    },
    {
      title: "Network Solutions",
      icon: <Wifi className="h-5 w-5 text-purple-400" />,
      description:
        "Home & small office network design, router configuration, and optimization.",
      header: <NetworkGraphic />,
    },
    {
      title: "IT Support & Repair",
      icon: <Wrench className="h-5 w-5 text-red-400" />,
      description:
        "Hardware diagnostics, component upgrades, and software troubleshooting.",
      header: <HardwareGraphic />,
    },
    {
      title: "Automation Scripting",
      icon: <Code className="h-5 w-5 text-pink-400" />,
      description:
        "Custom Python and Bash scripting to automate repetitive workflows.",
      header: <TerminalGraphic />,
    },
    {
      title: "Tech Consulting",
      icon: <Cpu className="h-5 w-5 text-teal-400" />,
      description:
        "Expert advice on hardware procurement, software stack selection, and setups.",
      header: <ConsultingGraphic />,
    },
    {
      title: "Mobile App Dev",
      icon: <Smartphone className="h-5 w-5 text-violet-400" />,
      description: "Cross-platform mobile applications for iOS and Android.",
      header: <MobileGraphic />,
    },
  ];

  return (
    <section
      id="services"
      className="py-32 relative z-10 bg-transparent overflow-hidden"
    >
      <NetworkBackground />

      <div className="max-w-7xl mx-auto px-6 relative z-10 mb-16 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Technical Expertise
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Beyond web development, I provide a full suite of IT services to help
          businesses build, secure, and maintain their digital infrastructure.
        </p>
      </div>

      <BentoGrid className="relative z-10">
        {services.map((item, i) => (
          <BentoGridItem
            key={i}
            title={item.title}
            description={item.description}
            header={item.header}
            icon={item.icon}
          />
        ))}
      </BentoGrid>
    </section>
  );
}
