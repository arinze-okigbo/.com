import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "substackcdn.com",
        port: "",
        pathname: "/image/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "substack-post-media.s3.amazonaws.com",
        port: "",
        pathname: "/public/images/**",
        search: "",
      },
    ],
  },
  experimental: { inlineCss: true, optimizePackageImports: ["@react-three/drei", "framer-motion"] },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
