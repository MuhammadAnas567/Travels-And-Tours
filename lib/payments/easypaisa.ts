import { createHmac } from "crypto";

export type EasyPaisaInitiateInput = {
  bookingId: string;
  amount: number;
  currency?: string;
  description?: string;
};

function isSandbox() {
  return process.env.EASYPAISA_SANDBOX !== "false";
}

export function isEasyPaisaConfigured() {
  return !!(process.env.EASYPAISA_STORE_ID && process.env.EASYPAISA_HASH_KEY);
}

/** HMAC-SHA256 over sorted field values using merchant hash key. */
export function buildEasyPaisaHash(fields: Record<string, string>): string {
  const key = process.env.EASYPAISA_HASH_KEY ?? "";
  const sorted = Object.keys(fields)
    .filter((k) => fields[k] !== undefined && fields[k] !== "" && k !== "hash")
    .sort((a, b) => a.localeCompare(b));
  const message = sorted.map((k) => `${k}=${fields[k]}`).join("&");
  return createHmac("sha256", key).update(message).digest("hex");
}

export function verifyEasyPaisaHash(
  fields: Record<string, string>,
  hash: string
): boolean {
  if (!hash) return false;
  return buildEasyPaisaHash(fields) === hash.toLowerCase();
}

/**
 * Initiate EasyPaisa payment. Sandbox returns a local success simulator URL.
 */
export function initiateEasyPaisaPayment(input: EasyPaisaInitiateInput): {
  redirectUrl: string;
  sandbox: boolean;
  fields?: Record<string, string>;
} {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const amountStr = input.amount.toFixed(2);

  const fields: Record<string, string> = {
    storeId: process.env.EASYPAISA_STORE_ID ?? "",
    orderId: input.bookingId,
    transactionAmount: amountStr,
    transactionType: "MA",
    tokenExpiry: "20261231235959",
    bankIdentificationNumber: "",
    mobileAccountNo: "",
    emailAddress: "",
  };

  fields.hash = buildEasyPaisaHash(fields);

  if (isSandbox() || !isEasyPaisaConfigured()) {
    return {
      redirectUrl: `${appUrl}/api/payments/wallets/sandbox?provider=easypaisa&bookingId=${encodeURIComponent(input.bookingId)}&amount=${encodeURIComponent(amountStr)}`,
      sandbox: true,
      fields,
    };
  }

  const gateway = "https://easypay.easypaisa.com.pk/easypay/Index.jsf";
  const qs = new URLSearchParams(fields).toString();
  return {
    redirectUrl: `${gateway}?${qs}`,
    sandbox: false,
    fields,
  };
}
