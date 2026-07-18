"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerUser } from "@/actions/auth";
import { registerSchema } from "@/lib/validations";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const googleEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const raw = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim().toLowerCase(),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    };

    const parsed = registerSchema.safeParse(raw);
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
      const payload = new FormData();
      payload.set("name", parsed.data.name);
      payload.set("email", parsed.data.email);
      payload.set("password", parsed.data.password);
      payload.set("confirmPassword", parsed.data.confirmPassword);

      const result = await registerUser(payload);
      if (result?.error) {
        const err = result.error as Record<string, string[] | undefined>;
        const next: Record<string, string> = {};
        for (const [k, v] of Object.entries(err)) {
          if (v?.[0]) next[k] = v[0];
        }
        setFieldErrors(next);
        setFormError(err._form?.[0] ?? null);
        setLoading(false);
        return;
      }

      const signed = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });
      if (signed?.error) {
        setFormError("Account created — please sign in.");
        setLoading(false);
        router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        return;
      }
      router.replace(callbackUrl);
      router.refresh();
    } catch {
      setFormError("Could not create account. Try again in a moment.");
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
            autoComplete="name"
            placeholder="Your name"
            className="mt-1.5 h-12 bg-paper"
            aria-invalid={Boolean(fieldErrors.name)}
          />
          {fieldErrors.name ? (
            <p className="mt-1 text-sm text-ink-600">{fieldErrors.name}</p>
          ) : null}
        </div>
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
          />
          {fieldErrors.email ? (
            <p className="mt-1 text-sm text-ink-600">{fieldErrors.email}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            className="mt-1.5 h-12 bg-paper"
            aria-invalid={Boolean(fieldErrors.password)}
          />
          {fieldErrors.password ? (
            <p className="mt-1 text-sm text-ink-600">{fieldErrors.password}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat password"
            className="mt-1.5 h-12 bg-paper"
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
          />
          {fieldErrors.confirmPassword ? (
            <p className="mt-1 text-sm text-ink-600">{fieldErrors.confirmPassword}</p>
          ) : null}
        </div>
        {formError ? (
          <p className="text-sm text-ink-600" role="status">
            {formError}
          </p>
        ) : null}
        <Button type="submit" className="w-full h-12 text-base" aria-busy={loading}>
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
            onClick={() => signIn("google", { callbackUrl })}
          >
            Continue with Google
          </Button>
        </>
      ) : null}

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-semibold text-pine-600 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <AuthShell title="Create your account" subtitle="Loading…">
          <p className="text-sm text-ink-500">Preparing form…</p>
        </AuthShell>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
