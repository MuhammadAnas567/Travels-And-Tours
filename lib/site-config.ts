export const siteConfig = {
  name: "UEB3 Tours",
  tagline: "Travel abroad with confidence. Welcome the world to Pakistan.",
  whatsapp: {
    number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
    defaultMessage:
      process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ??
      "Hi! I'm interested in UEB3 Tours travel packages.",
    apiEnabled: !!process.env.WHATSAPP_API_TOKEN,
  },
  bankTransfer: {
    enabled: process.env.BANK_TRANSFER_ENABLED === "true",
    bankName: process.env.BANK_NAME ?? "HBL",
    accountTitle: process.env.BANK_ACCOUNT_TITLE ?? "UEB3 Tours Pvt Ltd",
    accountNumber: process.env.BANK_ACCOUNT_NUMBER ?? "",
    iban: process.env.BANK_IBAN ?? "",
  },
  easypaisa: {
    enabled: process.env.EASYPAISA_ENABLED === "true",
    accountNumber: process.env.EASYPAISA_ACCOUNT ?? "",
  },
  jazzcash: {
    enabled: process.env.JAZZCASH_ENABLED === "true",
    accountNumber: process.env.JAZZCASH_ACCOUNT ?? "",
  },
  trust: {
    dtsLicense: process.env.TRUST_DTS_LICENSE ?? "DTS-XXXX",
    iataNumber: process.env.TRUST_IATA_NUMBER ?? "",
    ptdcLicense: process.env.TRUST_PTDC_LICENSE ?? "",
  },
  office: {
    address: "Office 12, Blue Area, Islamabad, Pakistan",
    email: "hello@ueb3tours.com",
    phone: "+92 300 1234567",
    hours: "Mon–Sat, 10am–7pm PKT",
  },
} as const;

export function getWhatsAppUrl(message?: string) {
  const number = siteConfig.whatsapp.number.replace(/\D/g, "");
  if (!number) return null;
  const text = encodeURIComponent(message ?? siteConfig.whatsapp.defaultMessage);
  return `https://wa.me/${number}?text=${text}`;
}

export function getTourWhatsAppUrl(tourTitle: string, tourSlug: string) {
  return getWhatsAppUrl(
    `Hi! I'm interested in the tour "${tourTitle}" (${tourSlug}). Please share details and availability.`
  );
}
