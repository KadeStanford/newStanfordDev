import React from "react";
import { Terminal, Github, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    // UPDATED: Using backdrop-blur and a semi-transparent background to blend with the starfield
    <footer className="bg-slate-950/60 backdrop-blur-md border-t border-slate-800 py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
        {/* Left Section: Logo and Copyright */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter text-white">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
              <Terminal size={18} />
            </div>
            <span>
              SDS<span className="text-blue-500">.</span>
            </span>
          </div>
          <div className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Stanford Development Solutions.
          </div>
        </div>

        {/* Right Section: Links and Socials */}
        <div className="flex flex-col items-center md:items-end gap-4">
          {/* Social Icons */}
          <div className="flex gap-4">
            <a
              href="https://github.com/KadeStanford"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:bg-blue-600 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <Github size={20} />
            </a>
            <a
              href="https://www.linkedin.com/in/kadestanford"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:bg-blue-600 hover:text-white transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} />
            </a>
            <a
              href="mailto:contact@stanforddevsolutions.com"
              className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:bg-blue-600 hover:text-white transition-colors"
              aria-label="Email"
            >
              <Mail size={20} />
            </a>
          </div>

          {/* Policy Links */}
          <div className="flex gap-6 text-slate-400 text-sm">
            <a
              href="#"
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
