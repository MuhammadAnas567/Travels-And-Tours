import type { Metadata } from "next";
import { Fraunces, DM_Sans, Noto_Nastaliq_Urdu } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { getPreferredLocale } from "@/lib/locale";
import "./globals.css";

const displayFont = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const bodyFont = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const urduFont = Noto_Nastaliq_Urdu({
  variable: "--font-urdu",
  subsets: ["arabic"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "UEB3 Tours — Pakistan's Premier Travel Partner",
    template: "%s | UEB3 Tours",
  },
  description:
    "Outbound tours for Pakistanis and inbound adventures across Hunza, Skardu & beyond. Visa assistance, local payments, trusted bookings.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getPreferredLocale();
  const isUrdu = locale === "ur";

  return (
    <html
      lang={locale}
      dir={isUrdu ? "rtl" : "ltr"}
      className={`${displayFont.variable} ${bodyFont.variable} ${urduFont.variable} h-full`}
    >
      <body
        className={`min-h-full flex flex-col antialiased bg-sand text-ink ${
          isUrdu ? "font-[family-name:var(--font-urdu)]" : ""
        }`}
      >
        <Providers>{children}</Providers>
        <WhatsAppButton />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
