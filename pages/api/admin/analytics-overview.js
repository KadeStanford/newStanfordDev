const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const { db } = require("../../../lib/firebaseAdmin");
const {
  verifyAdminFromRequest,
  verifyAdminToken,
} = require("../../../lib/verifyAdminRequest");
const { getStats } = require("../../../lib/analyticsStore");
const {
  parseGaServiceAccountFromEnv,
  rangeToStartDate,
  fetchGaAnalyticsBundle,
  fetchGaTopEvents,
  fetchGaLandingPages,
} = require("../../../lib/ga4ReportsCore");

function ts(val) {
  if (!val) return 0;
  if (typeof val.toMillis === "function") return val.toMillis();
  if (typeof val.toDate === "function") return val.toDate().getTime();
  const d = new Date(val);
  return isNaN(d) ? 0 : d.getTime();
}

/** Normalize POST body (some hosts deliver JSON as a string). */
function getPostJson(req) {
  if (req.method !== "POST") return {};
  const raw = req.body;
  if (raw == null) return {};
  if (typeof raw === "object" && !Buffer.isBuffer(raw)) return raw;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return {};
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "512kb",
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const post = getPostJson(req);
  const range =
    req.method === "POST"
      ? post.range || "7d"
      : req.query?.range || "7d";

  const idTokenFromBody =
    req.method === "POST" && post.idToken
      ? String(post.idToken)
      : null;

  try {
    if (idTokenFromBody) {
      await verifyAdminToken(idTokenFromBody);
    } else {
      await verifyAdminFromRequest(req);
    }
  } catch (e) {
    return res.status(e.status || 401).json({
      error: e.message || "Unauthorized",
      code: e.code || "AUTH_ERROR",
    });
  }

  const startDate = rangeToStartDate(range);
  const rawProperty =
    process.env.SITE_GA4_PROPERTY_ID ||
    process.env.NEXT_PUBLIC_SITE_GA4_PROPERTY_ID ||
    "";
  const propertyId =
    (req.query.propertyId &&
      String(req.query.propertyId).replace(/\D/g, "")) ||
    String(rawProperty).replace(/\D/g, "") ||
    null;

  let ga = null;
  let gaError = null;
  let topEvents = [];
  let landingPages = [];

  if (propertyId) {
    const { sa, error: parseErr } = parseGaServiceAccountFromEnv();
    if (parseErr || !sa) {
      gaError = parseErr || "GA service account not configured";
    } else {
      if (sa.private_key) sa.private_key = sa.private_key.replace(/\\n/g, "\n");
      try {
        const client = new BetaAnalyticsDataClient({ credentials: sa });
        const { analyticsDoc, dailyCounts } = await fetchGaAnalyticsBundle(
          client,
          propertyId,
          startDate,
          range,
          { topPagesLimit: 12, referrersLimit: 10 }
        );
        ga = { ...analyticsDoc, dailyCounts };
        topEvents = await fetchGaTopEvents(client, propertyId, startDate, 30);
        landingPages = await fetchGaLandingPages(
          client,
          propertyId,
          startDate,
          12
        );
      } catch (err) {
        console.error("admin analytics-overview GA error:", err);
        gaError = err.message || String(err);
      }
    }
  } else {
    gaError =
      "GA4 property ID is not set. Add SITE_GA4_PROPERTY_ID (or NEXT_PUBLIC_SITE_GA4_PROPERTY_ID) with your numeric Property ID from GA → Admin → Property settings, then redeploy.";
  }

  const live = getStats();

  let internal = {
    usersTotal: 0,
    clients: 0,
    admins: 0,
    projectsTotal: 0,
    projectsByStatus: {},
    testimonialsTotal: 0,
    testimonialsPending: 0,
    testimonialsApproved: 0,
    recentSignups: [],
    error: null,
  };

  try {
    const [usersSnap, projectsSnap, testimonialsSnap] = await Promise.all([
      db.collection("users").get(),
      db.collection("projects").get(),
      db.collection("testimonials").get(),
    ]);

    internal.usersTotal = usersSnap.size;
    const usersList = usersSnap.docs.map((d) => ({
      id: d.id,
      ...(d.data() || {}),
    }));
    internal.clients = usersList.filter((u) => u.role !== "admin").length;
    internal.admins = usersList.filter((u) => u.role === "admin").length;

    internal.recentSignups = usersList
      .filter((u) => u.role !== "admin")
      .sort((a, b) => ts(b.createdAt) - ts(a.createdAt))
      .slice(0, 10)
      .map((u) => ({
        id: u.id,
        email: u.email || "—",
        createdAt: u.createdAt?.toDate
          ? u.createdAt.toDate().toISOString()
          : u.createdAt || null,
      }));

    internal.projectsTotal = projectsSnap.size;
    const statusCount = {};
    projectsSnap.docs.forEach((d) => {
      const s = (d.data()?.status || "Unknown").trim();
      statusCount[s] = (statusCount[s] || 0) + 1;
    });
    internal.projectsByStatus = statusCount;

    internal.testimonialsTotal = testimonialsSnap.size;
    testimonialsSnap.docs.forEach((d) => {
      const data = d.data() || {};
      if (data.approved === true) internal.testimonialsApproved += 1;
      else internal.testimonialsPending += 1;
    });
  } catch (err) {
    console.error("admin analytics-overview Firestore:", err);
    internal.error = err.message || String(err);
  }

  return res.status(200).json({
    ok: true,
    range,
    gaPropertyId: propertyId,
    ga,
    gaError,
    topEvents,
    landingPages,
    internal,
    live,
    fetchedAt: new Date().toISOString(),
  });
}
