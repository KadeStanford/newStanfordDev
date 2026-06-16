import { useEffect, useState } from "react";

const TESTS = [
  { label: "Baseline", query: "iosdebug=1" },
  { label: "No stars", query: "iosdebug=1&nostars=1" },
  { label: "No graph", query: "iosdebug=1&nograph=1" },
  { label: "No reveals", query: "iosdebug=1&noreveal=1" },
  { label: "No deferred", query: "iosdebug=1&nodeferred=1" },
  { label: "No Lenis", query: "iosdebug=1&nolenis=1" },
  {
    label: "Lite",
    query: "iosdebug=1&lite=1",
  },
];

function readTimings() {
  const nav = performance.getEntriesByType("navigation")[0];
  const resources = performance
    .getEntriesByType("resource")
    .filter((entry) => entry.duration > 100)
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 8)
    .map((entry) => {
      const url = new URL(entry.name);
      return {
        name: `${url.pathname}${url.search}`.slice(0, 72),
        duration: Math.round(entry.duration),
        size: Math.round(entry.transferSize || entry.encodedBodySize || 0),
      };
    });

  return {
    now: Math.round(performance.now()),
    ttfb: nav ? Math.round(nav.responseStart) : null,
    interactive: nav ? Math.round(nav.domInteractive) : null,
    loaded: nav ? Math.round(nav.loadEventEnd) : null,
    resources,
  };
}

export default function PerfDiagnostics({ flags }) {
  const [timings, setTimings] = useState(null);

  useEffect(() => {
    const update = () => setTimings(readTimings());
    update();

    const onLoad = () => window.setTimeout(update, 300);
    window.addEventListener("load", onLoad);

    const timer = window.setTimeout(update, 3500);
    return () => {
      window.removeEventListener("load", onLoad);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <aside className="fixed bottom-4 left-4 right-4 z-[100] max-h-[58vh] overflow-auto rounded-xl border border-blue-400/30 bg-slate-950/95 p-4 text-xs text-slate-200 shadow-2xl md:left-auto md:w-[420px]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold uppercase tracking-[0.16em] text-blue-300">
            iOS debug
          </p>
          <p className="mt-1 text-slate-400">
            Active:{" "}
            {Object.entries(flags)
              .filter(([, value]) => value)
              .map(([key]) => key)
              .join(", ") || "baseline"}
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg border border-slate-700 px-3 py-2 text-slate-300"
          onClick={() => setTimings(readTimings())}
        >
          Refresh
        </button>
      </div>

      {timings && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
          <div className="grid grid-cols-2 gap-2">
            <span>Now</span>
            <code className="text-blue-300">{timings.now} ms</code>
            <span>TTFB</span>
            <code className="text-blue-300">{timings.ttfb ?? "n/a"} ms</code>
            <span>DOM interactive</span>
            <code className="text-blue-300">
              {timings.interactive ?? "n/a"} ms
            </code>
            <span>Loaded</span>
            <code className="text-blue-300">{timings.loaded ?? "n/a"} ms</code>
          </div>

          {!!timings.resources.length && (
            <div className="mt-3 border-t border-slate-800 pt-3">
              <p className="mb-2 font-semibold text-slate-300">
                Slow resources
              </p>
              <ul className="space-y-2">
                {timings.resources.map((resource) => (
                  <li key={`${resource.name}-${resource.duration}`}>
                    <div className="truncate text-slate-300">
                      {resource.name}
                    </div>
                    <code className="text-blue-300">
                      {resource.duration} ms
                    </code>
                    {resource.size > 0 && (
                      <span className="ml-2 text-slate-500">
                        {Math.round(resource.size / 1024)} KB
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        {TESTS.map((test) => (
          <button
            key={test.query}
            type="button"
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-left text-slate-300"
            onClick={() => {
              window.location.href = `/?${test.query}`;
            }}
          >
            {test.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
