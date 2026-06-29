"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchBar({ className = "" }: { className?: string }) {
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
      className={`flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-xl sm:flex-row sm:items-end ${className}`}
      role="search"
      aria-label="Search tours"
    >
      <div className="flex-1">
        <label htmlFor="destination" className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          Destination
        </label>
        <Input
          id="destination"
          placeholder="Where do you want to go?"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
      </div>
      <div className="sm:w-40">
        <label htmlFor="date" className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
          <Calendar className="h-3.5 w-3.5" aria-hidden />
          Date
        </label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className="sm:w-28">
        <label htmlFor="travelers" className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
          <Users className="h-3.5 w-3.5" aria-hidden />
          Travelers
        </label>
        <Input
          id="travelers"
          type="number"
          min={1}
          max={20}
          value={travelers}
          onChange={(e) => setTravelers(e.target.value)}
        />
      </div>
      <Button type="submit" size="lg" className="sm:mb-0">
        <Search className="h-4 w-4" aria-hidden />
        Search
      </Button>
    </form>
  );
}
