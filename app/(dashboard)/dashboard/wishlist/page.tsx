import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Saved hotels and trips on UEB3 Travel.",
};

export default function WishlistPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-900">
        Wishlist
      </h1>
      <p className="mt-1 text-ink-500">
        Stays and trips you’ve saved for later
      </p>

      <div className="mt-10 rounded-md border border-line bg-sand/40 p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-sm bg-brass-50 text-brass-600">
          <Heart className="size-5" strokeWidth={1.5} aria-hidden />
        </div>
        <h2 className="mt-4 font-heading text-lg font-semibold text-ink-900">
          No saved stays yet
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500">
          Tap the heart on a hotel to save it here. Your shortlist stays private
          to your account.
        </p>
        <Button asChild className="mt-6">
          <Link href="/hotels">Browse hotels</Link>
        </Button>
      </div>
    </div>
  );
}
