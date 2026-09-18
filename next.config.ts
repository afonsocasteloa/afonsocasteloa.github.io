import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "media.valorant-api.com" },
      { protocol: "https", hostname: "trackercdn.com" },
      { protocol: "https", hostname: "titles.trackercdn.com" },
      { protocol: "https", hostname: "imgsvc.trackercdn.com" },
    ],
  },
};

export default nextConfig;
