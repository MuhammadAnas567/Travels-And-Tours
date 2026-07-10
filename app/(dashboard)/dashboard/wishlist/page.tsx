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
      <h1 className="text-2xl font-bold text-ink-900">Wishlist</h1>
      <p className="mt-1 text-ink-500">Stays and trips you’ve saved for later</p>

      <div className="mt-10 rounded-2xl border border-line bg-surface p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-500">
          <Heart className="h-7 w-7" aria-hidden />
        </div>
        <h2 className="mt-4 font-heading text-lg font-bold text-ink-900">
          No saved stays yet
        </h2>
        <p className="mt-2 max-w-sm mx-auto text-sm text-ink-500">
          Tap the heart on a hotel to save it here. Your shortlist stays private to your account.
        </p>
        <Button asChild className="mt-6 rounded-xl bg-primary-500 hover:bg-primary-700">
          <Link href="/hotels">Browse hotels</Link>
        </Button>
      </div>
    </div>
  );
}
