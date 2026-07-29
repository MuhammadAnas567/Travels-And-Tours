import { createHash, randomInt } from "crypto";

const OTP_TTL_MS = 15 * 60 * 1000;

/** 6-digit numeric OTP for email verification. */
export function generateSignupOtp(): string {
  return String(randomInt(100000, 1000000));
}

export function hashSignupOtp(otp: string): string {
  return createHash("sha256").update(otp.trim()).digest("hex");
}

export function signupOtpExpiry(): Date {
  return new Date(Date.now() + OTP_TTL_MS);
}

export const SIGNUP_OTP_TTL_MINUTES = 15;
