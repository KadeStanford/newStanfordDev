import React from "react";
import {
  Globe,
  Wrench,
  Cpu,
  Code,
  Wifi,
  Shield,
  Smartphone,
} from "lucide-react";
import SpotlightGroup from "./SpotlightGroup";
import NetworkBackground from "./NetworkBackground"; // Import the new background

export default function Services() {
  const services = [
    {
      title: "Web Development",
      icon: <Globe size={24} className="text-blue-400" />,
      description:
        "Custom high-performance websites using Next.js, React, and Tailwind CSS tailored to your brand.",
    },
    {
      title: "Network Solutions",
      icon: <Wifi size={24} className="text-purple-400" />,
      description:
        "Home & small office network design, router configuration, subnetting, and Wi-Fi optimization.",
    },
    {
      title: "IT Support & Repair",
      icon: <Wrench size={24} className="text-red-400" />,
      description:
        "Hardware diagnostics, component upgrades (RAM/SSD), and software troubleshooting.",
    },
    {
      title: "Automation Scripting",
      icon: <Code size={24} className="text-pink-400" />,
      description:
        "Custom Python and Bash scripting to automate repetitive business workflows and tasks.",
    },
    {
      title: "Tech Consulting",
      icon: <Cpu size={24} className="text-teal-400" />,
      description:
        "Expert advice on hardware procurement, software stack selection, and office tech setups.",
    },
    {
      title: "Mobile App Dev",
      icon: <Smartphone size={24} className="text-violet-400" />,
      description:
        "Cross-platform mobile applications designed for seamless user experience on iOS and Android.",
    },
  ];

  return (
    <section
      id="services"
      className="py-24 relative z-10 bg-transparent overflow-hidden"
    >
      {/* Add the Network Background behind content */}
      <NetworkBackground />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Technical Expertise
          </h2>
          <p className="text-slate-400 text-lg mt-6">
            Beyond web development, I provide a full suite of IT services to
            help businesses build, secure, and maintain their digital
            infrastructure.
          </p>
        </div>

        {/* Wrap the grid in SpotlightGroup for the mouse glow effect */}
        <SpotlightGroup className="flex flex-wrap justify-center gap-6">
          {services.map((service, i) => (
            <div
              key={i}
              className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] group p-8 bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl hover:bg-slate-800/80 hover:border-blue-500/30 transition-all duration-300 flex flex-col gap-4 relative z-10"
            >
              <div className="p-3 bg-slate-950 rounded-xl w-fit border border-slate-800 group-hover:border-slate-700 transition-colors">
                {service.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-200 group-hover:text-white mb-2">
                  {service.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </SpotlightGroup>
      </div>
    </section>
  );
}
