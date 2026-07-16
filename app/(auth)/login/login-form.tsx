"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { loginUser } from "@/actions/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const googleEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("callbackUrl", callbackUrl);
    try {
      const result = await loginUser(formData);
      if (result?.error) {
        const err = result.error as Record<string, string[] | undefined>;
        setError(err._form?.[0] ?? err.email?.[0] ?? err.password?.[0] ?? "Login failed");
        setLoading(false);
      }
    } catch {
      setError("Could not sign in. Check your connection and try again.");
      setLoading(false);
    }
  }

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
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="mt-1.5 h-12 bg-paper"
          />
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
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="mt-1.5 h-12 bg-paper"
          />
        </div>
        {error ? (
          <p className="rounded-sm border border-error/30 bg-error/5 px-3 py-2 text-sm text-error" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

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

      <div className="mt-6 rounded-md border border-pine-100 bg-pine-50/80 px-4 py-3 text-sm text-ink-700">
        <p className="font-semibold text-pine-800">Demo account</p>
        <p className="mt-1 tabular-nums">
          user@example.com · <span className="font-medium">user123</span>
        </p>
        <p className="mt-0.5 text-xs text-ink-500">
          Vercel pe DATABASE_URL = Atlas URI hona zaroori hai
        </p>
      </div>

      <p className="mt-6 text-center text-sm text-ink-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-pine-600 hover:underline">
          Sign up
        </Link>
      </p>
    </AuthShell>
  );
}
