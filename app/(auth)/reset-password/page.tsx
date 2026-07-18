"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/actions/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) {
      setError("This reset link is missing a token. Request a new one.");
      return;
    }
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await resetPassword(token, formData);
    setLoading(false);
    if (result && "error" in result && result.error) {
      setError(result.error);
      return;
    }
    router.replace("/login?reset=1");
  }

  return (
    <AuthShell title="Choose a new password" subtitle="Enter a new password for your account.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="mt-1.5 h-12 bg-paper"
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="mt-1.5 h-12 bg-paper"
          />
        </div>
        {error ? (
          <p className="text-sm text-ink-600" role="status">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full h-12" disabled={loading || !token}>
          {loading ? "Saving…" : "Update password"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm">
        <Link href="/forgot-password" className="font-semibold text-pine-600 hover:underline">
          Request a new link
        </Link>
      </p>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthShell title="Choose a new password" subtitle="Loading…">
          <p className="text-sm text-ink-500">Preparing form…</p>
        </AuthShell>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
