export const siteConfig = {
  name: "UEB3 Tours",
  tagline: "Curated international journeys for the discerning traveller.",
  supportSla: "We reply within 2 business hours (Mon–Sat, 10am–7pm PKT).",
  whatsapp: {
    number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
    defaultMessage:
      process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ??
      "Hi! I'm interested in UEB3 Tours international packages.",
    apiEnabled: !!process.env.WHATSAPP_API_TOKEN,
  },
  bankTransfer: {
    enabled:
      process.env.BANK_TRANSFER_ENABLED === "true" &&
      !!(process.env.BANK_ACCOUNT_NUMBER || process.env.BANK_IBAN),
    bankName: process.env.BANK_NAME ?? "HBL",
    accountTitle: process.env.BANK_ACCOUNT_TITLE ?? "UEB3 Tours Pvt Ltd",
    accountNumber: process.env.BANK_ACCOUNT_NUMBER ?? "",
    iban: process.env.BANK_IBAN ?? "",
  },
  easypaisa: {
    enabled:
      (!!process.env.EASYPAISA_STORE_ID && !!process.env.EASYPAISA_HASH_KEY) ||
      (process.env.EASYPAISA_ENABLED === "true" && !!process.env.EASYPAISA_ACCOUNT),
    accountNumber: process.env.EASYPAISA_ACCOUNT ?? "",
    storeId: process.env.EASYPAISA_STORE_ID ?? "",
    sandbox: process.env.EASYPAISA_SANDBOX !== "false",
  },
  jazzcash: {
    enabled:
      (!!process.env.JAZZCASH_MERCHANT_ID && !!process.env.JAZZCASH_PASSWORD) ||
      (process.env.JAZZCASH_ENABLED === "true" && !!process.env.JAZZCASH_ACCOUNT),
    accountNumber: process.env.JAZZCASH_ACCOUNT ?? "",
    merchantId: process.env.JAZZCASH_MERCHANT_ID ?? "",
    sandbox: process.env.JAZZCASH_SANDBOX !== "false",
  },
  trust: {
    dtsLicense: sanitizeLicense(process.env.TRUST_DTS_LICENSE),
    iataNumber: sanitizeLicense(process.env.TRUST_IATA_NUMBER),
    ptdcLicense: sanitizeLicense(process.env.TRUST_PTDC_LICENSE),
  },
  office: {
    address: process.env.OFFICE_ADDRESS ?? "Office 12, Blue Area, Islamabad, Pakistan",
    email: process.env.CONTACT_EMAIL ?? "hello@ueb3tours.com",
    phone: process.env.OFFICE_PHONE ?? "+92 300 1234567",
    hours: "Mon–Sat, 10am–7pm PKT",
  },
} as const;

function sanitizeLicense(value?: string | null) {
  if (!value?.trim()) return "";
  const v = value.trim();
  if (/xxxx/i.test(v) || /^DTS-?X+$/i.test(v) || /^IATA-?X+$/i.test(v)) return "";
  return v;
}

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
