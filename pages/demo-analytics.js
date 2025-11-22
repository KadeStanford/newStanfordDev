import Head from "next/head";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LiveAnalytics from "../components/LiveAnalytics";

export default function DemoAnalytics() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Head>
        <title>Analytics Demo - Stanford Development Solutions</title>
        <meta name="description" content="Live analytics demo (demo mode)." />
      </Head>

      <Navbar />

      <main className="py-12">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-4">Live Analytics Demo</h1>
          <p className="text-slate-400 mb-6">
            This page shows a demo of the Live Analytics panel using the
            existing `LiveAnalytics` component with sample data from the server.
          </p>

          <LiveAnalytics />
        </div>
      </main>

      <Footer />
    </div>
  );
}
