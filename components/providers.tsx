"use client";

import { SessionProvider } from "next-auth/react";
import { PreferencesProvider } from "@/components/providers/preferences-provider";
import { WishlistSync } from "@/components/providers/wishlist-sync";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PreferencesProvider>
        <WishlistSync />
        {children}
      </PreferencesProvider>
    </SessionProvider>
  );
}
