import type { NextConfig } from "next";

// A conservative baseline that cannot break the inline bootstrap scripts, next/font or Vercel
// Analytics (it restricts framing, <base>, plugins and form targets, not script/style sources). A
// strict script-src would need per-request nonces (forcing dynamic rendering) or build-time hashes.
// frame-ancestors allows this site and the infiniview.dev family (e.g. docs embedding /preview) and
// blocks everyone else, which protects the waitlist form from clickjacking.
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value:
      "base-uri 'self'; form-action 'self'; object-src 'none'; frame-ancestors 'self' https://infiniview.dev https://*.infiniview.dev",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
