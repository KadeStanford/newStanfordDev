// Ephemeral, privacy-preserving activity counters. Raw IP addresses and user
// agents are never stored. GA4 remains the durable analytics source of truth.

const HEARTBEATS = [];
const MAX_ENTRIES = 1000;

function recordHeartbeat({
  path = "/",
  visitorHash = "unknown",
  ts = Date.now(),
}) {
  HEARTBEATS.push({ path, visitorHash, ts });
  // Keep size bounded
  if (HEARTBEATS.length > MAX_ENTRIES) HEARTBEATS.shift();
}

function getStats() {
  const now = Date.now();
  const oneMinute = now - 60 * 1000;
  const fiveMinutes = now - 5 * 60 * 1000;
  const fifteenMinutes = now - 15 * 60 * 1000;

  const recent = HEARTBEATS.filter((h) => h.ts >= fiveMinutes);
  const lastMinute = HEARTBEATS.filter((h) => h.ts >= oneMinute);
  const lastFifteen = HEARTBEATS.filter((h) => h.ts >= fifteenMinutes);

  const active1 = new Set(lastMinute.map((h) => h.visitorHash)).size;
  const active5 = new Set(recent.map((h) => h.visitorHash)).size;
  const active15 = new Set(lastFifteen.map((h) => h.visitorHash)).size;

  // page views in last 5 minutes grouped by path
  const pageCounts = recent.reduce((acc, h) => {
    acc[h.path] = (acc[h.path] || 0) + 1;
    return acc;
  }, {});

  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }));

  const recentEvents = HEARTBEATS.slice(-50)
    .reverse()
    .map(({ path, ts }) => ({ path, ts }));

  return {
    timestamp: now,
    active: { m1: active1, m5: active5, m15: active15 },
    pageCounts: topPages,
    recent: recentEvents,
    totalRecorded: HEARTBEATS.length,
  };
}

module.exports = { recordHeartbeat, getStats };
