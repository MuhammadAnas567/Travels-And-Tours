"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { loginSchema } from "@/lib/validations";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const googleEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const resetOk = searchParams.get("reset") === "1";
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(
    resetOk ? "Password updated. Sign in with your new password." : null
  );
  const [loading, setLoading] = useState(false);

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

      router.replace(callbackUrl);
      router.refresh();
    } catch {
      setError("Could not sign in. Check your connection and try again.");
      setLoading(false);
    }
  }

  const registerHref = `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage bookings, wishlist, and trip plans."
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
            className={`text-sm ${resetOk && !error.includes("incorrect") ? "text-pine-700" : "text-ink-600"}`}
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
