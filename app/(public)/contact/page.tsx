"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CatalogHero } from "@/components/layout/catalog-hero";
import { siteConfig, getWhatsAppUrl } from "@/lib/site-config";

export default function ContactPage() {
  return (
    <Suspense fallback={<ContactFallback />}>
      <ContactPageInner />
    </Suspense>
  );
}

function ContactFallback() {
  return (
    <div className="bg-sand min-h-[50vh]">
      <CatalogHero
        variant="default"
        eyebrow="Contact"
        title="Talk to a planner"
        description="Questions about a route, a visa, or a custom stay — write us."
      />
    </div>
  );
}

function ContactPageInner() {
  const searchParams = useSearchParams();
  const [subject, setSubject] = useState(() => searchParams.get("subject") ?? "");
  const [message, setMessage] = useState(() => searchParams.get("message") ?? "");
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
      const payload = (await res.json().catch(() => ({}))) as {
        error?: string;
        delivered?: string;
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
          payload.delivered === "stored"
            ? "Inquiry saved — our team will follow up shortly."
            : "Message sent — we will reply within one business day."
        );
        form.reset();
        setSubject("");
        setMessage("");
      }
    } catch {
      setFormError("Something went wrong. Try again in a moment.");
      toast.error("Something went wrong");
    }
    setLoading(false);
  }

  return (
    <div className="bg-sand">
      <CatalogHero
        variant="default"
        eyebrow="Contact"
        title="Talk to a planner"
        description="Questions about a route, a visa, or a custom stay — write us. We answer with specifics, not scripts."
      />

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
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="mt-1"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    required
                    className="mt-1"
                    placeholder="Route, dates, or visa question"
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
                    className="mt-1"
                    placeholder="Tell us where you want to go and when"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
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
              <div className="rounded-md border border-line bg-pine-700 p-8 text-paper">
                <p className="eyebrow text-pine-100">Prefer WhatsApp?</p>
                <p className="mt-3 text-paper/75 text-sm leading-relaxed">
                  Share your destination and travel window — we reply with a first outline.
                </p>
                <Button asChild className="mt-6 bg-paper text-pine-700 hover:bg-pine-50">
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
