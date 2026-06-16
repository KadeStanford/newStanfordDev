/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,

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
