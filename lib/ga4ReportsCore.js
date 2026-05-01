/**
 * Shared GA4 Data API helpers for fetch-report and admin site analytics.
 */

function formatDuration(secondsStr) {
  const s = Number(secondsStr) || 0;
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

async function runRealtime(client, propertyId) {
  try {
    const [response] = await client.runRealtimeReport({
      property: `properties/${propertyId}`,
      dimensions: [{ name: "minutesAgo" }],
      metrics: [{ name: "activeUsers" }],
      minuteRanges: [
        { name: "0-29 minutes ago", startMinutesAgo: 29, endMinutesAgo: 0 },
      ],
    });

    const rows = response.rows || [];
    const minutes = Array.from({ length: 30 }, (_, i) => ({
      minutesAgo: i,
      activeUsers: 0,
    }));

    rows.forEach((row) => {
      const min = Number(row.dimensionValues[0].value);
      const users = Number(row.metricValues[0].value);
      if (minutes[min]) minutes[min].activeUsers = users;
    });

    const totalActive = minutes.reduce(
      (acc, curr) => acc + curr.activeUsers,
      0
    );

    return {
      totalActiveUsers: totalActive,
      minuteTrend: minutes.reverse(),
    };
  } catch (e) {
    console.warn("Realtime fetch failed (might not be enabled):", e);
    return { totalActiveUsers: 0, minuteTrend: [] };
  }
}

async function runRealtimeTech(client, propertyId) {
  try {
    const [response] = await client.runRealtimeReport({
      property: `properties/${propertyId}`,
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "activeUsers" }],
    });

    const rows = response.rows || [];
    return rows.map((row) => ({
      device: row.dimensionValues[0].value,
      activeUsers: Number(row.metricValues[0].value),
    }));
  } catch (e) {
    return [];
  }
}

async function runSummary(client, propertyId, startDate) {
  const request = {
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: startDate, endDate: "today" }],
    metrics: [
      { name: "screenPageViews" },
      { name: "sessions" },
      { name: "bounceRate" },
      { name: "averageSessionDuration" },
      { name: "newUsers" },
      { name: "engagementRate" },
      { name: "totalUsers" },
      { name: "eventCount" },
      { name: "userEngagementDuration" },
      { name: "scrolledUsers" },
    ],
  };

  const [response] = await client.runReport(request);
  const metricValues =
    response.rows && response.rows[0] ? response.rows[0].metricValues : [];

  const totalPageViews = Number(metricValues[0]?.value || 0);
  const totalSessions = Number(metricValues[1]?.value || 0);
  const totalUsers = Number(metricValues[6]?.value || 0);
  const totalEvents = Number(metricValues[7]?.value || 0);
  const totalEngagementTime = Number(metricValues[8]?.value || 0);
  const scrolledUsers = Number(metricValues[9]?.value || 0);

  const sessionsPerUser =
    totalUsers > 0 ? (totalSessions / totalUsers).toFixed(2) : "0.00";

  const eventsPerSession =
    totalSessions > 0 ? (totalEvents / totalSessions).toFixed(1) : "0.0";

  const viewsPerSession =
    totalSessions > 0 ? (totalPageViews / totalSessions).toFixed(1) : "0.0";

  const scrollRate =
    totalUsers > 0 ? ((scrolledUsers / totalUsers) * 100).toFixed(0) : "0";

  const avgEngagementTime =
    totalUsers > 0 ? formatDuration(totalEngagementTime / totalUsers) : "0:00";

  return {
    totalPageViews,
    totalSessions,
    bounceRate: parseFloat(metricValues[2]?.value || "0").toFixed(1),
    avgSessionDuration: formatDuration(metricValues[3]?.value || 0),
    newUsers: Number(metricValues[4]?.value || 0),
    engagementRate: parseFloat(metricValues[5]?.value || "0").toFixed(1),
    sessionsPerUser,
    eventsPerSession,
    avgEngagementTime,
    viewsPerSession,
    scrolledUsers,
    scrollRate,
  };
}

async function runTopPages(client, propertyId, startDate, limit = 6) {
  const [resp] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: startDate, endDate: "today" }],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit,
  });

  const rows = resp.rows || [];
  return rows.map((r) => ({
    path: r.dimensionValues?.[0]?.value || "-",
    views: Number(r.metricValues?.[0]?.value || 0),
  }));
}

async function runDeviceBreakdown(client, propertyId, startDate) {
  const [resp] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: startDate, endDate: "today" }],
    dimensions: [{ name: "deviceCategory" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 10,
  });
  const rows = resp.rows || [];
  return rows.map((r) => ({
    device: r.dimensionValues?.[0]?.value || "unknown",
    sessions: Number(r.metricValues?.[0]?.value || 0),
  }));
}

