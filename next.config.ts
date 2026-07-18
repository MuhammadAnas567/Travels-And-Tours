import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Prisma query engine out of the Turbopack bundle (avoids empty engine responses)
  serverExternalPackages: ["@prisma/client", "prisma", "mongoose"],
  // Ensure `.env` (empty on Vercel) is present in serverless function bundles.
  // Avoids Next 16.2 EnvFileReadError on dynamic routes when the adapter looks for it.
  outputFileTracingIncludes: {
    "/**": ["./.env"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "utfs.io" },
    ],
  },
};

export default nextConfig;
