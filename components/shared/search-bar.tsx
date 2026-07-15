"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SearchBar({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [travelers, setTravelers] = useState("2");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set("q", destination);
    if (date) params.set("date", date);
    if (travelers) params.set("travelers", travelers);
    router.push(`/tours?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSearch}
      className={cn(
        "flex flex-col gap-3 rounded-md p-2 shadow-md sm:flex-row sm:items-center border",
        dark
          ? "bg-ink border-paper/15"
          : "bg-paper p-4 border-line",
        className
      )}
      role="search"
      aria-label="Search tours"
    >
      <div className="flex-1 px-3 py-1">
        <label
          htmlFor="destination"
          className={cn(
            "mb-1 flex items-center gap-1 text-[0.6875rem] font-semibold tracking-[0.12em] uppercase",
            dark ? "text-paper/55" : "text-ink-500"
          )}
        >
          <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
          Destination
        </label>
        <Input
          id="destination"
          placeholder="Switzerland, Maldives, Japan..."
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className={cn(
            "border-0 bg-transparent shadow-none focus-visible:ring-0 px-0",
            dark && "text-paper placeholder:text-paper/40"
          )}
        />
      </div>
      <div className={cn("hidden sm:block w-px h-10", dark ? "bg-paper/15" : "bg-line")} />
      <div className="sm:w-40 px-3 py-1">
        <label
          htmlFor="date"
          className={cn(
            "mb-1 flex items-center gap-1 text-[0.6875rem] font-semibold tracking-[0.12em] uppercase",
            dark ? "text-paper/55" : "text-ink-500"
          )}
        >
          <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
          Date
        </label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={cn(
            "border-0 bg-transparent shadow-none focus-visible:ring-0 px-0",
            dark && "text-paper [color-scheme:dark]"
          )}
        />
      </div>
      <div className={cn("hidden sm:block w-px h-10", dark ? "bg-paper/15" : "bg-line")} />
      <div className="sm:w-28 px-3 py-1">
        <label
          htmlFor="travelers"
          className={cn(
            "mb-1 flex items-center gap-1 text-[0.6875rem] font-semibold tracking-[0.12em] uppercase",
            dark ? "text-paper/55" : "text-ink-500"
          )}
        >
          <Users className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
          Guests
        </label>
        <Input
          id="travelers"
          type="number"
          min={1}
          max={20}
          value={travelers}
          onChange={(e) => setTravelers(e.target.value)}
          className={cn("border-0 bg-transparent shadow-none focus-visible:ring-0 px-0", dark && "text-paper")}
        />
      </div>
      <Button type="submit" variant="primary" size="lg" className="sm:mx-1">
        <Search className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        Search tours
      </Button>
    </form>
  );
}
