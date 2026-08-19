import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@rep/types"],
  // Anchor Next's output-file tracing to the monorepo root; otherwise a stray
  // package-lock.json elsewhere on the machine can be misdetected as the
  // workspace root.
  outputFileTracingRoot: path.join(__dirname, "../.."),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "commons.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "www.sourcesplash.com",
      },
    ],
  },
};

export default nextConfig;
