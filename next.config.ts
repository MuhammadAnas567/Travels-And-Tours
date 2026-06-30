import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Prisma query engine out of the Turbopack bundle (avoids empty engine responses)
  serverExternalPackages: ["@prisma/client", "prisma"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "utfs.io" },
    ],
  },
};

export default nextConfig;
