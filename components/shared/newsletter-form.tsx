"use client";

import { useState } from "react";
import { toast } from "sonner";
import { subscribeNewsletter } from "@/actions/reviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await subscribeNewsletter(email);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("You’re on the list — watch for the next fare drop.");
      setEmail("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-2">
      <Input
        type="email"
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className={
          dark
            ? "bg-white/10 border-white/20 text-white placeholder:text-white/40 h-11 rounded-xl"
            : "bg-surface h-11 rounded-xl"
        }
        aria-label="Email address for deal alerts"
      />
      <Button
        type="submit"
        disabled={loading}
        className={
          dark
            ? "h-11 rounded-xl bg-accent-500 hover:bg-accent-600 text-ink-900 font-semibold shrink-0"
            : "h-11 rounded-xl shrink-0"
        }
      >
        {loading ? "Saving…" : "Get deals"}
      </Button>
    </form>
  );
}
