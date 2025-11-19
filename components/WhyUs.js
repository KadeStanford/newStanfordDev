import React from "react";
import { Code, Zap, Monitor } from "lucide-react";

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-8 bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-2xl hover:bg-slate-800/60 hover:border-blue-500/30 transition-all duration-300 group">
      <div className="mb-6 p-4 bg-slate-950 rounded-xl inline-block shadow-inner group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

export default function WhyUs() {
  return (
    // FIXED: Changed to bg-transparent for the main section
    <section id="why-us" className="py-24 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Why Choose SDS?
          </h2>
          <p className="text-slate-400">
            The difference between a template and a tailored solution.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Code size={32} className="text-blue-400" />}
            title="Fully Custom Code"
            description="Other companies charge a premium for generic templates. We write clean, custom code tailored specifically to your needs."
          />
          <FeatureCard
            icon={<Zap size={32} className="text-purple-400" />}
            title="High Performance"
            description="Bloated site builders slow you down. Our hand-coded sites are optimized for speed, SEO, and user experience."
          />
          <FeatureCard
            icon={<Monitor size={32} className="text-green-400" />}
            title="Device Agnostic"
            description="Your site will look stunning on every screen size. Mobile-first design ensures you never miss a customer."
          />
        </div>
      </div>
    </section>
  );
}
