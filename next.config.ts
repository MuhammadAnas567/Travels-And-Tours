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
    // Next 16 defaults to [75] only — hero + editorial slots use 90
    qualities: [60, 70, 75, 80, 85, 90],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "utfs.io" },
      // SerpApi / Google Flights airline logos
      { protocol: "https", hostname: "www.gstatic.com", pathname: "/flights/airline_logos/**" },
    ],
  },
};

export default nextConfig;
