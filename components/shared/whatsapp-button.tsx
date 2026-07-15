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
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-success text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <MessageCircle className="h-7 w-7" strokeWidth={1.5} />
    </a>
  );
}
