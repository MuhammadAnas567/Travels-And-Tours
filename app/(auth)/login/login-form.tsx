"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  assertCredentialsLogin,
  resendSignupOtp,
  verifySignupOtp,
} from "@/actions/auth";
import { loginSchema } from "@/lib/validations";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { safeCallbackUrl } from "@/lib/safe-callback-url";

const googleEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"), "/dashboard");
  const resetOk = searchParams.get("reset") === "1";
  const registeredOk = searchParams.get("registered") === "1";
  const verifiedOk = searchParams.get("verified") === "1";
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(
    verifiedOk
      ? "Email verified. Sign in with your password."
      : registeredOk
        ? "Account created. Sign in with your email and password."
        : resetOk
          ? "Password updated. Sign in with your new password."
          : null
  );
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [otpMessage, setOtpMessage] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    void fetch("/api/auth/warm", { signal: ctrl.signal, cache: "no-store" }).catch(
      () => {}
    );
    return () => ctrl.abort();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const raw = {
      email: String(formData.get("email") ?? "").trim().toLowerCase(),
      password: String(formData.get("password") ?? ""),
    };

    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "_form");
        if (!next[key]) next[key] = issue.message;
      }
      setFieldErrors(next);
      setLoading(false);
      return;
    }

    try {
      const gatePayload = new FormData();
      gatePayload.set("email", parsed.data.email);
      gatePayload.set("password", parsed.data.password);
      const gate = await assertCredentialsLogin(gatePayload);

      if (
        gate &&
        "error" in gate &&
        gate.error &&
        !("needsVerification" in gate && gate.needsVerification)
      ) {
        const err = gate.error as Record<string, string[] | undefined>;
        const next: Record<string, string> = {};
        for (const [k, v] of Object.entries(err)) {
          if (v?.[0]) next[k] = v[0];
        }
        setFieldErrors(next);
        setError(err._form?.[0] ?? "Email or password is incorrect.");
        setLoading(false);
        return;
      }

      if (gate && "needsVerification" in gate && gate.needsVerification && gate.email) {
        setPendingEmail(gate.email);
        setOtpMessage(`Enter the code sent to ${gate.email}, or request a new one.`);
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email or password is incorrect. Check your details and try again.");
        setLoading(false);
        return;
      }

      window.location.assign(callbackUrl);
    } catch {
      setError("Could not sign in. Check your connection and try again.");
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pendingEmail) return;
    setLoading(true);
    setError(null);
    const payload = new FormData();
    payload.set("email", pendingEmail);
    payload.set("otp", otp);
    const result = await verifySignupOtp(payload);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setPendingEmail(null);
    setError("Email verified. Enter your password and sign in.");
    setLoading(false);
  }

  async function handleResend() {
    if (!pendingEmail) return;
    setLoading(true);
    const payload = new FormData();
    payload.set("email", pendingEmail);
    const result = await resendSignupOtp(payload);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setOtpMessage(`A new code was sent to ${pendingEmail}.`);
  }

  const registerHref = `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  if (pendingEmail) {
    return (
      <AuthShell
        title="Verify your email"
        subtitle={`Finish signing in for ${pendingEmail}.`}
      >
        <form onSubmit={handleVerifyOtp} className="space-y-4" noValidate>
          {otpMessage ? (
            <p className="text-sm text-pine-700" role="status">
              {otpMessage}
            </p>
          ) : null}
          <div>
            <Label htmlFor="otp">Verification code</Label>
            <Input
              id="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit code"
              className="mt-1.5 h-12 bg-paper tracking-[0.35em] tabular-nums"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </div>
          {error ? (
            <p className="text-sm text-ink-600" role="status">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="min-h-12 w-full text-base" aria-busy={loading}>
            {loading ? "Verifying…" : "Verify email"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 bg-paper"
            disabled={loading}
            onClick={handleResend}
          >
            Resend code
          </Button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage bookings and trip plans."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="mt-1.5 h-12 bg-paper"
            aria-invalid={Boolean(fieldErrors.email)}
            onChange={() => {
              if (error) setError(null);
              if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: "" }));
            }}
          />
          {fieldErrors.email ? (
            <p className="mt-1 text-sm text-ink-600" role="status">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>
        <div>
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-pine-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            className="mt-1.5 h-12 bg-paper"
            aria-invalid={Boolean(fieldErrors.password)}
            onChange={() => {
              if (error) setError(null);
              if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: "" }));
            }}
          />
          {fieldErrors.password ? (
            <p className="mt-1 text-sm text-ink-600" role="status">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>
        {error ? (
          <p
            className={`text-sm ${
              (registeredOk || resetOk || verifiedOk) &&
              !error.toLowerCase().includes("incorrect")
                ? "text-pine-700"
                : "text-ink-600"
            }`}
            role="status"
            aria-live="polite"
          >
            {error}
          </p>
        ) : null}
        <Button type="submit" className="min-h-12 w-full text-base" aria-busy={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-4 rounded-md border border-line bg-paper px-3 py-2 text-xs text-ink-500">
        Demo: <span className="font-medium text-ink-700">user@example.com</span> /{" "}
        <span className="font-medium text-ink-700">user123</span>
      </p>

      {googleEnabled ? (
        <>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-sand px-3 text-ink-500">or</span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 bg-paper"
            onClick={() => signIn("google", { callbackUrl })}
          >
            Continue with Google
          </Button>
        </>
      ) : null}

      <p className="mt-6 text-center text-sm text-ink-500">
        Don&apos;t have an account?{" "}
        <Link href={registerHref} className="font-semibold text-pine-600 hover:underline">
          Sign up
        </Link>
      </p>
    </AuthShell>
  );
}
