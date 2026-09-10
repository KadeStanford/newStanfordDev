import Head from "next/head";
import Link from "next/link";
import { Terminal } from "lucide-react";
import Footer from "./Footer";
import { siteUrl } from "../next-seo.config";

export default function LegalPageLayout({ title, description, children }) {
  const canonical = `${siteUrl}/${title === "Privacy Policy" ? "privacy" : "terms"}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Head>
        <title>{title} | Stanford Development Solutions</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={`${title} | Stanford Development Solutions`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
      </Head>

      <header className="border-b border-slate-800 bg-slate-950/90">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2 font-bold text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Terminal size={19} />
            </span>
            Stanford Development Solutions
          </Link>
          <Link href="/" className="text-sm text-blue-400 hover:text-blue-300">
            Back to site
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">
          Effective September 10, 2026
        </p>
        <h1 className="mb-10 text-4xl font-bold tracking-tight text-white md:text-5xl">
          {title}
        </h1>
        <article className="legal-copy space-y-8">{children}</article>
      </main>

      <Footer />
      <style jsx global>{`
        .legal-copy h2 { color: white; font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; }
        .legal-copy p, .legal-copy li { color: rgb(148 163 184); line-height: 1.75; }
        .legal-copy ul { list-style: disc; padding-left: 1.5rem; }
        .legal-copy a { color: rgb(96 165 250); }
        .legal-copy a:hover { color: rgb(147 197 253); }
      `}</style>
    </div>
  );
}
