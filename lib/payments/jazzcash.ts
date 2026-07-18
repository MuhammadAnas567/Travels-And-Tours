import { createHmac } from "crypto";

export type JazzCashInitiateInput = {
  bookingId: string;
  amount: number;
  currency?: string;
  description?: string;
};

function isSandbox() {
  return process.env.JAZZCASH_SANDBOX !== "false";
}

export function isJazzCashConfigured() {
  return !!(
    process.env.JAZZCASH_MERCHANT_ID &&
    process.env.JAZZCASH_PASSWORD &&
    process.env.JAZZCASH_INTEGRITY_SALT
  );
}

/** Sorted key=value pairs hashed with integrity salt (JazzCash-style). */
export function buildJazzCashHash(fields: Record<string, string>): string {
  const salt = process.env.JAZZCASH_INTEGRITY_SALT ?? "";
  const sorted = Object.keys(fields)
    .filter((k) => fields[k] !== undefined && fields[k] !== "" && k !== "pp_SecureHash")
    .sort((a, b) => a.localeCompare(b));
  const message = sorted.map((k) => fields[k]).join("&");
  return createHmac("sha256", salt).update(message).digest("hex").toUpperCase();
}

export function verifyJazzCashHash(
  fields: Record<string, string>,
  hash: string
): boolean {
  if (!hash) return false;
  const expected = buildJazzCashHash(fields);
  return expected === hash.toUpperCase();
}

/**
 * Initiate JazzCash payment. In sandbox mode returns a local redirect URL
 * that simulates a successful wallet callback.
 */
export function initiateJazzCashPayment(input: JazzCashInitiateInput): {
  redirectUrl: string;
  sandbox: boolean;
  fields?: Record<string, string>;
} {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const amountStr = input.amount.toFixed(2);

  const fields: Record<string, string> = {
    pp_Version: "1.1",
    pp_TxnType: "MWALLET",
    pp_MerchantID: process.env.JAZZCASH_MERCHANT_ID ?? "",
    pp_Password: process.env.JAZZCASH_PASSWORD ?? "",
    pp_Amount: String(Math.round(input.amount * 100)),
    pp_TxnCurrency: input.currency ?? "PKR",
    pp_TxnRefNo: `JC${input.bookingId.slice(-12)}`,
    pp_Description: (input.description ?? "UEB3 booking").slice(0, 100),
    pp_BillReference: input.bookingId,
    pp_ReturnURL: `${appUrl}/api/payments/wallets/sandbox?provider=jazzcash&bookingId=${input.bookingId}`,
  };

  fields.pp_SecureHash = buildJazzCashHash(fields);

  if (isSandbox() || !isJazzCashConfigured()) {
    return {
      redirectUrl: `${appUrl}/api/payments/wallets/sandbox?provider=jazzcash&bookingId=${encodeURIComponent(input.bookingId)}&amount=${encodeURIComponent(amountStr)}`,
      sandbox: true,
      fields,
    };
  }

  // Production gateway URL would be used when sandbox is off and merchant is live.
  const gateway =
    "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform";
  const qs = new URLSearchParams(fields).toString();
  return {
    redirectUrl: `${gateway}?${qs}`,
    sandbox: false,
    fields,
  };
}
