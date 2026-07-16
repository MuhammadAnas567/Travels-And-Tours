"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { registerUser } from "@/actions/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const googleEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export default function RegisterPage() {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setFormError(null);
    const formData = new FormData(e.currentTarget);
    try {
      const result = await registerUser(formData);
      if (result?.error) {
        const err = result.error as Record<string, string[]>;
        setErrors(err);
        setFormError(err._form?.[0] ?? null);
        setLoading(false);
      }
    } catch {
      setFormError(
        "Could not create account. The live database may not be configured yet — try again shortly."
      );
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Save stays, track bookings, and pick up where you left off."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            name="name"
            required
            autoComplete="name"
            placeholder="Your name"
            className="mt-1.5 h-12 bg-paper"
          />
          {errors.name ? <p className="mt-1 text-sm text-error">{errors.name[0]}</p> : null}
        </div>
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
          {errors.email ? <p className="mt-1 text-sm text-error">{errors.email[0]}</p> : null}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="mt-1.5 h-12 bg-paper"
          />
          {errors.password ? (
            <p className="mt-1 text-sm text-error">{errors.password[0]}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Repeat password"
            className="mt-1.5 h-12 bg-paper"
          />
          {errors.confirmPassword ? (
            <p className="mt-1 text-sm text-error">{errors.confirmPassword[0]}</p>
          ) : null}
        </div>
        {formError ? (
          <p className="rounded-sm border border-error/30 bg-error/5 px-3 py-2 text-sm text-error" role="alert">
            {formError}
          </p>
        ) : null}
        <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
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
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            Continue with Google
          </Button>
        </>
      ) : null}

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-pine-600 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
