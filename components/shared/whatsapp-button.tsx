"use client";

import { siteConfig, getWhatsAppUrl } from "@/lib/site-config";
import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const url = getWhatsAppUrl();
  if (!url || !siteConfig.whatsapp.number) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-4 sm:right-6 z-40 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-success text-paper shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2 mb-16 lg:mb-0"
    >
      <MessageCircle className="h-7 w-7" strokeWidth={1.5} />
    </a>
  );
}
