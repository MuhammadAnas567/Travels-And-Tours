"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig, getWhatsAppUrl } from "@/lib/site-config";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const whatsappUrl = getWhatsAppUrl();

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
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        setFormError("Message did not send. Check your connection and try again.");
        toast.error("Failed to send message");
      } else {
        toast.success("Message sent — we will reply within one business day.");
        form.reset();
      }
    } catch {
      setFormError("Something went wrong. Try again in a moment.");
      toast.error("Something went wrong");
    }
    setLoading(false);
  }

  return (
    <div className="bg-sand">
      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <p className="eyebrow">Contact</p>
          <h1 className="mt-3 text-hero text-ink max-w-[12ch]">Talk to a planner</h1>
          <p className="mt-4 text-ink-500 max-w-md leading-relaxed">
            Questions about a route, a visa, or a custom stay — write us. We answer with specifics, not scripts.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 section-pad">
        <div className="grid gap-10 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Send a message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required className="mt-1" placeholder="Your full name" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required className="mt-1" placeholder="you@example.com" />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" name="subject" required className="mt-1" placeholder="Route, dates, or visa question" />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    className="mt-1"
                    placeholder="Tell us where you want to go and when"
                  />
                </div>
                {formError ? (
                  <p className="text-sm text-error" role="alert">
                    {formError}
                  </p>
                ) : null}
                <Button type="submit" loading={loading}>
                  Send message
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <div className="rounded-md border border-line bg-paper p-8">
              <p className="eyebrow">Office</p>
              <p className="mt-4 text-ink-700 leading-relaxed">{siteConfig.office.address}</p>
              <p className="mt-3 text-ink-700">
                {siteConfig.office.email}
                <br />
                {siteConfig.office.phone}
              </p>
            </div>
            <div className="rounded-md border border-line bg-paper p-8">
              <p className="eyebrow">Hours</p>
              <p className="mt-4 text-ink-700 leading-relaxed">{siteConfig.office.hours}</p>
            </div>
            {whatsappUrl ? (
              <div className="rounded-md border border-line bg-pine-500 p-8 text-paper">
                <p className="eyebrow text-brass-300">Prefer WhatsApp?</p>
                <p className="mt-3 text-paper/70 text-sm leading-relaxed">
                  Share your destination and travel window — we reply with a first outline.
                </p>
                <Button asChild className="mt-6" variant="primary">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    Open WhatsApp
                  </a>
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
