"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error("Failed to send message");
      } else {
        toast.success("Message sent! We'll get back to you soon.");
        form.reset();
      }
    } catch {
      toast.error("Something went wrong");
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-ink-900">Contact Us</h1>
      <p className="mt-2 text-ink-700">
        Have a question? We&apos;d love to hear from you.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Send a message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" required rows={5} className="mt-1" />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send message"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div>
            <h2 className="font-semibold text-ink-900">Office</h2>
            <p className="mt-2 text-ink-700">
              123 Travel Street<br />
              New York, NY 10001<br />
              United States
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-ink-900">Contact</h2>
            <p className="mt-2 text-ink-700">
              hello@ueb3tours.com<br />
              +1 (555) 123-4567
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-ink-900">Hours</h2>
            <p className="mt-2 text-ink-700">
              Mon–Fri: 9am – 6pm EST<br />
              Sat: 10am – 4pm EST
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