async function runTopReferrers(client, propertyId, startDate, limit = 6) {
  const [resp] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: startDate, endDate: "today" }],
    dimensions: [{ name: "sessionSourceMedium" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit,
  });
  const rows = resp.rows || [];
  return rows.map((r) => ({
    source: r.dimensionValues?.[0]?.value || "(direct / none)",
    sessions: Number(r.metricValues?.[0]?.value || 0),
  }));
}

async function runGeoBreakdown(client, propertyId, startDate) {
  const [resp] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: startDate, endDate: "today" }],
    dimensions: [{ name: "country" }],
    metrics: [{ name: "activeUsers" }],
    orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    limit: 6,
  });
  const rows = resp.rows || [];
  return rows.map((r) => ({
    country: r.dimensionValues?.[0]?.value || "Unknown",
    activeUsers: Number(r.metricValues?.[0]?.value || 0),
  }));
}

async function runCityBreakdown(client, propertyId, startDate) {
  const [resp] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: startDate, endDate: "today" }],
    dimensions: [{ name: "city" }, { name: "region" }],
    metrics: [{ name: "activeUsers" }],
    orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    limit: 6,
  });
  const rows = resp.rows || [];
  return rows.map((r) => ({
    city: r.dimensionValues?.[0]?.value || "Unknown",
    region: r.dimensionValues?.[1]?.value || "",
    activeUsers: Number(r.metricValues?.[0]?.value || 0),
  }));
}

async function runOSBreakdown(client, propertyId, startDate) {
  const [resp] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: startDate, endDate: "today" }],
    dimensions: [{ name: "operatingSystem" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 5,
  });
  const rows = resp.rows || [];
  return rows.map((r) => ({
    os: r.dimensionValues?.[0]?.value || "Unknown",
    sessions: Number(r.metricValues?.[0]?.value || 0),
  }));
}

async function runBrowserBreakdown(client, propertyId, startDate) {
  const [resp] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: startDate, endDate: "today" }],
    dimensions: [{ name: "browser" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 5,
  });
  const rows = resp.rows || [];
  return rows.map((r) => ({
    browser: r.dimensionValues?.[0]?.value || "Unknown",
    sessions: Number(r.metricValues?.[0]?.value || 0),
  }));
}

async function runRetention(client, propertyId, startDate) {
  const [resp] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: startDate, endDate: "today" }],
    dimensions: [{ name: "newVsReturning" }],
    metrics: [{ name: "activeUsers" }],
  });
  const rows = resp.rows || [];
  return rows.map((r) => ({
    type: r.dimensionValues?.[0]?.value || "unknown",
    count: Number(r.metricValues?.[0]?.value || 0),
  }));
}

async function runWeeklyTrend(client, propertyId, startDate) {
  const [resp] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: startDate, endDate: "today" }],
    dimensions: [{ name: "dayOfWeek" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ dimension: { dimensionName: "dayOfWeek" }, desc: false }],
  });
  const rows = resp.rows || [];
  const days = Array(7).fill(0);
  rows.forEach((r) => {
    const d = Number(r.dimensionValues[0].value);
    if (d >= 0 && d <= 6) days[d] = Number(r.metricValues[0].value);
  });

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days.map((val, i) => ({ day: dayNames[i], sessions: val }));
}

async function runDailyCounts(client, propertyId, startDate) {
  const [resp] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: startDate, endDate: "today" }],
    dimensions: [{ name: "date" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
    limit: 100,
  });

  const rows = resp.rows || [];
  return rows.map((r) => ({
    date: r.dimensionValues?.[0]?.value,
    count: Number(r.metricValues?.[0]?.value || 0),
  }));
}

function mapDeviceBreakdown(devices) {
  return devices.map((d) => {
    const dev = d.device.toLowerCase();
    let icon = "Monitor";
    let color = "blue";
    if (dev.includes("mobile") || dev.includes("phone")) {
      icon = "Smartphone";
      color = "purple";
    } else if (dev.includes("tablet")) {
      icon = "Tablet";
      color = "orange";
    }
    return { device: d.device, sessions: d.sessions, icon, color };
  });
}

/**
 * Parse GA service account JSON from env (same precedence as fetch-report).
 * @returns {{ sa: object|null, error: string|null }}
 */
