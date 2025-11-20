import { useEffect } from "react";
import Head from "next/head";
import Lenis from "lenis";
import { Toaster } from "sonner";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import Services from "../components/Services";
import Work from "../components/Work";
import WhyUs from "../components/WhyUs";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import StarBackground from "../components/StarBackground";
import ScrollReveal from "../components/ScrollReveal";
import GlobeSection from "../components/GlobeSection"; // Import GlobeSection

export default function Home() {
  // Initialize Lenis Smooth Scroll
  useEffect(() => {
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
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500 selection:text-white overflow-x-hidden relative">
      <Head>
        <title>Stanford Development Solutions | Custom Web Development</title>
        <meta
          name="description"
          content="Innovative web solutions for modern businesses."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* 3D Star Background */}
      <StarBackground />

      {/* Global Notifications */}
      <Toaster position="bottom-right" theme="dark" richColors />

      <Navbar />

      <main className="relative z-10">
        {/* Hero handles its own internal animations */}
        <Hero />

        {/* Wrap other sections in ScrollReveal */}
        <ScrollReveal>
          <About />
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <Services />
        </ScrollReveal>

        <ScrollReveal>
          <Work />
        </ScrollReveal>

        <ScrollReveal>
          <WhyUs />
        </ScrollReveal>

        {/* Added Globe Section here */}
        <ScrollReveal>
          <GlobeSection />
        </ScrollReveal>

        <ScrollReveal>
          <Contact />
        </ScrollReveal>
      </main>

      <Footer />
    </div>
  );
}
