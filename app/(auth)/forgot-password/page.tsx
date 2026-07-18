"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/actions/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await requestPasswordReset(formData);
    setMessage(result.message ?? result.error ?? "Something went wrong");
    setLoading(false);
  }

  return (
    <AuthShell
      title="Reset password"
      subtitle="Enter your email and we’ll send a reset link when email is configured."
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
        {message ? (
          <p className="rounded-sm border border-pine-100 bg-pine-50 px-3 py-2 text-sm text-ink-700">
            {message}
          </p>
        ) : null}
        <Button type="submit" className="w-full h-12" disabled={loading}>
          {loading ? "Sending…" : "Send reset link"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="font-semibold text-pine-600 hover:underline">
          ← Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
