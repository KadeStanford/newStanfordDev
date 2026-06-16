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
            Why Work With Me?
          </h2>
          <p className="text-slate-400">
            A practical website partner for local businesses that need trust,
            speed, and clear communication.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Code size={32} className="text-blue-400" />}
            title="Built Around Your Business"
            description="I do not hand you a generic template and disappear. I learn what you offer, where you work, and what a good lead looks like before building."
          />
          <FeatureCard
            icon={<Zap size={32} className="text-purple-400" />}
            title="Fast, Clear, Mobile First"
            description="Most local customers are on their phone. Your site should load quickly, explain what you do, and make the next step obvious."
          />
          <FeatureCard
            icon={<Monitor size={32} className="text-green-400" />}
            title="Easy To Reach"
            description="Forms, phone links, email paths, and tracking are treated as core features because missed leads are expensive."
          />
        </div>
      </div>
    </section>
  );
}
