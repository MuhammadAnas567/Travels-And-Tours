"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { subscribeNewsletter } from "@/actions/reviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Mount after hydration so password-manager extensions (LastPass, etc.)
 * cannot inject nodes into the email field before React hydrates.
 */
export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await subscribeNewsletter(email);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("You're on the list — watch for the next fare drop.");
      setEmail("");
    }
  }

  const inputClass = dark
    ? "bg-white/10 border-white/20 text-white placeholder:text-white/40 h-11 rounded-md"
    : "bg-surface h-11 rounded-md";

  const buttonClass = dark
    ? "h-11 rounded-full bg-paper text-pine-700 hover:bg-pine-50 font-semibold shrink-0"
    : "h-11 rounded-full shrink-0";

  if (!ready) {
    return (
      <div
        className="mt-4 flex flex-col sm:flex-row gap-2"
        aria-hidden
      >
        <div
          className={cn(
            "h-11 w-full flex-1 rounded-md border border-transparent",
            dark ? "bg-white/10" : "bg-surface"
          )}
        />
        <div
          className={cn(
            "h-11 w-full sm:w-28 shrink-0 rounded-full",
            dark ? "bg-paper/80" : "bg-pine-500/40"
          )}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-2">
      <Input
        type="email"
        name="newsletter-email"
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
        data-lpignore="true"
        data-1p-ignore="true"
        data-form-type="other"
        className={inputClass}
        aria-label="Email address for deal alerts"
      />
      <Button type="submit" disabled={loading} className={buttonClass}>
        {loading ? "Saving…" : "Get deals"}
      </Button>
    </form>
  );
}