function parseGaServiceAccountFromEnv() {
  const hasBase64 = !!process.env.GA_SA_KEY_BASE64;
  const hasRaw = !!process.env.GA_SA_KEY;
  const hasFirebaseSA = !!process.env.FIREBASE_SERVICE_ACCOUNT;

  let sa = null;

  if (hasBase64) {
    try {
      const decoded = Buffer.from(
        process.env.GA_SA_KEY_BASE64,
        "base64"
      ).toString("utf8");
      sa = JSON.parse(decoded);
    } catch (e) {
      console.error("Failed to parse GA_SA_KEY_BASE64:", e);
      return { sa: null, error: "Failed to parse GA_SA_KEY_BASE64" };
    }
  }

  if (!sa && (hasRaw || hasFirebaseSA)) {
    const raw = process.env.GA_SA_KEY || process.env.FIREBASE_SERVICE_ACCOUNT;
    if (typeof raw === "object") {
      sa = raw;
    } else if (typeof raw === "string") {
      try {
        sa = JSON.parse(raw);
      } catch (e1) {
        try {
          const replaced = raw.replace(/\\n/g, "\n");
          sa = JSON.parse(replaced);
        } catch (e2) {
          try {
            const decoded = Buffer.from(raw, "base64").toString("utf8");
            sa = JSON.parse(decoded);
          } catch (e3) {
            console.error(
              "Failed to parse service account from GA_SA_KEY/FIREBASE_SERVICE_ACCOUNT:",
              e1,
              e2,
              e3
            );
            return {
              sa: null,
              error: "Failed to parse GA service account from env",
            };
          }
        }
      }
    }
  }

  if (!sa) {
    return { sa: null, error: "GA service account not configured on server" };
  }

  return { sa, error: null };
}

function rangeToStartDate(range) {
  if (range === "28d") return "28daysAgo";
  if (range === "90d") return "90daysAgo";
  return "7daysAgo";
}

/**
 * @returns {Promise<{ analyticsDoc: object, dailyCounts: Array }>}
 */
async function fetchGaAnalyticsBundle(
  client,
  propertyId,
  startDate,
  range,
  options = {}
) {
  const topPagesLimit = options.topPagesLimit ?? 10;
  const referrersLimit = options.referrersLimit ?? 8;

  const [
    summary,
    topPages,
    devices,
    referrers,
    dailyCounts,
    realtime,
    realtimeTech,
    geoBreakdown,
    cityBreakdown,
    osBreakdown,
    browserBreakdown,
    retention,
    weeklyTrend,
  ] = await Promise.all([
    runSummary(client, propertyId, startDate),
    runTopPages(client, propertyId, startDate, topPagesLimit),
    runDeviceBreakdown(client, propertyId, startDate),
    runTopReferrers(client, propertyId, startDate, referrersLimit),
    runDailyCounts(client, propertyId, startDate),
    runRealtime(client, propertyId),
    runRealtimeTech(client, propertyId),
    runGeoBreakdown(client, propertyId, startDate),
    runCityBreakdown(client, propertyId, startDate),
    runOSBreakdown(client, propertyId, startDate),
    runBrowserBreakdown(client, propertyId, startDate),
    runRetention(client, propertyId, startDate),
    runWeeklyTrend(client, propertyId, startDate),
  ]);

  const deviceBreakdown = mapDeviceBreakdown(devices);

  const analyticsDoc = {
    ...summary,
    topPages: topPages.map((p) => ({
      path: p.path,
      views: p.views,
      progress: Math.min(
        100,
        Math.round((p.views / (summary.totalPageViews || 1)) * 100)
      ),
    })),
    deviceBreakdown,
    topReferrers: referrers,
    geoBreakdown,
    cityBreakdown,
    osBreakdown,
    browserBreakdown,
    retention,
    weeklyTrend,
    realtime: { ...realtime, tech: realtimeTech },
    lastUpdated: new Date(),
    dateRange: range,
  };

  return { analyticsDoc, dailyCounts };
}

async function fetchGaTopEvents(client, propertyId, startDate, limit = 25) {
  try {
    const [resp] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: startDate, endDate: "today" }],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit,
    });
    const rows = resp.rows || [];
    return rows.map((r) => ({
      eventName: r.dimensionValues?.[0]?.value || "(not set)",
      count: Number(r.metricValues?.[0]?.value || 0),
    }));
  } catch (e) {
    console.warn("fetchGaTopEvents failed:", e);
    return [];
  }
}

/** Landing-page style paths often tied to lead intent */
async function fetchGaLandingPages(client, propertyId, startDate, limit = 10) {
  try {
    const [resp] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: startDate, endDate: "today" }],
      dimensions: [{ name: "landingPagePlusQueryString" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit,
    });
    const rows = resp.rows || [];
    return rows.map((r) => ({
      landingPage: r.dimensionValues?.[0]?.value || "—",
      sessions: Number(r.metricValues?.[0]?.value || 0),
    }));
  } catch (e) {
    console.warn("fetchGaLandingPages failed:", e);
    return [];
  }
}

module.exports = {
  formatDuration,
  parseGaServiceAccountFromEnv,
  rangeToStartDate,
  fetchGaAnalyticsBundle,
  fetchGaTopEvents,
  fetchGaLandingPages,
};
