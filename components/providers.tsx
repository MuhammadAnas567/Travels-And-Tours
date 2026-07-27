"use client";

import { SessionProvider } from "next-auth/react";
import { PreferencesProvider } from "@/components/providers/preferences-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      basePath="/api/auth"
      refetchOnWindowFocus={false}
      refetchInterval={0}
      refetchWhenOffline={false}
    >
      <PreferencesProvider>{children}</PreferencesProvider>
    </SessionProvider>
  );
}
