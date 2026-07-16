import { Search, Scale, CreditCard, Plane } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search",
    text: "Name a city or route — flights, hotels, or a composed package.",
  },
  {
    icon: Scale,
    title: "Compare",
    text: "Filter by price, stops, and cancellation until the shortlist is yours.",
  },
  {
    icon: CreditCard,
    title: "Book",
    text: "Pay securely. Most stays include a free-cancellation window.",
  },
  {
    icon: Plane,
    title: "Travel",
    text: "Manage the trip from your dashboard — support stays on call.",
  },
];

export function HowItWorks() {
  return (
    <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, i) => (
        <li key={step.title} className="relative border-t border-line pt-6">
          <p className="eyebrow text-pine-500">Step {String(i + 1).padStart(2, "0")}</p>
          <div className="mt-4 flex h-11 w-11 items-center justify-center rounded-sm border border-pine-200 bg-pine-50 text-pine-500">
            <step.icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
          </div>
          <h3 className="mt-5 font-display text-xl font-semibold text-ink">{step.title}</h3>
          <p className="mt-2 text-sm text-ink-500 leading-relaxed max-w-[28ch]">{step.text}</p>
        </li>
      ))}
    </ol>
  );
}
