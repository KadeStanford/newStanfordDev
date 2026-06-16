import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function IosNextTest() {
  const [timings, setTimings] = useState(null);

  useEffect(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    if (!nav) return;

    setTimings({
      ttfb: Math.round(nav.responseStart),
      interactive: Math.round(nav.domInteractive),
      loaded: Math.round(nav.loadEventEnd),
    });
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 px-6 py-16">
      <Head>
        <title>iOS Next Load Test | Stanford Development Solutions</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">
          Minimal Next.js page
        </p>
        <h1 className="text-4xl font-bold text-white">Next shell test</h1>
        <p className="mt-4 leading-relaxed text-slate-300">
          This page uses the same Next.js app shell and domain, but it skips the
          homepage sections, hero screenshots, WebGL background, contact form,
          testimonials, and Firebase auth startup.
        </p>

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          {timings ? (
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                TTFB: <code className="text-blue-300">{timings.ttfb} ms</code>
              </li>
              <li>
                DOM interactive:{" "}
                <code className="text-blue-300">{timings.interactive} ms</code>
              </li>
              <li>
                Loaded:{" "}
                <code className="text-blue-300">{timings.loaded} ms</code>
              </li>
            </ul>
          ) : (
            <p className="text-sm text-slate-400">Collecting timings...</p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 text-sm">
          <a
            className="text-blue-300 hover:text-blue-200"
            href="/ios-static-test.html"
          >
            Open static test
          </a>
          <Link className="text-blue-300 hover:text-blue-200" href="/">
            Open homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
