// Server-side API route to fetch GA4 data using a service account and
// write an aggregated document into Firestore at `analytics/{projectId}`.

const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const { db, admin } = require("../../../lib/firebaseAdmin");

// Helper to format seconds to mm:ss
function formatDuration(secondsStr) {
  const s = Number(secondsStr) || 0;
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

// --- NEW: Realtime Report (Last 30 Min Trend) ---
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

// --- NEW: Realtime Tech (To see instant device types) ---
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
      { name: "userEngagementDuration" }, // Total engagement time
      { name: "scrolledUsers" }, // NEW: Users who scrolled
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

  // New Metric: Page Views Per Session
  const viewsPerSession =
    totalSessions > 0 ? (totalPageViews / totalSessions).toFixed(1) : "0.0";

  // New Metric: Scroll Rate (Percentage of users who scrolled)
  const scrollRate =
    totalUsers > 0 ? ((scrolledUsers / totalUsers) * 100).toFixed(0) : "0";

  // Average Engagement Time per Active User (common GA4 metric)
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
    viewsPerSession, // Added
    scrolledUsers, // Added
    scrollRate, // Added
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

// --- Geographic Breakdown ---
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

// --- City Breakdown ---
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

// --- Operating System Breakdown ---
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

// --- Browser Breakdown ---
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

// --- NEW: New vs Returning Users (Retention) ---
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

// --- NEW: Day of Week Trends ---
async function runWeeklyTrend(client, propertyId, startDate) {
  // Note: GA4 Day of week: 0 (Sunday) to 6 (Saturday)
  const [resp] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: startDate, endDate: "today" }],
    dimensions: [{ name: "dayOfWeek" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ dimension: { dimensionName: "dayOfWeek" }, desc: false }],
  });
  const rows = resp.rows || [];
  // Ensure we have all days 0-6
  const days = Array(7).fill(0);
  rows.forEach((r) => {
    const d = Number(r.dimensionValues[0].value);
    if (d >= 0 && d <= 6) days[d] = Number(r.metricValues[0].value);
  });

  // Convert to array of objects for chart
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days.map((val, i) => ({ day: dayNames[i], sessions: val }));
}

async function runDailyCounts(client, propertyId, startDate) {
  const [resp] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: startDate, endDate: "today" }],
    dimensions: [{ name: "date" }],
    // CHANGE THIS LINE from "eventCount" to "sessions"
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

export default async function handler(req, res) {
  const projectId =
    req.method === "POST" ? req.body?.projectId : req.query?.projectId;
  const range = req.query?.range || "7d";

  if (!projectId) return res.status(400).json({ error: "Missing projectId" });

  let startDate = "7daysAgo";
  if (range === "28d") startDate = "28daysAgo";
  if (range === "90d") startDate = "90daysAgo";

  const secret = req.headers["x-api-key"] || req.query?.apiKey;
  let authorized = false;
  if (process.env.GA_API_SECRET && secret === process.env.GA_API_SECRET) {
    authorized = true;
  }

  if (!authorized) {
    const authHeader = req.headers["authorization"] || "";
    if (authHeader.toLowerCase().startsWith("bearer ")) {
      const idToken = authHeader.split(" ")[1];
      try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        const projSnap = await db.doc(`projects/${projectId}`).get();
        if (projSnap.exists && projSnap.data().clientId === decoded.uid) {
          authorized = true;
        }
      } catch (e) {
        console.warn("ID token verification failed:", e);
      }
    }
  }

  if (!authorized) {
    return res
      .status(401)
      .json({ error: "Unauthorized - missing or invalid api key or id token" });
  }

  const projectRef = db.collection("projects").doc(projectId);
  const projectSnap = await projectRef.get();

  if (!projectSnap.exists) {
    return res.status(404).json({ error: "Project not found" });
  }

  const projectData = projectSnap.data();
  const GA_PROPERTY_ID = projectData.gaPropertyId;

  if (!GA_PROPERTY_ID) {
    return res.status(400).json({
      error:
        "Analytics Configuration Missing: This project does not have a GA4 Property ID set in the admin panel.",
    });
  }

  const GA_SA_KEY = process.env.GA_SA_KEY;

  if (!GA_SA_KEY) {
    return res
      .status(500)
      .json({ error: "GA_SA_KEY not configured on server" });
  }

  let sa;
  try {
    sa = JSON.parse(GA_SA_KEY);
    if (sa.private_key) {
      sa.private_key = sa.private_key.replace(/\\n/g, "\n");
    }
  } catch (e) {
    console.error("Failed to parse GA_SA_KEY:", e);
    return res.status(500).json({ error: "Failed to parse GA_SA_KEY" });
  }

  const client = new BetaAnalyticsDataClient({ credentials: sa });

  try {
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
      retention, // NEW
      weeklyTrend, // NEW
    ] = await Promise.all([
      runSummary(client, GA_PROPERTY_ID, startDate),
      runTopPages(client, GA_PROPERTY_ID, startDate, 6),
      runDeviceBreakdown(client, GA_PROPERTY_ID, startDate),
      runTopReferrers(client, GA_PROPERTY_ID, startDate, 6),
      runDailyCounts(client, GA_PROPERTY_ID, startDate),
      runRealtime(client, GA_PROPERTY_ID),
      runRealtimeTech(client, GA_PROPERTY_ID),
      runGeoBreakdown(client, GA_PROPERTY_ID, startDate),
      runCityBreakdown(client, GA_PROPERTY_ID, startDate),
      runOSBreakdown(client, GA_PROPERTY_ID, startDate),
      runBrowserBreakdown(client, GA_PROPERTY_ID, startDate),
      runRetention(client, GA_PROPERTY_ID, startDate),
      runWeeklyTrend(client, GA_PROPERTY_ID, startDate),
    ]);

    const deviceBreakdown = devices.map((d) => {
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

    const analyticsDoc = {
      ...summary,
      topPages: topPages.map((p, i) => ({
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
      retention, // added
      weeklyTrend, // added
      realtime: { ...realtime, tech: realtimeTech },
      lastUpdated: new Date(),
      dateRange: range,
    };

    if (range === "7d") {
      await db.doc(`analytics/${projectId}`).set(analyticsDoc, { merge: true });
      await db
        .doc(`analytics/${projectId}/stats/events_summary`)
        .set({ counts: dailyCounts, updatedAt: new Date() }, { merge: true });
    }

    return res.status(200).json({
      ok: true,
      analyticsDoc: { ...analyticsDoc, dailyCounts },
    });
  } catch (err) {
    console.error("GA fetch error:", err);
    return res
      .status(500)
      .json({ error: "Failed to fetch GA data", details: String(err) });
  }
}
