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
      toast.success("Subscribed successfully!");
      setEmail("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
      <Input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className={dark ? "bg-ink/50 border-sand/20 text-sand" : "bg-surface"}
        aria-label="Email address"
      />
      <Button type="submit" variant={dark ? "accent" : "secondary"} disabled={loading}>
        Subscribe
      </Button>
    </form>
  );
}
