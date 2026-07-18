export function ChargeCurrencyNotice({ className }: { className?: string }) {
  return (
    <p className={className ?? "text-xs text-ink-500 leading-relaxed"}>
      Display prices follow your currency preference (PKR / USD). Card payments via Stripe are
      charged in <strong className="font-semibold text-ink-700">USD</strong>. PKR amounts are
      estimates for comparison.
    </p>
  );
}
