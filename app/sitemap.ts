import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/flights",
    "/hotels",
    "/packages",
    "/cars",
    "/things-to-do",
    "/deals",
    "/tours",
    "/blog",
    "/visa",
    "/plan-trip",
    "/about",
    "/contact",
    "/faq",
    "/terms",
    "/privacy",
    "/careers",
    "/press",
    "/investors",
    "/insurance",
    "/partners",
    "/affiliates",
    "/advertise",
    "/login",
    "/register",
  ];

  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
