import { useEffect, useState, useRef } from "react";
import { Users, Activity, Globe } from "lucide-react";

function Sparkline({
  data = [],
  className = "",
  colorFrom = "#34D399",
  colorTo = "#06B6D4",
}) {
  const width = 220;
  const height = 48;
  if (!data || data.length === 0) {
    return <div className={`${className} text-xs text-slate-400`}>no data</div>;
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const last = data[data.length - 1];
  const lastX = width;
  const lastY = height - ((last - min) / range) * height;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="sparkGrad" x1="0" x2="1">
          <stop offset="0%" stopColor={colorFrom} stopOpacity="0.18" />
          <stop offset="100%" stopColor={colorTo} stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <polyline
        fill="url(#sparkGrad)"
        points={`${points} ${lastX},${height} 0,${height}`}
        stroke="none"
      />
      <polyline
        fill="none"
        stroke={colorTo}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
      <circle cx={lastX} cy={lastY} r="3" fill={colorTo} />
    </svg>
  );
}

export default function LiveAnalytics() {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    const sendHeartbeat = async () => {
      try {
        await fetch("/api/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path:
              typeof window !== "undefined" ? window.location.pathname : "/",
          }),
        });
      } catch (e) {
        // ignore
      }
    };

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/analytics");
        if (!res.ok) return;
        const json = await res.json();
        if (!mounted.current) return;
        setStats(json);
        const sample =
          (json && json.active && (json.active.m5 ?? json.active.m1)) || 0;
        setHistory((prev) => {
          const next = [...prev, sample].slice(-30);
          return next;
        });
      } catch (e) {
        // ignore
      }
    };

    sendHeartbeat();
    fetchStats();

    const hb = setInterval(sendHeartbeat, 15 * 1000);
    const poll = setInterval(fetchStats, 5 * 1000);

    return () => {
      mounted.current = false;
      clearInterval(hb);
      clearInterval(poll);
    };
  }, []);

  return (
    <section className="max-w-4xl mx-auto py-12 px-6">
      <div className="bg-gradient-to-r from-slate-900/60 to-slate-800/40 backdrop-blur rounded-2xl border border-slate-700 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600/20 rounded-lg shadow-sm">
              <Activity className="text-blue-400" size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold">Live Site Activity</h3>
              <p className="text-sm text-slate-400 max-w-lg">
                A simplified, real-time view of visitors — friendly metrics to
                help you feel confident.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-sm text-slate-400">
            <Globe size={14} />
            <span>
              {stats ? new Date(stats.timestamp).toLocaleTimeString() : "—"}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <div className="p-4 bg-slate-800/30 rounded-lg">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs text-slate-400">People Active (5m)</div>
                <div className="text-4xl font-bold mt-1">
                  {stats ? stats.active.m5 : "—"}
                </div>
                <div className="text-sm text-slate-400 mt-1">
                  Active in the last 5 minutes on this site
                </div>
              </div>
              <div className="w-full md:w-96">
                <Sparkline data={history} className="block" />
              </div>
            </div>

            <div className="mt-4 flex gap-3 flex-wrap">
              <div className="px-3 py-2 bg-slate-800/20 rounded-full text-center flex items-center gap-2">
                <div className="text-xs text-slate-400">1m</div>
                <div className="text-lg font-semibold flex items-center gap-2">
                  <Users className="text-emerald-300" size={16} />
                  <span>{stats ? stats.active.m1 : "—"}</span>
                </div>
              </div>
              <div className="px-3 py-2 bg-slate-800/20 rounded-full text-center flex items-center gap-2">
                <div className="text-xs text-slate-400">15m</div>
                <div className="text-lg font-semibold flex items-center gap-2">
                  <Users className="text-emerald-300" size={16} />
                  <span>{stats ? stats.active.m15 : "—"}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(() => {
                const v1d =
                  stats?.views?.day ??
                  stats?.views?.last24h ??
                  stats?.views1d ??
                  stats?.views_1d ??
                  "—";
                const v15d =
                  stats?.views?.days15 ??
                  stats?.views15d ??
                  stats?.views_15d ??
                  "—";
                const v1m =
                  stats?.views?.month ??
                  stats?.views30d ??
                  stats?.views1m ??
                  stats?.views_30d ??
                  "—";
                const v1y =
                  stats?.views?.year ??
                  stats?.views365d ??
                  stats?.views1y ??
                  stats?.views_365d ??
                  "—";

                const tile = (label, value) => (
                  <div
                    key={label}
                    className="p-3 bg-slate-800/20 rounded-lg flex items-center gap-3"
                  >
                    <div className="p-2 bg-slate-900/30 rounded-md">
                      <Users className="text-emerald-300" size={18} />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">{label}</div>
                      <div className="text-lg font-semibold">
                        {value ?? "—"}
                      </div>
                    </div>
                  </div>
                );

                return [
                  tile("1 day", v1d),
                  tile("15 days", v15d),
                  tile("1 month", v1m),
                  tile("1 year", v1y),
                ];
              })()}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
