import { useEffect, useState } from "react";
import Head from "next/head";
import Lenis from "lenis";
import { Toaster } from "sonner";

import Navbar from "../components/Navbar";
import Hero from "../components/HeroAB";
import About from "../components/About";
import Services from "../components/Services";
import Work from "../components/Work";
import WhyUs from "../components/WhyUs";
import Footer from "../components/Footer";
import ScrollReveal from "../components/ScrollReveal";
import dynamic from "next/dynamic";

// Lazy-load heavy/visual components to keep initial JS small and avoid
// opening costly WebGL or polling work during the critical path.
const StarBackground = dynamic(() => import("../components/StarBackground"), {
  ssr: false,
  loading: () => null,
});

const TestimonialsDisplay = dynamic(
  () => import("../components/TestimonialsDisplay"),
  {
    ssr: false,
    loading: () => null,
  }
);

const Contact = dynamic(() => import("../components/Contact"), {
  ssr: false,
  loading: () => (
    <section id="contact" className="py-32 relative z-10 overflow-hidden" />
  ),
});

const PerfDiagnostics = dynamic(() => import("../components/PerfDiagnostics"), {
  ssr: false,
});

const DEFAULT_DEBUG_FLAGS = {
  debug: false,
  lite: false,
  nostars: false,
  nograph: false,
  noreveal: false,
  nodeferred: false,
  nolenis: false,
};

function getDebugFlags() {
  if (typeof window === "undefined") return DEFAULT_DEBUG_FLAGS;

  const params = new URLSearchParams(window.location.search);
  const lite = params.get("lite") === "1";
  return {
    debug: params.get("iosdebug") === "1",
    lite,
    nostars: lite || params.get("nostars") === "1",
    nograph: lite || params.get("nograph") === "1",
    noreveal: lite || params.get("noreveal") === "1",
    nodeferred: lite || params.get("nodeferred") === "1",
    nolenis: lite || params.get("nolenis") === "1",
  };
}

export default function Home() {
  const [debugFlags, setDebugFlags] = useState(DEFAULT_DEBUG_FLAGS);

  useEffect(() => {
    setDebugFlags(getDebugFlags());
  }, []);

  // Initialize Lenis Smooth Scroll
  useEffect(() => {
    if (debugFlags.nolenis) return undefined;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [debugFlags.nolenis]);

  const reveal = (children, delay = 0) =>
    debugFlags.noreveal ? children : <ScrollReveal delay={delay}>{children}</ScrollReveal>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500 selection:text-white overflow-x-hidden relative">
      <Head>
        <title>
          Stanford Development Solutions | Websites & Ads for Local Businesses
        </title>
        <meta
          name="description"
          content="Custom websites, local SEO, lead tracking, and practical ad setup for local small businesses built personally by Kade Stanford."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* 3D Star Background */}
      {!debugFlags.nostars && <StarBackground />}

      {/* Global Notifications */}
      <Toaster position="bottom-right" theme="dark" richColors />

      <Navbar />

      <main className="relative z-10">
        {/* Hero handles its own internal animations */}
        <Hero />

        {/* Wrap other sections in ScrollReveal */}
        {reveal(<About />)}

        {reveal(<Services disableNetwork={debugFlags.nograph} />, 0.2)}

        {reveal(<Work />)}

        {!debugFlags.nodeferred && (
          reveal(<TestimonialsDisplay limit={3} />)
        )}

        {reveal(<WhyUs />)}

        {!debugFlags.nodeferred && (
          reveal(<Contact />)
        )}
      </main>

      <Footer />
      {debugFlags.debug && <PerfDiagnostics flags={debugFlags} />}
    </div>
  );
}
