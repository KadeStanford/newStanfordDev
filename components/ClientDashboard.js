import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { signOut, updateProfile } from "firebase/auth";
import {
  collection,
  query,
  where,
  addDoc,
  serverTimestamp,
  onSnapshot,
  doc as firestoreDoc,
  getDoc,
  setDoc,
  orderBy,
  limit as firestoreLimit,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import StarBackground from "../components/StarBackground";
import Link from "next/link";
import { Home as HomeIcon } from "lucide-react";
import {
  BarChart3,
  FileText,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Download,
  LayoutDashboard,
  CreditCard,
  Settings,
  Plus,
  ChevronRight,
  Menu,
  Calendar,
  X,
  User,
  Phone,
  MapPin,
  Save,
  RotateCcw,
  ExternalLink,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  ChevronDown,
  Clock4,
  Activity,
  Info,
  Users,
  Zap,
  Map,
  MapPin as MapPinIcon,
  Laptop,
  Command,
  Chrome,
  Compass,
  ArrowRightCircle,
  Timer,
  Search,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Link as LinkIcon,
  PieChart,
  MousePointer2,
  ArrowUpCircle,
} from "lucide-react";
import TestimonialForm from "../components/TestimonialForm";
import { generateInvoicePdf } from "../lib/generateInvoicePdf";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import { toast } from "sonner";
import createGlobe from "cobe";

// --- HELPERS ---

const CITY_COORDINATES = {
  "New York": [40.7128, -74.006],
  London: [51.5074, -0.1278],
  "Los Angeles": [34.0522, -118.2437],
  Toronto: [43.651, -79.347],
  Paris: [48.8566, 2.3522],
  Tokyo: [35.6762, 139.6503],
  Sydney: [-33.8688, 151.2093],
  Mumbai: [19.076, 72.8777],
  "United States": [39.8283, -98.5795], // US Center
  "United Kingdom": [55.3781, -3.436],
};

// 2. US State Centers (Fallback for when City is unknown)
const US_STATE_COORDINATES = {
  Alabama: [32.8067, -86.7911],
  Alaska: [61.3707, -152.4044],
  Arizona: [33.7298, -111.4312],
  Arkansas: [34.9697, -92.3731],
  California: [36.1162, -119.6816],
  Colorado: [39.0598, -105.3111],
  Connecticut: [41.5978, -72.7554],
  Delaware: [39.3185, -75.5071],
  Florida: [27.7663, -81.6868],
  Georgia: [33.0406, -83.6431],
  Hawaii: [21.0943, -157.4983],
  Idaho: [44.2405, -114.4788],
  Illinois: [40.3495, -88.9861],
  Indiana: [39.8494, -86.2583],
  Iowa: [42.0115, -93.2105],
  Kansas: [38.5266, -96.7265],
  Kentucky: [37.6681, -84.6701],
  Louisiana: [31.1695, -91.8678],
  Maine: [44.6939, -69.3819],
  Maryland: [39.0639, -76.8021],
  Massachusetts: [42.2302, -71.5301],
  Michigan: [43.3266, -84.5361],
  Minnesota: [45.6945, -93.9002],
  Mississippi: [32.7416, -89.6787],
  Missouri: [38.4561, -92.2884],
  Montana: [46.9219, -110.4544],
  Nebraska: [41.1254, -98.2681],
  Nevada: [38.3135, -117.0554],
  "New Hampshire": [43.4525, -71.5639],
  "New Jersey": [40.2989, -74.521],
  "New Mexico": [34.8405, -106.2485],
  "New York": [42.1657, -74.9481],
  "North Carolina": [35.6301, -79.8064],
  "North Dakota": [47.5289, -99.784],
  Ohio: [40.3888, -82.7649],
  Oklahoma: [35.5653, -96.9289],
  Oregon: [44.572, -122.0709],
  Pennsylvania: [40.5908, -77.2098],
  "Rhode Island": [41.6809, -71.5118],
  "South Carolina": [33.8569, -80.945],
  "South Dakota": [44.2998, -99.4388],
  Tennessee: [35.7478, -86.6923],
  Texas: [31.0545, -97.5635],
  Utah: [40.15, -111.8624],
  Vermont: [44.0459, -72.7107],
  Virginia: [37.7693, -78.1699],
  Washington: [47.4009, -121.4905],
  "West Virginia": [38.4912, -80.9545],
  Wisconsin: [44.2685, -89.6165],
  Wyoming: [42.756, -107.3025],
};

const getLatLong = (city, region, country) => {
  // 1. Exact City Match
  if (city && CITY_COORDINATES[city]) return CITY_COORDINATES[city];

  // 2. US State Match (Region)
  if (region && US_STATE_COORDINATES[region])
    return US_STATE_COORDINATES[region];

  // 3. Country Match
  if (country && CITY_COORDINATES[country]) return CITY_COORDINATES[country];

  // 4. Default to US Center if nothing else matches (since you said mainly US)
  return [39.8283, -98.5795];
};

const US_STATE_ABBREVIATIONS = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
};

const getStateAbbr = (region) => {
  return US_STATE_ABBREVIATIONS[region] || region;
};

const getCountryFlag = (countryName) => {
  const map = {
    "United States": "🇺🇸",
    "United Kingdom": "🇬🇧",
    Canada: "🇨🇦",
    Australia: "🇦🇺",
    Germany: "🇩🇪",
    France: "🇫🇷",
    India: "🇮🇳",
    China: "🇨🇳",
    Japan: "🇯🇵",
    Brazil: "🇧🇷",
    Mexico: "🇲🇽",
    Russia: "🇷🇺",
    "South Korea": "🇰🇷",
    Italy: "🇮🇹",
    Spain: "🇪🇸",
    Netherlands: "🇳🇱",
    Sweden: "🇸🇪",
    Switzerland: "🇨🇭",
    Poland: "🇵🇱",
    Belgium: "🇧🇪",
  };
  return map[countryName] || "🌍";
};

const getOSIcon = (osName) => {
  const lower = osName.toLowerCase();
  if (lower.includes("mac") || lower.includes("ios"))
    return <Command size={18} />;
  if (lower.includes("windows")) return <Monitor size={18} />;
  if (lower.includes("android")) return <Smartphone size={18} />;
  if (lower.includes("linux")) return <Laptop size={18} />;
  return <Monitor size={18} />;
};

const getBrowserIcon = (browserName) => {
  const lower = browserName.toLowerCase();
  if (lower.includes("chrome")) return <Chrome size={18} />;
  if (lower.includes("safari")) return <Compass size={18} />;
  if (lower.includes("firefox"))
    return <div className="w-4 h-4 rounded-full bg-orange-500" />;
  if (lower.includes("edge"))
    return <div className="w-4 h-4 rounded-full bg-blue-500" />;
  return <Globe size={18} />;
};

// --- Smart Source Formatter ---
const formatTrafficSource = (sourceMedium) => {
  if (!sourceMedium || sourceMedium === "(not set)")
    return { name: "Unknown / Other", icon: LinkIcon, color: "slate" };

  const lower = sourceMedium.toLowerCase();

  // Direct
  if (lower.includes("(direct)") || lower.includes("(none)")) {
    return { name: "Direct Traffic", icon: ArrowRightCircle, color: "blue" };
  }

  // Search Engines
  if (lower.includes("google"))
    return { name: "Google Search", icon: Search, color: "green" };
  if (lower.includes("bing"))
    return { name: "Bing Search", icon: Search, color: "teal" };
  if (lower.includes("yahoo"))
    return { name: "Yahoo Search", icon: Search, color: "purple" };
  if (lower.includes("duckduckgo"))
    return { name: "DuckDuckGo", icon: Search, color: "orange" };

  // Social Media
  if (lower.includes("facebook") || lower.includes("fb"))
    return { name: "Facebook", icon: Facebook, color: "blue" };
  if (lower.includes("instagram") || lower.includes("ig"))
    return { name: "Instagram", icon: Instagram, color: "pink" };
  if (
    lower.includes("twitter") ||
    lower.includes("t.co") ||
    lower.includes("x.com")
  )
    return { name: "Twitter / X", icon: Twitter, color: "sky" };
  if (lower.includes("linkedin"))
    return { name: "LinkedIn", icon: Linkedin, color: "blue" };
  if (lower.includes("youtube"))
    return { name: "YouTube", icon: Monitor, color: "red" };
  if (lower.includes("pinterest"))
    return { name: "Pinterest", icon: Globe, color: "red" };
  if (lower.includes("tiktok"))
    return { name: "TikTok", icon: Smartphone, color: "pink" };

  // Referrals
  if (lower.includes("referral")) {
    const domain = sourceMedium.split(" / ")[0];
    return { name: domain, icon: LinkIcon, color: "slate" };
  }

  return { name: sourceMedium, icon: Globe, color: "slate" };
};

