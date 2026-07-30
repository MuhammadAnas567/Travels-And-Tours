"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CatalogHero } from "@/components/layout/catalog-hero";
import { siteConfig } from "@/lib/site-config";

type SectionContactPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  /** Prefills subject so inbox can tell which section the lead came from */
  defaultSubject: string;
  /** Stored on QuoteRequest.kind in MongoDB */
  kind?: string;
  heroVariant?:
    | "default"
    | "flights"
    | "hotels"
    | "tours"
    | "packages"
    | "cars"
    | "deals"
    | "blog"
    | "visa"
    | "plan";
};

/**
 * Temporary section shell: inquiry form only.
 * Original catalogue UI is preserved in each route’s `page.legacy.tsx`.
 */
export function SectionContactPage({
  eyebrow,
  title,
  description,
  defaultSubject,
  kind,
  heroVariant = "default",
}: SectionContactPageProps) {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [subject, setSubject] = useState(defaultSubject);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setLoading(true);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, kind }),
      });
      const payload = (await res.json().catch(() => ({}))) as {
        error?: string;
        delivered?: string;
        saved?: boolean;
        mailto?: string;
      };
      if (!res.ok) {
        const msg =
          typeof payload.error === "string"
            ? payload.error
            : "Message did not send. Check your connection and try again.";
        setFormError(msg);
        toast.error(msg);
        if (payload.mailto) {
          window.setTimeout(() => {
            window.location.href = payload.mailto!;
          }, 600);
        }
      } else {
        toast.success(
          payload.saved
            ? "Inquiry saved — our team will follow up shortly."
            : "Message sent — we will reply within one business day."
        );
        form.reset();
        setSubject(defaultSubject);
      }
    } catch {
      setFormError("Something went wrong. Try again in a moment.");
      toast.error("Something went wrong");
    }
    setLoading(false);
  }

  return (
    <div className="bg-sand min-h-[60vh]">
      <CatalogHero
        variant={heroVariant}
        eyebrow={eyebrow}
        title={title}
        description={description}
      />

      <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 section-pad">
        <div className="rounded-md border border-line bg-paper p-6 shadow-sm sm:p-8">
          <h2 className="font-display text-xl font-semibold text-ink-900">Send an inquiry</h2>
          <p className="mt-2 text-sm text-ink-500">
            Fill the form and we will reply to you at{" "}
            <span className="font-medium text-ink-700">{siteConfig.office.email}</span>.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required className="mt-1.5 h-12" placeholder="Your full name" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1.5 h-12"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                required
                className="mt-1.5 h-12"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                required
                rows={5}
                className="mt-1.5"
                placeholder="Tell us what you need — dates, destination, travellers…"
              />
            </div>
            {formError ? (
              <p className="text-sm text-ink-600" role="status">
                {formError}
              </p>
            ) : null}
            <Button type="submit" loading={loading} className="min-h-12 w-full">
              Send inquiry
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
