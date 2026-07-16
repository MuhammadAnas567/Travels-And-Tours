import { unstable_cache } from "next/cache";
import { getTours, getTourCountries } from "@/lib/tours";

/** Cached default catalogue — avoids re-hitting Atlas on every navbar click */
export const getCachedDefaultTours = unstable_cache(
  async () => getTours({ limit: 12, page: 1, sort: "popular" }),
  ["tours-default-v1"],
  { revalidate: 120 }
);

export const getCachedTourCountries = unstable_cache(
  async () => getTourCountries(),
  ["tour-countries-v1"],
  { revalidate: 300 }
);

export const getCachedPackages = unstable_cache(
  async () => getTours({ limit: 24, page: 1, sort: "popular" }),
  ["packages-default-v1"],
  { revalidate: 120 }
);
