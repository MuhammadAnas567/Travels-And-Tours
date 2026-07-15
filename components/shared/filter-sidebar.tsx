"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
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
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [mobileOpen, setMobileOpen] = useState(false);

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      params.delete("audience");
      router.push(`/tours?${params.toString()}`);
    },
    [router, searchParams]
  );

  function clearFilters() {
    router.push("/tours");
  }

  const filterBody = (
    <div className="space-y-5">
      <div>
        <Label
          htmlFor="category"
          className="text-xs font-semibold uppercase tracking-wider text-ink-500"
        >
          Category
        </Label>
        <Select
          value={searchParams.get("category") ?? ""}
          onValueChange={(v) => updateParams("category", v === "all" ? "" : v)}
        >
          <SelectTrigger id="category" className="mt-1.5 border-line">
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
        <Label
          htmlFor="country"
          className="text-xs font-semibold uppercase tracking-wider text-ink-500"
        >
          Country
        </Label>
        <Select
          value={searchParams.get("country") ?? ""}
          onValueChange={(v) => updateParams("country", v === "all" ? "" : v)}
        >
          <SelectTrigger id="country" className="mt-1.5 border-line">
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label
            htmlFor="minPrice"
            className="text-xs font-semibold uppercase tracking-wider text-ink-500"
          >
            Min price
          </Label>
          <Input
            id="minPrice"
            type="number"
            placeholder="0"
            defaultValue={searchParams.get("minPrice") ?? ""}
            onBlur={(e) => updateParams("minPrice", e.target.value)}
            className="mt-1.5 border-line"
          />
        </div>
        <div>
          <Label
            htmlFor="maxPrice"
            className="text-xs font-semibold uppercase tracking-wider text-ink-500"
          >
            Max price
          </Label>
          <Input
            id="maxPrice"
            type="number"
            placeholder="10000"
            defaultValue={searchParams.get("maxPrice") ?? ""}
            onBlur={(e) => updateParams("maxPrice", e.target.value)}
            className="mt-1.5 border-line"
          />
        </div>
      </div>

      <div>
        <Label
          htmlFor="sort"
          className="text-xs font-semibold uppercase tracking-wider text-ink-500"
        >
          Sort by
        </Label>
        <Select
          value={searchParams.get("sort") ?? "popular"}
          onValueChange={(v) => updateParams("sort", v)}
        >
          <SelectTrigger id="sort" className="mt-1.5 border-line">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <aside
      className="rounded-md border border-line bg-paper p-4 sm:p-6 shadow-sm h-fit lg:sticky lg:top-24"
      aria-label="Tour filters"
    >
      <div className="flex items-center justify-between gap-2 mb-0 lg:mb-6">
        <button
          type="button"
          className="flex min-h-11 flex-1 items-center justify-between gap-2 lg:pointer-events-none lg:cursor-default"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-controls="tour-filters"
        >
          <h2 className="flex items-center gap-2 font-display text-lg text-ink">
            <SlidersHorizontal className="h-4 w-4 text-brass-500" strokeWidth={1.5} />
            Filters
          </h2>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-ink-500 lg:hidden transition-transform",
              mobileOpen && "rotate-180"
            )}
            strokeWidth={1.5}
            aria-hidden
          />
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-ink-500 hidden sm:inline-flex"
        >
          Clear all
        </Button>
      </div>

      <div
        id="tour-filters"
        className={cn("mt-5 lg:mt-0", mobileOpen ? "block" : "hidden lg:block")}
      >
        {filterBody}
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="mt-4 w-full text-ink-500 sm:hidden"
        >
          Clear all filters
        </Button>
      </div>
    </aside>
  );
}
