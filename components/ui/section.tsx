import { cn } from "@/lib/utils";

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  background?: "default" | "sand" | "surface" | "ink";
};

export function Section({
  children,
  className,
  id,
  background = "default",
}: SectionProps) {
  const bgMap = {
    default: "bg-background",
    sand: "bg-sand",
    surface: "bg-surface",
    ink: "bg-ink text-sand",
  };

  return (
    <section id={id} className={cn("py-16 md:py-24", bgMap[background], className)}>
      {children}
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-10 max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && <p className="text-caption mb-2">{eyebrow}</p>}
      <h2 className="text-h2 font-display font-medium text-ink">{title}</h2>
      {description && (
        <p className="mt-3 text-muted leading-relaxed">{description}</p>
      )}
    </div>
  );
}

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}
