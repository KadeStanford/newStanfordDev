import { useEffect, useState, useRef } from "react";
import { Users, Activity, Globe, Clock } from "lucide-react";

export default function LiveAnalytics() {
  const [stats, setStats] = useState(null);
  if (!stats) {
    return (
      <section className="max-w-4xl mx-auto py-12 px-6">
        <h2 className="text-2xl font-semibold mb-4">Live Site Activity</h2>
        <p className="text-slate-400">Loading friendly live metrics…</p>
      </section>
    );
  }

  const friendlyIP = (ip) => {
    if (!ip || ip === "unknown") return "—";
    // mask last octet if IPv4
    try {
      if (ip.includes(".")) {
        const parts = ip.split(".");
        parts[parts.length - 1] = "xxx";
        return parts.join(".");
      }
      // mask for IPv6-like
      return ip.slice(0, 6) + "…";
    } catch (e) {
      return "—";
    }
  };

  return (
    <section className="max-w-4xl mx-auto py-12 px-6 bg-gradient-to-r from-slate-900/60 to-slate-800/40 backdrop-blur rounded-2xl border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-full shadow-md">
            <Activity className="text-white" size={18} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Live Site Activity</h2>
            <p className="text-sm text-slate-400">
              A simplified, real-time view of who are visiting — no technical
              jargon.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <Globe size={14} />
          <span>{new Date(stats.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-2 p-4 bg-slate-800/30 rounded">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded">
              <Users className="text-emerald-300" />
            </div>
            <div>
              <div className="text-xs text-slate-400">People Active</div>
              <div className="text-3xl font-bold">{stats.active.m5}</div>
              <div className="text-sm text-slate-400">
                Active in the last 5 minutes
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-900/30 rounded text-center">
              <div className="text-xs text-slate-400">1 minute</div>
              <div className="text-xl font-semibold">{stats.active.m1}</div>
            </div>
            <div className="p-3 bg-slate-900/30 rounded text-center">
              <div className="text-xs text-slate-400">5 minutes</div>
              <div className="text-xl font-semibold">{stats.active.m5}</div>
            </div>
            <div className="p-3 bg-slate-900/30 rounded text-center">
              <div className="text-xs text-slate-400">15 minutes</div>
              <div className="text-xl font-semibold">{stats.active.m15}</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-800/30 rounded">
          <div className="text-xs text-slate-400">Popular pages (5m)</div>
          <ul className="mt-2 space-y-2">
            {stats.pageCounts.length === 0 && (
              <li className="text-sm text-slate-400">No recent page views</li>
            )}
            {stats.pageCounts.map((p, i) => (
              <li
                key={p.path}
                className="flex items-center justify-between gap-2"
              >
                <div className="truncate text-sm">{p.path}</div>
                <div className="text-sm font-semibold text-slate-100">
                  {p.count}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6">
        <div className="text-xs text-slate-400 mb-2">Recent visitors</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
          {stats.recent.map((r, i) => (
            <div
              key={i}
              className="p-2 bg-slate-900/20 rounded flex items-center justify-between text-xs"
            >
              <div className="truncate">
                {new Date(r.ts).toLocaleTimeString()} —{" "}
                <span className="font-medium">{r.path}</span>
              </div>
              <div className="text-slate-400 ml-2">{friendlyIP(r.ip)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
