import type { Metadata } from "next";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton, HotelCardSkeleton, FlightRowSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Logo } from "@/components/shared/logo";
import { StyleguideClient, ErrorStateDemo } from "./styleguide-client";

export const metadata: Metadata = {
  title: "UI Styleguide",
  robots: { index: false, follow: false },
};

const pine = [
  ["50", "#E8F2F0"],
  ["100", "#CFE4E0"],
  ["200", "#9EC9C1"],
  ["300", "#5FA89C"],
  ["400", "#2F7A70"],
  ["500", "#0A3D38"],
  ["600", "#083530"],
  ["700", "#062C28"],
  ["800", "#04231F"],
  ["900", "#031A17"],
];
const brass = [
  ["50", "#FAF6EB"],
  ["100", "#F3E9CC"],
  ["300", "#D4BC68"],
  ["500", "#C5A059"],
  ["600", "#A8863F"],
  ["900", "#45371A"],
];
const ink = [
  ["900", "#071E1B"],
  ["700", "#1A4540"],
  ["500", "#5A746F"],
  ["300", "#9AB0AB"],
  ["100", "#D8E4E1"],
];

function contrastRatio(hex: string, against: string) {
  const lum = (h: string) => {
    const c = h.replace("#", "");
    const r = parseInt(c.slice(0, 2), 16) / 255;
    const g = parseInt(c.slice(2, 4), 16) / 255;
    const b = parseInt(c.slice(4, 6), 16) / 255;
    const f = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const L1 = lum(hex);
  const L2 = lum(against);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
}

export default function StyleguidePage() {
  return (
    <div className="bg-sand min-h-screen">
      <div className="border-b border-line bg-paper">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-12">
          <p className="eyebrow">Arreat Travels & Tours · Logo system</p>
          <h1 className="mt-3 text-hero text-ink">Styleguide</h1>
          <p className="mt-4 text-ink-500 max-w-[65ch]">
            Emerald teal + metallic gold from the brand lockup. Kill switch is active — default
            Tailwind gray/blue utilities produce no CSS. Fraunces + Hanken Grotesk.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-16 space-y-20">
        <section>
          <h2 className="text-h2">Brand lockup</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-md border border-line bg-sand p-10 flex items-center justify-center">
              <Logo href={false} variant="stack" />
            </div>
            <div className="bg-sand-200 rounded-md p-10 flex items-center justify-center min-h-[200px]">
              <Logo href={false} variant="stack" />
            </div>
          </div>
          <p className="mt-4 text-sm text-ink-500 max-w-[65ch]">
            Brand plate: rounded square, teal field, mark above ARREAT / TRAVELS &amp; TOURS — no border.
          </p>
        </section>

        <section>
          <h2 className="text-h2">Color tokens</h2>
          <div className="mt-8 grid gap-10 lg:grid-cols-3">
            <div>
              <h3 className="font-display text-lg">Pine</h3>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {pine.map(([step, hex]) => (
                  <div key={step} className="text-center">
                    <div
                      className="h-14 rounded-sm border border-line"
                      style={{ background: hex }}
                      title={hex}
                    />
                    <p className="mt-1 text-xs tabular-nums text-ink-700">{step}</p>
                    <p className="text-[10px] tabular-nums text-ink-500">{hex}</p>
                    <p className="text-[10px] text-ink-500">w {contrastRatio(hex, "#FBF9F4")}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-display text-lg">Brass</h3>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {brass.map(([step, hex]) => (
                  <div key={step} className="text-center">
                    <div className="h-14 rounded-sm border border-line" style={{ background: hex }} />
                    <p className="mt-1 text-xs tabular-nums text-ink-700">{step}</p>
                    <p className="text-[10px] tabular-nums text-ink-500">{hex}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-display text-lg">Ink · Surfaces</h3>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {ink.map(([step, hex]) => (
                  <div key={step} className="text-center">
                    <div className="h-14 rounded-sm border border-line" style={{ background: hex }} />
                    <p className="mt-1 text-xs tabular-nums text-ink-700">{step}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {[
                  ["sand", "#F3EFE6"],
                  ["paper", "#FBF9F4"],
                  ["line", "#DDD7CC"],
                  ["success", "#3D6B4F"],
                  ["error", "#A33B2D"],
                  ["warning", "#A67A1F"],
                ].map(([name, hex]) => (
                  <div key={name} className="flex items-center gap-2">
                    <span className="h-8 w-8 rounded-sm border border-line" style={{ background: hex }} />
                    <span className="text-sm text-ink-700">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-h2">Type scale</h2>
          <div className="mt-6 space-y-4 rounded-md border border-line bg-paper p-8">
            <p className="eyebrow">Eyebrow · 11px / 0.15em</p>
            <p className="text-hero text-ink">Hero — Fraunces 56–72</p>
            <p className="text-h2 text-ink">Section heading — 32–40</p>
            <p className="text-base text-ink-700 max-w-[65ch]">
              Body — Hanken Grotesk 16 / 400 / 1.65. The Amalfi terrace at dusk, a table set for two.
            </p>
            <p className="text-caption">Caption / meta label</p>
            <p className="text-2xl font-semibold tabular-nums text-ink" data-price>
              $1,248.00
            </p>
            <div className="mt-4 space-y-1" data-flight-price>
              <p className="text-sm text-ink-500">Flight fare (strikethrough + buy)</p>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-medium tabular-nums text-ink-500 line-through decoration-ink-400">
                  PKR 98,400
                </p>
                <span className="rounded-sm border border-brass-200 bg-brass-50 px-2 py-0.5 text-xs font-semibold tabular-nums text-brass-700">
                  4% off
                </span>
              </div>
              <p className="text-2xl font-semibold tabular-nums text-ink">PKR 94,200</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-h2">Radius & elevation</h2>
          <div className="mt-6 flex flex-wrap gap-6">
            {[
              ["sm", "4px"],
              ["md", "8px"],
              ["lg", "12px"],
              ["full", "999px"],
            ].map(([name, px]) => (
              <div key={name} className="text-center">
                <div
                  className="h-16 w-24 border border-line bg-pine-50"
                  style={{ borderRadius: px === "999px" ? 999 : px }}
                />
                <p className="mt-2 text-sm text-ink-700">
                  {name} · {px}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            {(["sm", "md", "lg"] as const).map((s) => (
              <div
                key={s}
                className="h-20 w-40 rounded-md border border-line bg-paper"
                style={{ boxShadow: `var(--shadow-${s})` }}
              >
                <p className="p-3 text-sm text-ink-500">shadow-{s}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-h2">Button</h2>
          <StyleguideClient />
        </section>

        <section>
          <h2 className="text-h2">Input</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 max-w-3xl">
            <Input label="Default" placeholder="City or airport" helperText="Use IATA when you can" />
            <Input label="Error" error="Origin and destination can't match." defaultValue="DXB" />
            <Input label="Success" success defaultValue="KHI" />
            <Input label="Disabled" disabled defaultValue="Locked" />
            <Input label="Readonly" readOnly defaultValue="Readonly value" />
            <Input label="With icon" prefixIcon={<Search strokeWidth={1.5} />} placeholder="Search" />
          </div>
        </section>

        <section>
          <h2 className="text-h2">Badge</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="success">Confirmed</Badge>
            <Badge variant="warning">Pending</Badge>
            <Badge variant="error">Failed</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="promo">Best value</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </section>

        <section>
          <h2 className="text-h2">Card</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Content card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-ink-500">Hover for elevation (shadow-sm → shadow-md).</p>
              </CardContent>
            </Card>
            <HotelCardSkeleton />
            <div className="space-y-2">
              <FlightRowSkeleton />
              <FlightRowSkeleton />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-h2">Empty & error</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <EmptyState
              icon="plane"
              title="No flights match these filters"
              description="Try widening stops or searching ±3 days."
              actionLabel="Clear filters"
              actionHref="/flights"
            />
            <ErrorStateDemo />
          </div>
        </section>

        <section>
          <h2 className="text-h2">Kill switch proof</h2>
          <p className="mt-2 text-sm text-ink-500">
            Below: <code className="rounded-sm bg-surface-sunken px-1">bg-gray-100</code> must
            render with no gray background after the kill switch.
          </p>
          <div className="mt-4 flex gap-4">
            <div className="bg-gray-100 h-16 w-32 border border-dashed border-line flex items-center justify-center text-xs text-ink-500">
              bg-gray-100
            </div>
            <div className="bg-pine-50 h-16 w-32 border border-line flex items-center justify-center text-xs text-ink-700">
              bg-pine-50
            </div>
            <div className="bg-pine-500 h-16 w-32 border border-line flex items-center justify-center text-xs text-white">
              bg-pine-500
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-h2">Misc actions</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button>Search flights</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button loading>Confirming…</Button>
            <Skeleton className="h-11 w-40" />
          </div>
        </section>
      </div>
    </div>
  );
}
