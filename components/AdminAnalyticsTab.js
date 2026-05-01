import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  Globe,
  MousePointerClick,
  RefreshCw,
  Users,
  Briefcase,
  MessageSquare,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

function StatCard({ label, value, sub, accent = "from-blue-600/20 to-purple-600/10" }) {
  return (
    <div
      className={`rounded-xl border border-slate-800 bg-gradient-to-br ${accent} px-4 py-3`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-white tabular-nums">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function MiniBars({ data, valueKey = "count", labelKey = "day" }) {
  if (!data?.length) {
    return (
      <p className="text-sm text-slate-500">No series data for this range.</p>
    );
  }
  const nums = data.map((d) => Number(d[valueKey]) || 0);
  const max = Math.max(...nums, 1);
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <div
            className="w-full rounded-t bg-gradient-to-t from-blue-600 to-cyan-500/80 min-h-[4px] transition-all"
            style={{ height: `${(nums[i] / max) * 100}%` }}
            title={`${d[labelKey]}: ${nums[i]}`}
          />
          <span className="text-[9px] text-slate-500 truncate w-full text-center">
            {String(d[labelKey]).slice(0, 3)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AdminAnalyticsTab() {
  const [range, setRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { getFirebaseAuth } = await import("../lib/firebase");
      const auth = await getFirebaseAuth();
      if (!auth?.currentUser) {
        toast.error("Not signed in");
        setLoading(false);
        return;
      }
      const idToken = await auth.currentUser.getIdToken(true);
      // POST keeps the token in the body so CDNs/proxies cannot strip Authorization on GET.
      const res = await fetch("/api/admin/analytics-overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ range, idToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        const hint = data.code ? ` [${data.code}]` : "";
        toast.error((data.error || "Failed to load analytics") + hint);
        setPayload(null);
        return;
      }
      setPayload(data);
    } catch (e) {
      console.error(e);
      toast.error("Network error loading analytics");
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  const ga = payload?.ga;
  const internal = payload?.internal;
  const live = payload?.live;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="text-cyan-400" size={26} />
            Site analytics & leads
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Google Analytics for your marketing site, plus portal activity and
            live visitors on this server.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="28d">Last 28 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            type="button"
            onClick={() => load()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {payload?.gaError && (
        <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-100">
          <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
          <div className="text-sm">
            <p className="font-medium text-amber-200">GA4 not fully available</p>
            <p className="text-amber-100/90 mt-1">{payload.gaError}</p>
            <p className="text-xs text-amber-200/70 mt-2">
              Set <code className="bg-black/20 px-1 rounded">SITE_GA4_PROPERTY_ID</code>
              {" "}or{" "}
              <code className="bg-black/20 px-1 rounded">NEXT_PUBLIC_SITE_GA4_PROPERTY_ID</code>
              {" "}to the numeric Property ID (GA → Admin → Property settings),
              redeploy, then refresh. Same GA service account as client dashboards (
              <code className="bg-black/20 px-1 rounded">GA_SA_KEY_BASE64</code>
              ).
            </p>
          </div>
        </div>
      )}

      {loading && !payload ? (
        <p className="text-slate-400 text-sm">Loading analytics…</p>
      ) : null}

      {/* KPI row: GA + CRM */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Sessions (GA)"
          value={ga ? Number(ga.totalSessions).toLocaleString() : "—"}
          sub={ga ? `Range: ${range}` : undefined}
        />
        <StatCard
          label="Page views (GA)"
          value={ga ? Number(ga.totalPageViews).toLocaleString() : "—"}
          sub={ga ? `New users: ${Number(ga.newUsers || 0).toLocaleString()}` : undefined}
          accent="from-emerald-600/20 to-teal-600/10"
        />
        <StatCard
          label="Portal clients"
          value={
            internal ? String(internal.clients) : "—"
          }
          sub={
            internal
              ? `${internal.usersTotal} users · ${internal.projectsTotal} projects`
              : undefined
          }
          accent="from-violet-600/20 to-fuchsia-600/10"
        />
        <StatCard
          label="Testimonials queue"
          value={
            internal ? String(internal.testimonialsPending) : "—"
          }
          sub={
            internal
              ? `${internal.testimonialsApproved} approved`
              : undefined
          }
          accent="from-orange-600/20 to-rose-600/10"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Live server pulse */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Activity className="text-green-400" size={20} />
            Live site pulse (this server)
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Approximate visitors from heartbeat pings. Resets when the Node
            process restarts.
          </p>
          {live ? (
            <>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <StatCard
                  label="Active ~1m"
                  value={String(live.active?.m1 ?? 0)}
                  accent="from-slate-800 to-slate-900"
                />
                <StatCard
                  label="Active ~5m"
                  value={String(live.active?.m5 ?? 0)}
                  accent="from-slate-800 to-slate-900"
                />
                <StatCard
                  label="Active ~15m"
                  value={String(live.active?.m15 ?? 0)}
                  accent="from-slate-800 to-slate-900"
                />
              </div>
              <p className="text-xs text-slate-500 mb-2">Top paths (5 min)</p>
              <ul className="space-y-1 max-h-36 overflow-y-auto text-sm">
                {(live.pageCounts || []).slice(0, 8).map((r, i) => (
                  <li
                    key={i}
                    className="flex justify-between gap-2 text-slate-300 border-b border-slate-800/80 pb-1"
                  >
                    <span className="truncate font-mono text-xs">{r.path}</span>
                    <span className="text-cyan-400 tabular-nums">{r.count}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-slate-500 text-sm">No live data.</p>
          )}
        </div>

        {/* GA realtime */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Globe className="text-sky-400" size={20} />
            GA realtime (30 min)
          </h3>
          {ga?.realtime ? (
            <>
              <p className="text-3xl font-bold text-white mb-1">
                {Number(ga.realtime.totalActiveUsers || 0).toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Active users (summed buckets — indicative)
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {(ga.realtime.tech || []).map((t, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded-lg bg-slate-800 text-xs text-slate-300"
                  >
                    {t.device}: {t.activeUsers}
                  </span>
                ))}
              </div>
              <MiniBars
                data={(ga.realtime.minuteTrend || []).slice().reverse()}
                valueKey="activeUsers"
                labelKey="minutesAgo"
              />
            </>
          ) : (
            <p className="text-slate-500 text-sm">
              Connect GA4 to see realtime clusters.
            </p>
          )}
        </div>
      </div>

      {/* Sessions trend */}
      {ga?.dailyCounts?.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Sessions by day
          </h3>
          <MiniBars
            data={ga.dailyCounts.map((d) => ({
              day: d.date?.slice(-4) || d.date,
              count: d.count,
            }))}
          />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 overflow-hidden">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <MousePointerClick className="text-purple-400" size={20} />
            Top pages (GA)
          </h3>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-800">
                  <th className="pb-2 pr-2">Path</th>
                  <th className="pb-2 text-right">Views</th>
                </tr>
              </thead>
              <tbody>
                {(ga?.topPages || []).map((p, i) => (
                  <tr key={i} className="border-b border-slate-800/60">
                    <td className="py-2 pr-2 font-mono text-xs text-slate-300 truncate max-w-[200px]">
                      {p.path}
                    </td>
                    <td className="py-2 text-right text-cyan-400 tabular-nums">
                      {p.views}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 overflow-hidden">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <ExternalLink className="text-amber-400" size={20} />
            Landing pages (GA)
          </h3>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-800">
                  <th className="pb-2 pr-2">Landing page</th>
                  <th className="pb-2 text-right">Sessions</th>
                </tr>
              </thead>
              <tbody>
                {(payload?.landingPages || []).map((p, i) => (
                  <tr key={i} className="border-b border-slate-800/60">
                    <td className="py-2 pr-2 font-mono text-xs text-slate-300 truncate max-w-[220px]">
                      {p.landingPage}
                    </td>
                    <td className="py-2 text-right text-amber-400 tabular-nums">
                      {p.sessions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 overflow-hidden">
          <h3 className="text-lg font-semibold text-white mb-4">
            Traffic sources
          </h3>
          <ul className="space-y-2 max-h-56 overflow-y-auto text-sm">
            {(ga?.topReferrers || []).map((r, i) => (
              <li
                key={i}
                className="flex justify-between gap-2 border-b border-slate-800/60 pb-2"
              >
                <span className="text-slate-300 truncate">{r.source}</span>
                <span className="text-slate-400 tabular-nums">{r.sessions}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 overflow-hidden">
          <h3 className="text-lg font-semibold text-white mb-4">
            Top events (GA)
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Use this to spot form submits, CTAs, and custom events you&apos;ve
            configured in GA4.
          </p>
          <ul className="space-y-2 max-h-56 overflow-y-auto text-sm">
            {(payload?.topEvents || []).map((r, i) => (
              <li
                key={i}
                className="flex justify-between gap-2 border-b border-slate-800/60 pb-2"
              >
                <span className="text-slate-300 truncate font-mono text-xs">
                  {r.eventName}
                </span>
                <span className="text-emerald-400 tabular-nums">{r.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CRM / lead funnel */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Users className="text-blue-400" size={20} />
          Portal funnel (Firestore)
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center gap-3 rounded-xl bg-slate-950/50 border border-slate-800 p-3">
            <Users size={20} className="text-blue-400" />
            <div>
              <p className="text-xs text-slate-500">Accounts</p>
              <p className="text-xl font-bold text-white">
                {internal?.usersTotal ?? "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-950/50 border border-slate-800 p-3">
            <Briefcase size={20} className="text-purple-400" />
            <div>
              <p className="text-xs text-slate-500">Projects</p>
              <p className="text-xl font-bold text-white">
                {internal?.projectsTotal ?? "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-950/50 border border-slate-800 p-3">
            <MessageSquare size={20} className="text-amber-400" />
            <div>
              <p className="text-xs text-slate-500">Testimonials</p>
              <p className="text-xl font-bold text-white">
                {internal?.testimonialsTotal ?? "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-950/50 border border-slate-800 p-3">
            <BarChart3 size={20} className="text-cyan-400" />
            <div>
              <p className="text-xs text-slate-500">GA property</p>
              <p className="text-sm font-mono text-white truncate">
                {payload?.gaPropertyId || "—"}
              </p>
            </div>
          </div>
        </div>

        {internal?.projectsByStatus &&
          Object.keys(internal.projectsByStatus).length > 0 && (
            <div className="mb-6">
              <p className="text-xs text-slate-500 mb-2">Projects by status</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(internal.projectsByStatus).map(([k, v]) => (
                  <span
                    key={k}
                    className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-300"
                  >
                    {k}: {v}
                  </span>
                ))}
              </div>
            </div>
          )}

        <p className="text-xs text-slate-500 mb-2">Recent client signups</p>
        <div className="overflow-x-auto max-h-48 overflow-y-auto rounded-lg border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-950/80 sticky top-0">
              <tr className="text-left text-slate-500">
                <th className="p-2">Email</th>
                <th className="p-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {(internal?.recentSignups || []).map((u) => (
                <tr key={u.id} className="border-t border-slate-800/80">
                  <td className="p-2 text-slate-300 truncate max-w-[240px]">
                    {u.email}
                  </td>
                  <td className="p-2 text-slate-500 text-xs whitespace-nowrap">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-600 mt-4">
          Contact form submissions are emailed and not stored in Firestore. To
          log leads in-app, extend{" "}
          <code className="bg-slate-800 px-1 rounded">/api/contact</code> to
          write a document (e.g. collection{" "}
          <code className="bg-slate-800 px-1 rounded">leads</code>
          ).
        </p>
      </div>

      {payload?.fetchedAt && (
        <p className="text-xs text-slate-600 text-center">
          Last loaded: {new Date(payload.fetchedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}
