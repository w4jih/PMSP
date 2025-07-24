import type { NextConfig } from "next";

// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'off',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY', // Prevent clickjacking
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff', // Prevent MIME-type sniffing
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block', // Legacy XSS filter
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload', // Enforce HTTPS for 2 years
  },
  {
    key: 'Referrer-Policy',
    value: 'no-referrer-when-downgrade', // Limit referrer info
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()', // Restrict browser APIs
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';",
  },
];

module.exports = {
  reactStrictMode: true,
  poweredByHeader: false, // Remove 'X-Powered-By: Next.js'
  async headers() {
    return [
      {
        source: '/(.*)', // Apply headers to all routes
        headers: securityHeaders,
      },
    ];
  },
};


const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
