import Head from "next/head";
import Navbar from "../components/Navbar";
import ContactSection from "../components/Contact";
import Footer from "../components/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500 selection:text-white overflow-x-hidden relative">
      <Head>
        <title>Free Local Audit | Stanford Development Solutions</title>
        <meta
          name="description"
          content="Request a free local business website and ads audit from Kade Stanford at Stanford Development Solutions."
        />
      </Head>
      <Navbar />
      <main className="relative z-10 pt-20">
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
