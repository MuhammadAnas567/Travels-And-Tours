import { Search, Scale, CreditCard, Plane } from "lucide-react";

const steps = [
  {
    n: "01",
    icon: Search,
    title: "Search",
    text: "Tell us where you’re going — flights, hotels, or a full package.",
  },
  {
    n: "02",
    icon: Scale,
    title: "Compare",
    text: "Filter by price, stops, and cancellation so the shortlist is yours.",
  },
  {
    n: "03",
    icon: CreditCard,
    title: "Book",
    text: "Pay securely. Most hotel stays include free cancellation windows.",
  },
  {
    n: "04",
    icon: Plane,
    title: "Travel",
    text: "Manage the trip from your dashboard — support is on call 24/7.",
  },
];

export function HowItWorks() {
  return (
    <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step) => (
        <li key={step.n} className="relative">
          <p className="font-heading text-4xl font-bold text-primary-300">{step.n}</p>
          <div className="mt-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-500 text-white">
            <step.icon className="h-5 w-5" aria-hidden />
          </div>
          <h3 className="mt-4 font-heading text-lg font-bold text-ink-900">{step.title}</h3>
          <p className="mt-1 text-sm text-ink-500 leading-relaxed">{step.text}</p>
        </li>
      ))}
    </ol>
  );
}
