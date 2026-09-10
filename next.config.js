/** @type {import('next').NextConfig} */

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' mailto:",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google.com https://www.gstatic.com https://apis.google.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://*.google-analytics.com https://*.posthog.com https://app.posthog.com https://*.firebaseio.com wss://*.firebaseio.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://www.google.com",
  "frame-src https://www.google.com https://recaptcha.google.com https://stanforddev.firebaseapp.com",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
];

const nextConfig = {
  reactStrictMode: true,

  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },

  // Tree-shake heavy barrel imports → faster compile & smaller bundles (Next 14+).
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "firebase",
      "framer-motion",
      "@react-three/fiber",
      "@react-three/drei",
    ],
  },

  // Keep Turbopack scoped to this repository even when a parent directory has a lockfile.
  turbopack: {
    root: __dirname,
  },

  // Production source maps add compile + artifact time; enable only when debugging prod.
  productionBrowserSourceMaps:
    process.env.NEXT_PUBLIC_SOURCE_MAPS === "true",
};

// Optional bundle analyzer. Enable with ANALYZE=1 (or via the `analyze` script).
try {
  const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "1" || process.env.ANALYZE === "true",
  });
  module.exports = withBundleAnalyzer(nextConfig);
} catch (e) {
  module.exports = nextConfig;
}
