/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    // ensure Turbopack resolves the project root correctly
    root: path.resolve(__dirname),
  },
};

module.exports = nextConfig;
