import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
];

function getCleanUrl(): string {
  let u = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/^["']|["']$/g, "");
  if (!u || u === "undefined" || u === "null" || u.includes("placeholder")) {
    return "https://cuidsmnsmouudbgodtcj.supabase.co";
  }
  if (!u.startsWith("http://") && !u.startsWith("https://")) {
    return `https://${u}`;
  }
  return u;
}

function getCleanKey(): string {
  let k = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim().replace(/^["']|["']$/g, "");
  if (!k || k === "undefined" || k === "null" || k.length < 20 || k.includes("placeholder")) {
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1aWRzbW5zbW91dWRiZ29kdGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MjIxNDQsImV4cCI6MjEwNDE5ODE0NH0.kgecwVQPQdy3i5kHFp75reC4RJsmJZheJYxrzdBLTsA";
  }
  return k;
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: getCleanUrl(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: getCleanKey(),
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || "psujith9087@gmail.com",
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "Xxxsuji@123",
    AUTH_SECRET:
      process.env.AUTH_SECRET ||
      "z-electronics-super-secure-production-secret-key-2026",
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
