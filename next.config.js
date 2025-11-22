/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    // ensure Turbopack resolves the project root correctly
    root: path.resolve(__dirname),
  },
};

// Optional bundle analyzer. Enable with ANALYZE=1 (or via the `analyze` script).
try {
  const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "1" || process.env.ANALYZE === "true",
  });
  module.exports = withBundleAnalyzer(nextConfig);
} catch (e) {
  // If the analyzer isn't installed, fall back to default config.
  module.exports = nextConfig;
}