const InfoTooltip = ({ text }) => (
  <div className="group relative ml-2 inline-flex">
    <Info
      size={14}
      className="text-slate-500 hover:text-blue-400 cursor-help transition-colors"
    />
    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-56 p-3 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl text-center leading-relaxed">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
    </div>
  </div>
);

const AnalyticsSparkline = ({
  data = [],
  width = "100%",
  height = 48,
  color = "#7c3aed",
}) => {
  if (!data || data.length === 0) return null;
  const counts = data.map((d) =>
    typeof d === "object" ? d.count || d.activeUsers || 0 : d
  );
  const max = Math.max(...counts, 1);
  const len = counts.length;
  const viewW = 200;
  const viewH = 50;
  const step = len > 1 ? viewW / (len - 1) : viewW;

  const points = counts
    .map((val, i) => {
      const x = i * step;
      const y = viewH - (val / max) * (viewH - 4);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${viewW} ${viewH}`}
      preserveAspectRatio="none"
      className="overflow-visible"
    >
      <path
        d={`M0,${viewH} ${points} L${viewW},${viewH}`}
        fill={color}
        fillOpacity="0.1"
        stroke="none"
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  color = "blue",
  prefix = "",
  suffix = "",
  tooltip = "",
  delay = 0,
}) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ scale: 1.02, y: -2 }}
    className="bg-slate-900/50 border border-slate-800 rounded-2xl relative group hover:border-slate-700 transition-all"
  >
    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
      <div
        className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-${color}-500`}
      >
        <Icon size={80} />
      </div>
    </div>
    <div className="relative z-10 p-6">
      <div
        className={`w-10 h-10 rounded-lg bg-${color}-500/10 flex items-center justify-center mb-3 text-${color}-400`}
      >
        <Icon size={20} />
      </div>
      <div className="flex items-center mb-1">
        <p className="text-slate-400 text-sm font-medium">{label}</p>
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>
      <h3 className="text-2xl font-bold text-white flex items-center gap-1">
        {prefix}
        {typeof value === "number" && !isNaN(value) ? (
          <CountUp
            end={value}
            duration={2}
            separator=","
            decimals={value % 1 !== 0 ? 1 : 0}
          />
        ) : (
          <span>{value || "—"}</span>
        )}
        {suffix}
      </h3>
    </div>
  </motion.div>
);

const createDemoProject = async (userId) => {
  try {
    const newProjectRef = await addDoc(collection(db, "projects"), {
      clientId: userId,
      name: "Analytics Demo Site (GA Ready)",
      status: "Completed",
      progress: 100,
      budget: 15000,
      paid: 15000,
      nextMilestone: "Archived",
      dueDate: "Sep 01, 2025",
      completedAt: serverTimestamp(),
      analyticsEnabled: true,
      liveUrl: "analyticsexample.com",
      gaPropertyId: "DEMO_PROPERTY_ID",
      updates: [
        { title: "Project Launched!", date: "1 month ago", type: "success" },
        { title: "Final Payment Received", date: "1 month ago", type: "info" },
      ],
      documents: [],
      invoices: [],
    });

    const mockSummary = {
      totalPageViews: 850,
      totalSessions: 620,
      newUsers: 450,
      engagementRate: 65.5,
      bounceRate: "48.5",
      avgSessionDuration: "00:55",
      avgEngagementTime: "0:45",
      sessionsPerUser: "1.35",
      eventsPerSession: "4.2",
      viewsPerSession: "1.4",
      scrollRate: "45",
      topPages: [
        { path: "/", views: 380, progress: 61 },
        { path: "/pricing", views: 150, progress: 24 },
        { path: "/blog", views: 55, progress: 9 },
      ],
      deviceBreakdown: [
        { device: "Desktop", sessions: 400, color: "blue", icon: "Monitor" },
        {
          device: "Mobile",
          sessions: 180,
          color: "purple",
          icon: "Smartphone",
        },
        { device: "Tablet", sessions: 40, color: "orange", icon: "Tablet" },
      ],
      topReferrers: [
        { source: "google / organic", sessions: 250 },
        { source: "(direct) / (none)", sessions: 200 },
        { source: "twitter.com / referral", sessions: 120 },
      ],
      geoBreakdown: [
        { country: "United States", activeUsers: 320 },
        { country: "United Kingdom", activeUsers: 85 },
        { country: "Canada", activeUsers: 45 },
        { country: "Germany", activeUsers: 20 },
      ],
      cityBreakdown: [
        { city: "New York", region: "New York", activeUsers: 120 },
        { city: "London", region: "England", activeUsers: 85 },
        { city: "Los Angeles", region: "California", activeUsers: 75 },
        { city: "Toronto", region: "Ontario", activeUsers: 40 },
      ],
      osBreakdown: [
        { os: "iOS", sessions: 250 },
        { os: "Windows", sessions: 200 },
        { os: "Macintosh", sessions: 100 },
        { os: "Android", sessions: 70 },
      ],
      browserBreakdown: [
        { browser: "Chrome", sessions: 350 },
        { browser: "Safari", sessions: 200 },
        { browser: "Edge", sessions: 50 },
        { browser: "Firefox", sessions: 20 },
      ],
      retention: [
        { type: "new", count: 450 },
        { type: "returning", count: 170 },
      ],
      weeklyTrend: [
        { day: "Sun", sessions: 50 },
        { day: "Mon", sessions: 120 },
        { day: "Tue", sessions: 140 },
        { day: "Wed", sessions: 110 },
        { day: "Thu", sessions: 130 },
        { day: "Fri", sessions: 90 },
        { day: "Sat", sessions: 60 },
      ],
      realtime: {
        totalActiveUsers: 3,
        minuteTrend: Array.from({ length: 30 }, () => ({
          activeUsers: Math.floor(Math.random() * 5),
        })),
        tech: [
          { device: "desktop", activeUsers: 2 },
          { device: "mobile", activeUsers: 1 },
        ],
      },
      lastUpdated: serverTimestamp(),
    };

    const analyticsRef = firestoreDoc(db, "analytics", newProjectRef.id);
    await setDoc(analyticsRef, mockSummary);

    const eventsSummaryRef = firestoreDoc(
      db,
      `analytics/${newProjectRef.id}/stats/events_summary`
    );
    const today = new Date();
    const counts = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      counts.push({
        date: d.toISOString().split("T")[0],
        count: Math.floor(Math.random() * 50) + 10,
      });
    }
    await setDoc(eventsSummaryRef, { counts }, { merge: true });

    window.location.reload();
  } catch (error) {
    console.error("Error creating demo project:", error);
    toast.error("Failed to create demo data.");
  }
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [profileFields, setProfileFields] = useState({
    displayName: user?.displayName || "",
    phone: "",
    address: "",
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const projectData = projects.find((p) => p.id === selectedProjectId) || null;

  const [analyticsCounts, setAnalyticsCounts] = useState([]);
  const [analyticsSummary, setAnalyticsSummary] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [timeRange, setTimeRange] = useState("7d");

  const isAnalyticsReady =
    projectData?.status === "Completed" && projectData?.analyticsEnabled;

  const navItems = selectedProjectId
    ? [
        { id: "overview", label: "Project Overview", icon: LayoutDashboard },
        ...(isAnalyticsReady
          ? [{ id: "analytics", label: "Analytics", icon: BarChart3 }]
          : []),
        { id: "documents", label: "Documents", icon: FileText },
        { id: "invoices", label: "Invoices", icon: CreditCard },
      ]
    : [
        { id: "overview", label: "Project Chooser", icon: Plus },
        { id: "testimonials", label: "Testimonials", icon: CheckCircle2 },
        { id: "invoices", label: "All Invoices", icon: CreditCard },
        { id: "settings", label: "Settings", icon: Settings },
      ];

  const totalEvents = useMemo(
    () => analyticsCounts.reduce((s, it) => s + (it.count || 0), 0),
    [analyticsCounts]
  );

  useEffect(() => {
    if (
      !selectedProjectId &&
      activeTab !== "overview" &&
      activeTab !== "invoices" &&
      activeTab !== "testimonials" &&
      activeTab !== "settings" &&
      projects.length > 0
    ) {
      setActiveTab("overview");
    }
  }, [selectedProjectId, projects.length, activeTab]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setProjects([]);
      setFetching(false);
      return;
    }

    setFetching(true);
    const q = query(
      collection(db, "projects"),
      where("clientId", "==", user.uid)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setProjects(docs);
          setSelectedProjectId((prev) =>
            docs.some((d) => d.id === prev) ? prev : null
          );
        } else {
          setProjects([]);
          setSelectedProjectId(null);
        }
        setFetching(false);
      },
      (err) => {
        console.error("Project listener error:", err);
        setFetching(false);
      }
    );

    return () => unsub();
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    setProfileFields((p) => ({ ...p, displayName: user.displayName || "" }));
    const load = async () => {
      try {
        const ref = firestoreDoc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setProfileFields((p) => ({
            ...p,
            phone: data.phone || "",
            address: data.address || "",
          }));
        }
      } catch (e) {
        console.warn("Failed to load user profile doc:", e);
      }
    };
    load();
  }, [user]);

  const saveSettings = async () => {
    if (!user) return toast.error("Not signed in");
    setSavingSettings(true);
    try {
      if (
        auth.currentUser &&
        profileFields.displayName !== auth.currentUser.displayName
      ) {
        await updateProfile(auth.currentUser, {
          displayName: profileFields.displayName || null,
        });
      }

      const uRef = firestoreDoc(db, "users", user.uid);
      await setDoc(
        uRef,
        {
          displayName: profileFields.displayName || null,
          phone: profileFields.phone || null,
          address: profileFields.address || null,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      toast.success("Settings saved");
    } catch (e) {
      console.error("Failed to save settings:", e);
      toast.error("Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const formatDateForDisplay = (val) => {
    if (!val) return "—";
    try {
      if (val?.toDate) return val.toDate().toLocaleDateString();
      const dt = new Date(val);
      if (isNaN(dt)) return String(val);
      return dt.toLocaleDateString();
    } catch (e) {
      return String(val);
    }
  };

  const ensureAbsoluteUrl = (url) => {
    if (!url) return null;
    let trimmed = String(url).trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("https://https:")) {
      trimmed = trimmed.replace("https://https:", "https:");
    } else if (trimmed.startsWith("http://http:")) {
      trimmed = trimmed.replace("http://http:", "http:");
    }
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const fetchAnalytics = useCallback(
    async (forceRefresh = false) => {
      if (!selectedProjectId) return;
      setLoadingAnalytics(true);

      try {
        const idToken = auth?.currentUser?.getIdToken
          ? await auth.currentUser.getIdToken(true)
          : null;
        const headers = idToken ? { Authorization: `Bearer ${idToken}` } : {};

        const res = await fetch(
          `/api/ga/fetch-report?projectId=${selectedProjectId}&range=${timeRange}`,
          { method: "GET", headers }
        );

        const body = await res.json();

        if (!res.ok) {
          toast.error(body.error || "Failed to load analytics");
        } else {
          if (forceRefresh) toast.success("Analytics Refreshed");
          if (body.analyticsDoc) {
            setAnalyticsSummary(body.analyticsDoc);
            if (body.analyticsDoc.dailyCounts) {
              setAnalyticsCounts(body.analyticsDoc.dailyCounts);
            }
          }
        }
      } catch (e) {
        console.error(e);
        toast.error("Network error fetching analytics");
      } finally {
        setLoadingAnalytics(false);
      }
    },
    [selectedProjectId, timeRange]
  );

  useEffect(() => {
    let mounted = true;
    const loadInitial = async () => {
      setAnalyticsSummary(null);
      setAnalyticsCounts([]);

      if (!projectData?.id || !projectData?.analyticsEnabled) {
        return;
      }

      setLoadingAnalytics(true);
      const projectAnalyticsRef = firestoreDoc(db, "analytics", projectData.id);

      try {
        const summarySnap = await getDoc(projectAnalyticsRef);
        if (summarySnap.exists() && mounted) {
          setAnalyticsSummary(summarySnap.data());
        }

        const statsRef = firestoreDoc(
          db,
          `analytics/${projectData.id}/stats/events_summary`
        );
        const statsSnap = await getDoc(statsRef);

        if (statsSnap.exists()) {
          const data = statsSnap.data();
          if (data.counts && mounted) {
            setAnalyticsCounts(data.counts);
          }
        }
      } catch (e) {
        console.warn("Failed to load analytics cache:", e);
      } finally {
        if (mounted) setLoadingAnalytics(false);
      }
    };

    if (activeTab === "analytics") {
      loadInitial();
    }

    return () => {
      mounted = false;
    };
  }, [projectData?.id, projectData?.analyticsEnabled, activeTab]);

  useEffect(() => {
    if (activeTab === "analytics" && projectData?.analyticsEnabled) {
      fetchAnalytics();
    }
  }, [timeRange, activeTab, projectData?.analyticsEnabled, fetchAnalytics]);

  const downloadInvoicePdf = async (inv) => {
    try {
      let fullInv = { ...inv };
      try {
        if (inv?.id) {
          const invRef = firestoreDoc(db, "invoices", inv.id);
          const invSnap = await getDoc(invRef);
          if (invSnap.exists()) {
            fullInv = { ...fullInv, ...invSnap.data() };
          }
        }
      } catch (e) {
        console.warn(
          "Could not fetch full invoice doc, proceeding with summary:",
          e
        );
      }

      try {
        if (!fullInv.clientName && projectData?.clientId) {
          const userRef = firestoreDoc(db, "users", projectData.clientId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const u = userSnap.data();
            fullInv.clientName =
              fullInv.clientName || u.displayName || u.name || u.email;
            fullInv.clientEmail = fullInv.clientEmail || u.email;
            fullInv.clientPhone = fullInv.clientPhone || u.phone || "";
            fullInv.clientAddress = fullInv.clientAddress || u.address || "";
          }
        }
      } catch (e) {
        console.warn("Could not fetch user contact info:", e);
      }

      const { blob, filename } = await generateInvoicePdf(fullInv, {
        name: "Stanford Dev Solutions",
        address: "19260 White Road Norwood LA 70761",
        email: "Stanforddevcontact@gmail.com",
        phone: "(225) 244-5660",
      });

      const url = URL.createObjectURL(blob);
      try {
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (e) {
        window.open(url, "_blank");
      } finally {
        setTimeout(() => URL.revokeObjectURL(url), 1000 * 60);
      }
    } catch (err) {
      console.error("Failed to generate invoice PDF:", err);
      alert("Unable to generate PDF invoice.");
    }
  };

  if (loading || fetching)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );

  const defaultAnalytics = {
    totalPageViews: 0,
    totalSessions: 0,
    newUsers: 0,
    engagementRate: "0.0",
    bounceRate: "0.0",
    avgSessionDuration: "00:00",
    avgEngagementTime: "0:00",
    sessionsPerUser: "0.00",
    eventsPerSession: "0.0",
    viewsPerSession: "0.0",
    scrollRate: "0",
    topPages: [],
    deviceBreakdown: [],
    topReferrers: [],
    geoBreakdown: [],
    cityBreakdown: [],
    osBreakdown: [],
    browserBreakdown: [],
    retention: [],
    weeklyTrend: [],
    realtime: { totalActiveUsers: 0, minuteTrend: [], tech: [] },
  };
  const currentAnalytics = analyticsSummary || defaultAnalytics;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500 selection:text-white flex">
      <StarBackground />

      {/* SIDEBAR (Desktop) */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 z-50 hidden lg:flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="font-bold text-white text-lg">ClientPortal</span>
          </div>
          <div className="mt-3">
            <Link
              href="/"
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2"
            >
              <HomeIcon size={14} /> Back to Site
            </Link>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {selectedProjectId && (
            <button
              onClick={() => {
                setSelectedProjectId(null);
                setActiveTab("overview");
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-slate-400 hover:text-white hover:bg-slate-800 mb-4"
            >
              <ChevronRight size={20} className="-rotate-180" /> **Project
              Chooser**
            </button>
          )}

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                activeTab === item.id
                  ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <item.icon size={20} /> {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm text-white font-medium truncate">
                {user?.email}
              </p>
              <p className="text-xs text-slate-500">Client Account</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 w-full z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-4 flex justify-between items-center h-16">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white">
            {selectedProjectId
              ? projectData?.name || "Project Dashboard"
              : "ClientPortal"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileNavOpen((s) => !s)}
            className="p-2 rounded-md hover:bg-slate-800/50"
          >
            {mobileNavOpen ? (
              <X size={20} className="text-slate-200" />
            ) : (
              <Menu size={20} className="text-slate-200" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed top-16 left-0 right-0 bottom-0 z-40 bg-slate-900/95 backdrop-blur-lg overflow-y-auto"
          >
            <div className="flex flex-col gap-2 p-4">
              {selectedProjectId && (
                <button
                  onClick={() => {
                    setSelectedProjectId(null);
                    setActiveTab("overview");
                    setMobileNavOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors text-left bg-slate-800 text-white hover:bg-slate-700/80"
                >
                  <ChevronRight size={18} className="-rotate-180" />{" "}
                  <span>Switch Projects</span>
                </button>
              )}
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left ${
                    activeTab === item.id
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800/50"
                  }`}
                >
                  <item.icon size={18} /> <span>{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <main className="flex-1 lg:pl-64 relative z-10">
        <div className={`max-w-6xl mx-auto p-4 lg:p-6 mt-16 lg:mt-0`}>
          {projects.length === 0 ? (
            <div className="text-center py-20 lg:py-40">
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome to your Dashboard
              </h2>
              <button
                onClick={() => createDemoProject(user.uid)}
                className="mt-8 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl font-semibold transition-colors"
              >
                Generate Demo Data
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* GLOBAL VIEWS (No Project Selected) */}
              {!selectedProjectId && (
                <motion.div
                  key={`global-${activeTab}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* 1. Project Chooser (Overview) */}
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      <h2 className="text-3xl font-bold text-white">
                        Your Projects
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        {projects.map((p) => (
                          <div
                            key={p.id}
                            className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-blue-500/50 transition-all cursor-pointer group"
                            onClick={() => setSelectedProjectId(p.id)}
                          >
                            <div>
                              <h3 className="text-white font-semibold truncate group-hover:text-blue-400 transition-colors">
                                {p.name}
                              </h3>
                              <p className="text-sm text-slate-400">
                                {p.status} • Due{" "}
                                {formatDateForDisplay(p.dueDate)}
                              </p>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                              <p className="text-sm text-slate-400">
                                Progress: {p.progress ?? 0}%
                              </p>
                              <span className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium">
                                View <ChevronRight size={16} />
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. Global Invoices Tab */}
                  {activeTab === "invoices" && (
                    <div className="space-y-6">
                      <h2 className="text-3xl font-bold text-white mb-6">
                        All Invoices
                      </h2>
                      <div className="space-y-6">
                        {projects.map((p) => (
                          <div
                            key={p.id}
                            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="text-white font-semibold">
                                  {p.name}
                                </h3>
                                <p className="text-sm text-slate-400">
                                  {p.status}
                                </p>
                              </div>
                              <div className="text-sm text-slate-400">
                                Invoices: {p.invoices?.length ?? 0}
                              </div>
                            </div>
                            {p.invoices?.length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                  <thead className="bg-slate-950 text-slate-400 uppercase font-medium">
                                    <tr>
                                      <th className="px-6 py-4">ID</th>
                                      <th className="px-6 py-4">Date</th>
                                      <th className="px-6 py-4">Amount</th>
                                      <th className="px-6 py-4">Status</th>
                                      <th className="px-6 py-4 text-right">
                                        Action
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-800">
                                    {p.invoices.map((inv) => (
                                      <tr
                                        key={inv.id}
                                        className="hover:bg-slate-800/30 transition-colors"
                                      >
                                        <td className="px-6 py-4 font-medium text-white">
                                          {inv.number || inv.id}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">
                                          {formatDateForDisplay(
                                            inv.dueDate ||
                                              inv.date ||
                                              inv.createdAt
                                          )}
                                        </td>
                                        <td className="px-6 py-4 text-white font-mono">
                                          ${inv.amount?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                          <span
                                            className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                                              inv.status === "Paid"
                                                ? "bg-green-500/10 text-green-400"
                                                : "bg-yellow-500/10 text-yellow-400"
                                            }`}
                                          >
                                            {inv.status}
                                          </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                          <button
                                            onClick={() =>
                                              downloadInvoicePdf(inv)
                                            }
                                            className="text-blue-400 hover:text-white font-medium text-xs"
                                          >
                                            Download
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-slate-500 text-sm p-2">
                                No invoices found.
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. Testimonials Tab */}
                  {activeTab === "testimonials" && (
                    <div className="max-w-3xl">
                      <h2 className="text-3xl font-bold text-white mb-6">
                        Submit a Testimonial
                      </h2>
                      <p className="text-slate-400 mb-6">
                        Share your experience working with us. Submissions are
                        reviewed by our team before appearing on the site.
                      </p>
                      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <TestimonialForm />
                      </div>
                    </div>
                  )}

                  {/* 4. Settings Tab */}
                  {activeTab === "settings" && (
                    <div className="max-w-2xl">
                      <h2 className="text-3xl font-bold text-white mb-8">
                        Account Settings
                      </h2>
                      <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl space-y-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                          <User size={20} /> Profile Information
                        </h3>
                        <div className="grid gap-4">
                          <div>
                            <label className="block text-sm text-slate-400 mb-1">
                              Email Address
                            </label>
                            <input
                              disabled
                              value={user?.email}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-500 cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-slate-400 mb-1">
                              Display Name
                            </label>
                            <input
                              value={profileFields.displayName}
                              onChange={(e) =>
                                setProfileFields((s) => ({
                                  ...s,
                                  displayName: e.target.value,
                                }))
                              }
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-slate-400 mb-1 flex items-center gap-1">
                              <Phone size={14} /> Phone
                            </label>
                            <input
                              value={profileFields.phone}
                              onChange={(e) =>
                                setProfileFields((s) => ({
                                  ...s,
                                  phone: e.target.value,
                                }))
                              }
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-slate-400 mb-1 flex items-center gap-1">
                              <MapPin size={14} /> Address
                            </label>
                            <input
                              value={profileFields.address}
                              onChange={(e) =>
                                setProfileFields((s) => ({
                                  ...s,
                                  address: e.target.value,
                                }))
                              }
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-3 mt-4">
                            <button
                              onClick={saveSettings}
                              disabled={savingSettings}
                              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                            >
                              <Save size={16} />{" "}
                              {savingSettings ? "Saving..." : "Save Changes"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* PROJECT SPECIFIC VIEWS */}
              {selectedProjectId && projectData && (
                <motion.div
                  key={`project-${selectedProjectId}-${activeTab}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <header className="pt-4 lg:pt-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedProjectId(null);
                            setActiveTab("overview");
                          }}
                          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white bg-slate-800/30 px-3 py-1 rounded-md"
                        >
                          <ChevronRight size={16} className="-rotate-180" />{" "}
                          Back
                        </button>
                        <h1 className="text-xl sm:text-2xl font-bold text-white truncate max-w-[70%]">
                          {projectData.name}
                        </h1>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                        <span className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                          {projectData.status}
                        </span>
                        {(projectData.status === "Completed" ||
                          projectData.completedAt) &&
                          projectData.liveUrl && (
                            <a
                              href={ensureAbsoluteUrl(projectData.liveUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
                            >
                              View Live Site <ExternalLink size={14} />
                            </a>
                          )}
                      </div>
                    </div>
                    <div className="hidden lg:flex items-center gap-2 border-b border-slate-800 pt-2">
                      {navItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                            activeTab === item.id
                              ? "text-blue-400 border-blue-600"
                              : "text-slate-400 border-transparent hover:border-slate-600"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </header>

                  <div className="pt-2">
                    {activeTab === "overview" && (
                      <div className="space-y-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <StatCard
                            icon={BarChart3}
                            label="Completion"
                            value={projectData.progress}
                            color="blue"
                            suffix="%"
                          />
                          <StatCard
                            icon={CreditCard}
                            label="Budget"
                            value={projectData.budget}
                            color="purple"
                            prefix="$"
                          />
                          <StatCard
                            icon={CheckCircle2}
                            label="Paid"
                            value={projectData.paid}
                            color="green"
                            prefix="$"
                          />
                          <StatCard
                            icon={AlertCircle}
                            label="Open Items"
                            value={2}
                            color="orange"
                          />
                        </div>
                      </div>
                    )}

                    {/* --- ANALYTICS TAB --- */}
                    {activeTab === "analytics" && isAnalyticsReady && (
                      <div className="space-y-8 pb-10">
                        {/* Control Bar */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                          <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                              <Activity size={24} className="text-blue-400" />
                              Traffic Analytics
                            </h1>
                            <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                              Live data from{" "}
                              <span className="text-blue-400 font-mono">
                                {projectData.liveUrl}
                              </span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Time Range Selector */}
                            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                              {["7d", "28d", "90d"].map((range) => (
                                <button
                                  key={range}
                                  onClick={() => setTimeRange(range)}
                                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                    timeRange === range
                                      ? "bg-blue-600 text-white shadow-sm"
                                      : "text-slate-400 hover:text-white hover:bg-slate-700"
                                  }`}
                                >
                                  {range === "7d"
                                    ? "7 Days"
                                    : range === "28d"
                                    ? "30 Days"
                                    : "3 Months"}
                                </button>
                              ))}
                            </div>

                            <button
                              onClick={() => fetchAnalytics(true)}
                              disabled={loadingAnalytics}
                              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
                              title="Refresh Data"
                            >
                              <RotateCcw
                                size={16}
                                className={
                                  loadingAnalytics ? "animate-spin" : ""
                                }
                              />
                            </button>
                          </div>
                        </div>

                        {/* Added Disclaimer Note */}
                        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
                          <Info
                            className="text-blue-400 shrink-0 mt-0.5"
                            size={18}
                          />
                          <div className="space-y-1">
                            <p className="text-sm text-blue-100 font-medium">
                              Data Processing Latency
                            </p>
                            <p className="text-xs text-blue-300/80 leading-relaxed">
                              Please note that standard metrics (Page Views,
                              Sessions, etc.) may take{" "}
                              <strong>24-48 hours</strong> to appear due to
                              Google Analytics processing times. The
                              &quot;Realtime Users&quot; card updates instantly
                              for activity within the last 30 minutes.
                            </p>
                          </div>
                        </div>

                        {loadingAnalytics && !analyticsSummary ? (
                          <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4" />
                            <p>Fetching latest report...</p>
                          </div>
                        ) : (
                          <>
                            {/* Top Row: Realtime (now single column) */}
                            <div className="grid grid-cols-1 gap-6">
                              {/* Realtime Card */}
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="lg:col-span-1 bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden flex flex-col"
                              >
                                <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />
                                <div className="flex items-center justify-between mb-6">
                                  <div className="flex items-center gap-2">
                                    <div className="relative flex h-3 w-3">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </div>
                                    <h3 className="text-indigo-200 font-semibold tracking-wide text-sm uppercase">
                                      Realtime Users
                                    </h3>
                                  </div>
                                  <span className="text-xs text-indigo-300/60 bg-indigo-900/50 px-2 py-1 rounded">
                                    Last 30 min
                                  </span>
                                </div>

                                <div className="flex items-end gap-2 mb-6">
                                  <span className="text-5xl font-bold text-white">
                                    <CountUp
                                      end={
                                        currentAnalytics.realtime
                                          ?.totalActiveUsers || 0
                                      }
                                      duration={1}
                                    />
                                  </span>
                                  <span className="text-indigo-300 mb-2 font-medium">
                                    active right now
                                  </span>
                                </div>

                                {/* Realtime Device Breakdown */}
                                {currentAnalytics.realtime?.tech?.length >
                                  0 && (
                                  <div className="mt-auto mb-4 flex gap-2">
                                    {currentAnalytics.realtime.tech.map(
                                      (t, idx) => (
                                        <span
                                          key={idx}
                                          className="text-[10px] bg-indigo-900/60 text-indigo-200 px-2 py-1 rounded-full border border-indigo-500/30 capitalize"
                                        >
                                          {t.device}: {t.activeUsers}
                                        </span>
                                      )
                                    )}
                                  </div>
                                )}

                                <div className="h-16 w-full opacity-80 mt-auto">
                                  <AnalyticsSparkline
                                    data={
                                      currentAnalytics.realtime?.minuteTrend ||
                                      []
                                    }
                                    height={64}
                                    color="#818cf8"
                                  />
                                </div>
                              </motion.div>

                              {/* Daily Traffic card removed from top row — will be placed beside Traffic Sources below */}
                            </div>

                            {/* Metrics Grid */}
                            <motion.div
                              variants={containerVariants}
                              initial="hidden"
                              animate="visible"
                              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4"
                            >
                              <StatCard
                                icon={Globe}
                                label="Page Views"
                                value={currentAnalytics.totalPageViews}
                                color="blue"
                                tooltip="Total number of pages viewed. Repeated views of a single page are counted."
                              />
                              <StatCard
                                icon={LayoutDashboard}
                                label="Sessions"
                                value={currentAnalytics.totalSessions}
                                color="purple"
                                tooltip="A session begins when a user visits your site and ends after 30 minutes of inactivity."
                              />
                              <StatCard
                                icon={Users}
                                label="New Users"
                                value={currentAnalytics.newUsers}
                                color="teal"
                                tooltip="The number of users who interacted with your site for the first time."
                              />
                              <StatCard
                                icon={Zap}
                                label="Engage. Rate"
                                value={currentAnalytics.engagementRate}
                                color="yellow"
                                suffix="%"
                                tooltip="Percentage of sessions that were 'engaged' (lasted > 10s, had a conversion, or had 2+ pageviews)."
                              />
                              <StatCard
                                icon={ChevronDown}
                                label="Bounce Rate"
                                value={currentAnalytics.bounceRate}
                                color="orange"
                                suffix="%"
                                tooltip="Percentage of sessions that were not 'engaged'."
                              />
                              <StatCard
                                icon={Clock4}
                                label="Avg. Duration"
                                value={currentAnalytics.avgSessionDuration}
                                color="green"
                                tooltip="Average amount of time users spent engaged with your site."
                              />
                              <StatCard
                                icon={Activity}
                                label="Sess/User"
                                value={currentAnalytics.sessionsPerUser}
                                color="pink"
                                tooltip="Average number of sessions per user. Higher means users are coming back."
                              />
                              <StatCard
                                icon={ArrowRightCircle}
                                label="Events/Sess"
                                value={currentAnalytics.eventsPerSession}
                                color="indigo"
                                tooltip="Average number of interactions (clicks, scrolls, etc.) per session."
                              />
                              <StatCard
                                icon={Timer}
                                label="Avg. Engage Time"
                                value={currentAnalytics.avgEngagementTime}
                                color="cyan"
                                prefix=""
                                tooltip="Average length of time that the app was in the foreground."
                              />
                              {/* NEW METRICS */}
                              <StatCard
                                icon={MousePointer2}
                                label="Views/Sess"
                                value={currentAnalytics.viewsPerSession}
                                color="fuchsia"
                                tooltip="Average number of page views per session."
                              />
                              <StatCard
                                icon={ArrowUpCircle}
                                label="Scroll Rate"
                                value={currentAnalytics.scrollRate}
                                color="emerald"
                                suffix="%"
                                tooltip="Percentage of unique users who scrolled on a page."
                              />
                            </motion.div>

                            {/* NEW ROW: Retention & Time Trends */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* User Retention (New vs Returning) */}
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 }}
                                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
                              >
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                  <Users size={18} className="text-teal-400" />{" "}
                                  User Retention
                                </h3>
                                <div className="space-y-4">
                                  {currentAnalytics.retention?.map(
                                    (item, i) => {
                                      const total =
                                        currentAnalytics.retention.reduce(
                                          (a, b) => a + b.count,
                                          0
                                        ) || 1;
                                      const percent =
                                        (item.count / total) * 100;
                                      const label =
                                        item.type === "new"
                                          ? "New Visitors"
                                          : "Returning Visitors";
                                      const color =
                                        item.type === "new" ? "teal" : "purple";

                                      return (
                                        <div key={i}>
                                          <div className="flex justify-between items-center text-sm mb-1">
                                            <span className="text-slate-300 font-medium">
                                              {label}
                                            </span>
                                            <span className="text-white font-mono">
                                              {item.count.toLocaleString()}{" "}
                                              <span className="text-slate-500 text-xs">
                                                ({percent.toFixed(0)}%)
                                              </span>
                                            </span>
                                          </div>
                                          <div className="w-full bg-slate-800 rounded-full h-2">
                                            <motion.div
                                              initial={{ width: 0 }}
                                              animate={{ width: `${percent}%` }}
                                              transition={{
                                                duration: 1,
                                                delay: 0.5,
                                              }}
                                              className={`bg-${color}-500 h-2 rounded-full`}
                                            />
                                          </div>
                                        </div>
                                      );
                                    }
                                  )}
                                  {(!currentAnalytics.retention ||
                                    currentAnalytics.retention.length ===
                                      0) && (
                                    <p className="text-xs text-slate-500 italic">
                                      No retention data yet.
                                    </p>
                                  )}
                                </div>
                              </motion.div>

                              {/* Busiest Days (Weekly Trend) - Fixed Hover & Scaling */}
                              <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.75 }}
                                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col"
                              >
                                {/* Header & Filters */}
                                <div className="flex items-center justify-between mb-6">
                                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Calendar
                                      size={18}
                                      className="text-orange-400"
                                    />{" "}
                                    Busiest Days
                                  </h3>
                                  <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                                    {["7d", "28d", "90d"].map((range) => (
                                      <button
                                        key={range}
                                        onClick={() => setTimeRange(range)}
                                        className={`px-2 py-1 text-[10px] font-medium rounded-md transition-colors ${
                                          timeRange === range
                                            ? "bg-orange-500 text-white shadow-sm"
                                            : "text-slate-400 hover:text-white hover:bg-slate-700"
                                        }`}
                                      >
                                        {range === "7d"
                                          ? "7D"
                                          : range === "28d"
                                          ? "30D"
                                          : "3M"}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Graph Container */}
                                <div className="flex-1 flex items-stretch gap-2 min-h-[160px]">
                                  {(() => {
                                    // 1. Parse Data safely
                                    const trend =
                                      currentAnalytics.weeklyTrend || [];
                                    const toNum = (v) => {
                                      const n = parseFloat(
                                        String(v).replace(/[^0-9.-]/g, "")
                                      );
                                      return Number.isFinite(n) ? n : 0;
                                    };
                                    const numericSessions = trend.map((d) =>
                                      toNum(d?.sessions)
                                    );

                                    // 2. Smart Scaling Logic
                                    // Find the true max in the data
                                    const rawMax = numericSessions.length
                                      ? Math.max(...numericSessions)
                                      : 0;

                                    // Calculate a "nice" max for the Y-axis (multiples of 5 or 10)
                                    // If rawMax is 24, axisMax becomes 25. If rawMax is 0, default to 10.
                                    let axisMax =
                                      rawMax > 0
                                        ? Math.ceil(rawMax / 5) * 5
                                        : 10;

                                    // If the numbers are huge (e.g. 500), step by 50 instead of 5
                                    if (axisMax > 100)
                                      axisMax = Math.ceil(rawMax / 50) * 50;

                                    return (
                                      <>
                                        {/* Y-Axis Labels */}
                                        <div className="flex flex-col justify-between text-xs text-slate-500 font-mono py-1 h-full text-right pr-2 border-r border-slate-800/50">
                                          <span>{axisMax}</span>
                                          <span>{Math.round(axisMax / 2)}</span>
                                          <span>0</span>
                                        </div>

                                        {/* Chart Area */}
                                        <div className="relative flex-1 flex items-end justify-between gap-2 h-full">
                                          {/* Background Grid Lines */}
                                          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
                                            <div className="border-t border-slate-800/50 border-dashed w-full h-px translate-y-[1px]"></div>
                                            <div className="border-t border-slate-800/50 border-dashed w-full h-px"></div>
                                            <div className="border-t border-slate-800/50 border-dashed w-full h-px -translate-y-[1px]"></div>
                                          </div>

                                          {/* Columns */}
                                          {trend.map((day, i) => {
                                            const sessions = toNum(
                                              day?.sessions
                                            );
                                            const heightPercent =
                                              (sessions / axisMax) * 100;

                                            return (
                                              <div
                                                key={i}
                                                // GROUP on the parent ensures hovering anywhere in the column works
                                                className="flex-1 flex flex-col items-center gap-2 group h-full relative z-10"
                                              >
                                                {/* Track (Empty Space) - Removed overflow-hidden so tooltip pops out */}
                                                <div className="w-full bg-slate-800/30 rounded-t-md relative flex-1 flex items-end group-hover:bg-slate-800/50 transition-colors">
                                                  {/* The Filled Bar */}
                                                  <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{
                                                      height: `${heightPercent}%`,
                                                    }}
                                                    transition={{
                                                      duration: 0.8,
                                                      delay: i * 0.1,
                                                      type: "spring",
                                                      stiffness: 60,
                                                    }}
                                                    className="w-full bg-orange-500 rounded-t-sm group-hover:bg-orange-400 min-h-[2px] relative"
                                                  >
                                                    {/* Tooltip attached to the top of the bar */}
                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded shadow-xl border border-slate-700 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 pointer-events-none whitespace-nowrap z-20">
                                                      {sessions}
                                                      {/* Little triangle pointer */}
                                                      <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-r border-b border-slate-700 rotate-45"></div>
                                                    </div>
                                                  </motion.div>
                                                </div>

                                                {/* X-Axis Label */}
                                                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                                                  {day.day}
                                                </span>
                                              </div>
                                            );
                                          })}

                                          {!trend.length && (
                                            <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm italic">
                                              No trend data available
                                            </div>
                                          )}
                                        </div>
                                      </>
                                    );
                                  })()}
                                </div>
                              </motion.div>

                              {/* Traffic Sources + Daily Traffic side-by-side */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:col-span-2">
                                <motion.div
                                  initial={{ opacity: 0, x: 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.65 }}
                                  className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 min-h-[220px] flex flex-col"
                                >
                                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <ArrowRightCircle
                                      size={18}
                                      className="text-green-400"
                                    />{" "}
                                    Traffic Sources
                                  </h3>
                                  <ul className="space-y-4">
                                    {currentAnalytics.topReferrers?.map(
                                      (ref, i) => {
                                        // Use helper to get friendly name
                                        const {
                                          name,
                                          icon: SourceIcon,
                                          color,
                                        } = formatTrafficSource(ref.source);
                                        // Calculate roughly max for bar
                                        const max =
                                          currentAnalytics.topReferrers[0]
                                            ?.sessions || 1;
                                        const percent =
                                          (ref.sessions / max) * 100;

                                        return (
                                          <li key={i} className="group">
                                            <div className="flex justify-between items-center text-sm mb-1.5">
                                              <div className="flex items-center gap-2 truncate">
                                                <SourceIcon
                                                  size={14}
                                                  className={`text-${color}-400`}
                                                />
                                                <span
                                                  className="truncate text-slate-300 group-hover:text-green-300 transition-colors"
                                                  title={ref.source}
                                                >
                                                  {name}
                                                </span>
                                              </div>
                                              <span className="text-white font-mono bg-slate-800 px-2 py-0.5 rounded text-xs">
                                                {ref.sessions.toLocaleString()}
                                              </span>
                                            </div>
                                            <div className="relative h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                              <motion.div
                                                initial={{ width: 0 }}
                                                animate={{
                                                  width: `${percent}%`,
                                                }}
                                                transition={{
                                                  duration: 1,
                                                  delay: 0.2 + i * 0.1,
                                                }}
                                                className="absolute top-0 left-0 h-full bg-green-500 rounded-full"
                                              />
                                            </div>
                                          </li>
                                        );
                                      }
                                    )}
                                  </ul>
                                </motion.div>

                                {/* Daily Traffic moved here, matching Traffic Sources size */}
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1 }}
                                  className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col min-h-[220px]"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                    <div className="flex items-center gap-4">
                                      <div>
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                          <Activity
                                            size={18}
                                            className="text-blue-400"
                                          />
                                          Daily Traffic
                                        </h3>
                                        <p className="text-xs text-slate-400">
                                          Unique sessions per day
                                        </p>
                                      </div>

                                      {/* Time Range Filters */}
                                      <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                                        {["7d", "28d", "90d"].map((range) => (
                                          <button
                                            key={range}
                                            onClick={() => setTimeRange(range)}
                                            className={`px-3 py-1 text-[10px] font-medium rounded-md transition-colors ${
                                              timeRange === range
                                                ? "bg-blue-600 text-white shadow-sm"
                                                : "text-slate-400 hover:text-white hover:bg-slate-700"
                                            }`}
                                          >
                                            {range === "7d"
                                              ? "7D"
                                              : range === "28d"
                                              ? "30D"
                                              : "3M"}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Summary Stat */}
                                    <div className="text-right bg-slate-800/30 px-3 py-1 rounded-lg border border-slate-800">
                                      <p className="text-[10px] text-slate-500 uppercase font-semibold">
                                        Avg. Visitors
                                      </p>
                                      <p className="text-lg font-bold text-white">
                                        {Math.round(
                                          analyticsCounts.reduce(
                                            (a, b) => a + (b.count || 0),
                                            0
                                          ) / (analyticsCounts.length || 1)
                                        )}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Chart Container now fills available vertical space */}
                                  <div className="flex-1 flex gap-2 w-full">
                                    {(() => {
                                      const formatDate = (dateStr) => {
                                        if (!dateStr) return "Unknown";
                                        const s = String(dateStr);
                                        if (s.includes("-")) {
                                          const d = new Date(s);
                                          return isNaN(d)
                                            ? s
                                            : d.toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                              });
                                        }
                                        if (s.length === 8) {
                                          const year = s.substring(0, 4);
                                          const month = s.substring(4, 6);
                                          const day = s.substring(6, 8);
                                          const d = new Date(
                                            `${year}-${month}-${day}`
                                          );
                                          return isNaN(d)
                                            ? s
                                            : d.toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                              });
                                        }
                                        return s;
                                      };

                                      // Build a list of days for the selected time range and fill missing days with 0
                                      const daysCount =
                                        timeRange === "7d"
                                          ? 7
                                          : timeRange === "28d"
                                          ? 30
                                          : 90;
                                      // Use the latest date in analyticsCounts if available, otherwise today
                                      const latestDateStr =
                                        analyticsCounts &&
                                        analyticsCounts.length
                                          ? analyticsCounts[
                                              analyticsCounts.length - 1
                                            ].date
                                          : null;
                                      const latestDate = latestDateStr
                                        ? new Date(
                                            latestDateStr.includes("-")
                                              ? latestDateStr
                                              : `${latestDateStr.substring(
                                                  0,
                                                  4
                                                )}-${latestDateStr.substring(
                                                  4,
                                                  6
                                                )}-${latestDateStr.substring(
                                                  6,
                                                  8
                                                )}`
                                          )
                                        : new Date();

                                      const desiredDates = [];
                                      for (let i = daysCount - 1; i >= 0; i--) {
                                        const d = new Date(latestDate);
                                        d.setDate(latestDate.getDate() - i);
                                        desiredDates.push(
                                          d.toISOString().slice(0, 10)
                                        ); // YYYY-MM-DD
                                      }

                                      // Map analyticsCounts by formatted date for quick lookup
                                      const countsMap = {};
                                      analyticsCounts.forEach((c) => {
                                        countsMap[formatDate(c.date)] = Number(
                                          c.count || c.activeUsers || 0
                                        );
                                      });

                                      const data = desiredDates.map((iso) => {
                                        const label = formatDate(iso);
                                        return {
                                          fullDate: label,
                                          val: countsMap[label] || 0,
                                        };
                                      });

                                      const maxVal = Math.max(
                                        ...data.map((d) => d.val),
                                        1
                                      );
                                      const axisMax = Math.ceil(maxVal / 5) * 5;

                                      return (
                                        <>
                                          <div className="flex flex-col justify-between text-[10px] text-slate-500 font-mono py-1 text-right border-r border-slate-800/50 pr-3 w-8 shrink-0">
                                            <span>{axisMax}</span>
                                            <span>
                                              {Math.round(axisMax * 0.5)}
                                            </span>
                                            <span>0</span>
                                          </div>

                                          <div className="relative flex-1 h-full group/chart cursor-crosshair">
                                            <svg
                                              className="w-full h-full overflow-visible"
                                              preserveAspectRatio="none"
                                              viewBox="0 0 100 100"
                                            >
                                              <defs>
                                                <linearGradient
                                                  id="trafficGradient"
                                                  x1="0"
                                                  y1="0"
                                                  x2="0"
                                                  y2="1"
                                                >
                                                  <stop
                                                    offset="0%"
                                                    stopColor="#60a5fa"
                                                    stopOpacity="0.4"
                                                  />
                                                  <stop
                                                    offset="100%"
                                                    stopColor="#60a5fa"
                                                    stopOpacity="0"
                                                  />
                                                </linearGradient>
                                              </defs>

                                              {[0, 50, 100].map((pos) => (
                                                <line
                                                  key={pos}
                                                  x1="0"
                                                  y1={pos}
                                                  x2="100"
                                                  y2={pos}
                                                  stroke="#1e293b"
                                                  strokeWidth="1"
                                                  strokeDasharray="4 4"
                                                  vectorEffect="non-scaling-stroke"
                                                />
                                              ))}

                                              {data.length > 1 ? (
                                                <>
                                                  <path
                                                    d={`
                        M0,100 
                        ${data
                          .map((d, i) => {
                            const x = (i / (data.length - 1)) * 100;
                            const y = 100 - (d.val / axisMax) * 100;
                            return `L${x},${y}`;
                          })
                          .join(" ")}
                        L100,100 Z
                      `}
                                                    fill="url(#trafficGradient)"
                                                  />
                                                  <path
                                                    d={`
                        M0,${100 - (data[0].val / axisMax) * 100}
                        ${data
                          .map((d, i) => {
                            const x = (i / (data.length - 1)) * 100;
                            const y = 100 - (d.val / axisMax) * 100;
                            return `L${x},${y}`;
                          })
                          .join(" ")}
                      `}
                                                    fill="none"
                                                    stroke="#60a5fa"
                                                    strokeWidth="2"
                                                    vectorEffect="non-scaling-stroke"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                  />
                                                </>
                                              ) : (
                                                <text
                                                  x="50"
                                                  y="50"
                                                  textAnchor="middle"
                                                  fill="#94a3b8"
                                                  fontSize="5"
                                                >
                                                  Not enough data
                                                </text>
                                              )}
                                            </svg>

                                            <div className="absolute inset-0 flex items-stretch justify-between z-10">
                                              {data.map((item, i) => (
                                                <div
                                                  key={i}
                                                  className="flex-1 group/col relative"
                                                >
                                                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-blue-400/50 opacity-0 group-hover/col:opacity-100 pointer-events-none" />

                                                  <div
                                                    className="absolute w-2 h-2 bg-blue-400 rounded-full border-2 border-slate-900 opacity-0 group-hover/col:opacity-100 transition-opacity pointer-events-none shadow-[0_0_10px_rgba(96,165,250,0.5)] z-20"
                                                    style={{
                                                      left: "50%",
                                                      top: `${
                                                        100 -
                                                        (item.val / axisMax) *
                                                          100
                                                      }%`,
                                                      transform:
                                                        "translate(-50%, -50%)",
                                                    }}
                                                  />

                                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-white text-xs p-2 rounded-lg border border-slate-600 shadow-2xl opacity-0 group-hover/col:opacity-100 transition-opacity pointer-events-none z-30 min-w-[90px] text-center backdrop-blur-md">
                                                    <p className="font-bold text-blue-300">
                                                      {item.val} Visits
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                                      {item.fullDate}
                                                    </p>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        </>
                                      );
                                    })()}
                                  </div>
                                </motion.div>
                              </div>
                            </div>

                            {/* Geo & Tech Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Geographic Distribution */}
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 }}
                                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
                              >
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                  <Map size={18} className="text-indigo-400" />{" "}
                                  Geographic Distribution
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                  {/* Countries */}
                                  <div>
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                                      Top Countries
                                    </h4>
                                    <div className="space-y-3">
                                      {currentAnalytics.geoBreakdown &&
                                      currentAnalytics.geoBreakdown.length >
                                        0 ? (
                                        currentAnalytics.geoBreakdown
                                          .slice(0, 4)
                                          .map((geo, i) => {
                                            const maxUsers = Math.max(
                                              ...currentAnalytics.geoBreakdown.map(
                                                (g) => g.activeUsers
                                              )
                                            );
                                            const percent =
                                              (geo.activeUsers / maxUsers) *
                                              100;
                                            return (
                                              <div key={i} className="group">
                                                <div className="flex justify-between items-center text-sm mb-1">
                                                  <div className="flex items-center gap-2 truncate">
                                                    <span
                                                      className="text-lg"
                                                      role="img"
                                                      aria-label={geo.country}
                                                    >
                                                      {getCountryFlag(
                                                        geo.country
                                                      )}
                                                    </span>
                                                    <span className="text-slate-300 font-medium truncate">
                                                      {geo.country}
                                                    </span>
                                                  </div>
                                                  <span className="text-white font-mono text-xs">
                                                    {geo.activeUsers}
                                                  </span>
                                                </div>
                                                <div className="w-full bg-slate-800 rounded-full h-1">
                                                  <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{
                                                      width: `${percent}%`,
                                                    }}
                                                    transition={{ duration: 1 }}
                                                    className="bg-indigo-500 h-1 rounded-full"
                                                  />
                                                </div>
                                              </div>
                                            );
                                          })
                                      ) : (
                                        <p className="text-xs text-slate-500 italic">
                                          No data
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Cities */}
                                  <div>
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                                      Top Cities
                                    </h4>
                                    <div className="space-y-3">
                                      {currentAnalytics.cityBreakdown &&
                                      currentAnalytics.cityBreakdown.length >
                                        0 ? (
                                        currentAnalytics.cityBreakdown
                                          .slice(0, 4)
                                          .map((city, i) => {
                                            const maxUsers = Math.max(
                                              ...currentAnalytics.cityBreakdown.map(
                                                (c) => c.activeUsers
                                              )
                                            );
                                            const percent =
                                              (city.activeUsers / maxUsers) *
                                              100;
                                            const displayCity =
                                              city.region &&
                                              city.region !== "(not set)"
                                                ? `${city.city}, ${getStateAbbr(
                                                    city.region
                                                  )}`
                                                : city.city;

                                            return (
                                              <div key={i} className="group">
                                                <div className="flex justify-between items-center text-sm mb-1">
                                                  <div className="flex items-center gap-2 truncate">
                                                    <MapPinIcon
                                                      size={12}
                                                      className="text-slate-500"
                                                    />
                                                    <span
                                                      className="text-slate-300 font-medium truncate"
                                                      title={displayCity}
                                                    >
                                                      {displayCity}
                                                    </span>
                                                  </div>
                                                  <span className="text-white font-mono text-xs">
                                                    {city.activeUsers}
                                                  </span>
                                                </div>
                                                <div className="w-full bg-slate-800 rounded-full h-1">
                                                  <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{
                                                      width: `${percent}%`,
                                                    }}
                                                    transition={{ duration: 1 }}
                                                    className="bg-blue-500 h-1 rounded-full"
                                                  />
                                                </div>
                                              </div>
                                            );
                                          })
                                      ) : (
                                        <p className="text-xs text-slate-500 italic">
                                          No data
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>

                              {/* Tech Stack (Browser & OS) */}
                              <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 }}
                                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
                              >
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                  <Monitor
                                    size={18}
                                    className="text-purple-400"
                                  />{" "}
                                  Tech Stack
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {/* Operating Systems */}
                                  <div>
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                                      OS
                                    </h4>
                                    <div className="space-y-2">
                                      {currentAnalytics.osBreakdown?.map(
                                        (os, i) => {
                                          const percentage =
                                            currentAnalytics.totalSessions > 0
                                              ? (
                                                  (os.sessions /
                                                    currentAnalytics.totalSessions) *
                                                  100
                                                ).toFixed(0)
                                              : 0;
                                          return (
                                            <div
                                              key={i}
                                              className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30"
                                            >
                                              <div className="flex items-center gap-2">
                                                <div className="text-slate-400">
                                                  {getOSIcon(os.os)}
                                                </div>
                                                <span className="text-sm text-slate-200">
                                                  {os.os}
                                                </span>
                                              </div>
                                              <span className="text-xs text-slate-400 font-mono">
                                                {percentage}%
                                              </span>
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>
                                  </div>

                                  {/* Browsers */}
                                  <div>
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                                      Browser
                                    </h4>
                                    <div className="space-y-2">
                                      {currentAnalytics.browserBreakdown?.map(
                                        (b, i) => {
                                          const percentage =
                                            currentAnalytics.totalSessions > 0
                                              ? (
                                                  (b.sessions /
                                                    currentAnalytics.totalSessions) *
                                                  100
                                                ).toFixed(0)
                                              : 0;
                                          return (
                                            <div
                                              key={i}
                                              className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30"
                                            >
                                              <div className="flex items-center gap-2">
                                                <div className="text-slate-400">
                                                  {getBrowserIcon(b.browser)}
                                                </div>
                                                <span className="text-sm text-slate-200 truncate max-w-[80px]">
                                                  {b.browser}
                                                </span>
                                              </div>
                                              <span className="text-xs text-slate-400 font-mono">
                                                {percentage}%
                                              </span>
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </div>

                            <div className="text-center pt-4">
                              <p className="text-xs text-slate-500">
                                Last updated:{" "}
                                {currentAnalytics.lastUpdated?.toDate
                                  ? formatDateForDisplay(
                                      currentAnalytics.lastUpdated
                                    ) +
                                    " " +
                                    currentAnalytics.lastUpdated
                                      .toDate()
                                      .toLocaleTimeString()
                                  : new Date().toLocaleTimeString()}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* PROJECT DOCUMENTS TAB */}
                    {activeTab === "documents" && (
                      <div>
                        <h1 className="text-3xl font-bold text-white mb-8">
                          Project Documents
                        </h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {projectData.documents?.map((doc, i) => (
                            <a
                              key={i}
                              href="#"
                              className="flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-blue-500/50 transition-colors group"
                            >
                              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                                <FileText className="text-blue-400" size={20} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-medium truncate">
                                  {doc.name}
                                </h4>
                                <p className="text-sm text-slate-500">
                                  {doc.size} • {doc.type.toUpperCase()}
                                </p>
                              </div>
                              <button className="sm:hidden text-sm text-slate-400 group-hover:text-blue-400 transition-colors">
                                Download
                              </button>
                              <Download
                                size={18}
                                className="hidden sm:block text-slate-500 group-hover:text-white shrink-0"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "invoices" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-2xl font-bold text-white">
                            Invoices
                          </h2>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                          {/* Desktop Table View */}
                          <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left text-sm">
                              <thead className="bg-slate-950 text-slate-400 uppercase font-medium">
                                <tr>
                                  <th className="px-6 py-4">Invoice ID</th>
                                  <th className="px-6 py-4">Date</th>
                                  <th className="px-6 py-4">Amount</th>
                                  <th className="px-6 py-4">Status</th>
                                  <th className="px-6 py-4 text-right">
                                    Action
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800">
                                {projectData.invoices?.length > 0 ? (
                                  projectData.invoices.map((inv) => (
                                    <tr
                                      key={inv.id}
                                      className="hover:bg-slate-800/30 transition-colors"
                                    >
                                      <td className="px-6 py-4 font-medium text-white">
                                        {inv.number || inv.id}
                                      </td>
                                      <td className="px-6 py-4 text-slate-400">
                                        {formatDateForDisplay(
                                          inv.dueDate ||
                                            inv.date ||
                                            inv.createdAt
                                        )}
                                      </td>
                                      <td className="px-6 py-4 text-white font-mono">
                                        ${inv.amount?.toLocaleString()}
                                      </td>
                                      <td className="px-6 py-4">
                                        <span
                                          className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                                            inv.status === "Paid"
                                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                              : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                          }`}
                                        >
                                          {inv.status}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                        <button
                                          onClick={() =>
                                            downloadInvoicePdf(inv)
                                          }
                                          className="text-blue-400 hover:text-white font-medium text-xs"
                                        >
                                          Download
                                        </button>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td
                                      colSpan="5"
                                      className="px-6 py-8 text-center text-slate-500"
                                    >
                                      No invoices found for this project.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile List View */}
                          <div className="block lg:hidden p-4 space-y-3">
                            {projectData.invoices?.length > 0 ? (
                              projectData.invoices.map((inv) => (
                                <div
                                  key={inv.id}
                                  className="bg-slate-950/20 border border-slate-800 rounded-lg p-4 flex items-center justify-between"
                                >
                                  <div>
                                    <p className="text-sm text-slate-400">
                                      #{inv.number || inv.id}
                                    </p>
                                    <p className="text-white font-medium">
                                      ${inv.amount?.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                      {formatDateForDisplay(
                                        inv.dueDate || inv.date || inv.createdAt
                                      )}
                                    </p>
                                  </div>
                                  <div className="text-right flex flex-col items-end gap-2">
                                    <span
                                      className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                                        inv.status === "Paid"
                                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                          : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                      }`}
                                    >
                                      {inv.status}
                                    </span>
                                    <button
                                      onClick={() => downloadInvoicePdf(inv)}
                                      className="text-blue-400 hover:text-white text-xs flex items-center gap-1"
                                    >
                                      <Download size={12} /> Download
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-center text-slate-500 py-4">
                                No invoices found.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}
