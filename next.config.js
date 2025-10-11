const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add any Next.js configuration options here
  webpack: (config) => {
    config.resolve.extensions = [
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ...config.resolve.extensions,
    ];
    return config;
  },
};

module.exports = withNextIntl(nextConfig);
