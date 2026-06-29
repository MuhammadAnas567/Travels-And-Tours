"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const categories = [
  "ADVENTURE",
  "FAMILY",
  "HONEYMOON",
  "CULTURAL",
  "BEACH",
  "WILDLIFE",
  "LUXURY",
  "BUDGET",
] as const;

export function FilterSidebar({ countries }: { countries: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      router.push(`/tours?${params.toString()}`);
    },
    [router, searchParams]
  );

  function clearFilters() {
    router.push("/tours");
  }

  return (
    <aside className="space-y-5 rounded-xl border border-ocean-100 bg-white p-5" aria-label="Tour filters">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-ocean-900">Filters</h2>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear
        </Button>
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select
          value={searchParams.get("category") ?? ""}
          onValueChange={(v) => updateParams("category", v === "all" ? "" : v)}
        >
          <SelectTrigger id="category" className="mt-1">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat} className="capitalize">
                {cat.toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="country">Country</Label>
        <Select
          value={searchParams.get("country") ?? ""}
          onValueChange={(v) => updateParams("country", v === "all" ? "" : v)}
        >
          <SelectTrigger id="country" className="mt-1">
            <SelectValue placeholder="All countries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All countries</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="minPrice">Min price</Label>
          <Input
            id="minPrice"
            type="number"
            placeholder="0"
            defaultValue={searchParams.get("minPrice") ?? ""}
            onBlur={(e) => updateParams("minPrice", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="maxPrice">Max price</Label>
          <Input
            id="maxPrice"
            type="number"
            placeholder="5000"
            defaultValue={searchParams.get("maxPrice") ?? ""}
            onBlur={(e) => updateParams("maxPrice", e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="sort">Sort by</Label>
        <Select
          value={searchParams.get("sort") ?? "popular"}
          onValueChange={(v) => updateParams("sort", v)}
        >
          <SelectTrigger id="sort" className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Popularity</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </aside>
  );
}
