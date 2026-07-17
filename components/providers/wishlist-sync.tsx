"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { syncWishlistToServer } from "@/actions/wishlist";
import { readWishlist, replaceWishlist, WISHLIST_EVENT } from "@/lib/wishlist";
import { saveWishlistToServer } from "@/actions/wishlist";

/** Merges local wishlist into the account on login; keeps server in sync on changes. */
export function WishlistSync() {
  const { status } = useSession();
  const synced = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") {
      synced.current = false;
      return;
    }
    if (synced.current) return;
    synced.current = true;

    void (async () => {
      const local = readWishlist();
      const result = await syncWishlistToServer(local);
      if (result && "items" in result && result.items) {
        replaceWishlist(result.items);
      }
    })();
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const onChange = () => {
      void saveWishlistToServer(readWishlist());
    };
    window.addEventListener(WISHLIST_EVENT, onChange);
    return () => window.removeEventListener(WISHLIST_EVENT, onChange);
  }, [status]);

  return null;
}
