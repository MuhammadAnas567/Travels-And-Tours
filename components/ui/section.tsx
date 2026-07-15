import { cn } from "@/lib/utils";

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  background?: "default" | "sand" | "paper" | "surface" | "ink" | "pine" | "midnight";
};

export function Section({
  children,
  className,
  id,
  background = "default",
}: SectionProps) {
  const bgMap = {
    default: "bg-sand",
    sand: "bg-sand",
    paper: "bg-paper",
    surface: "bg-paper",
    ink: "bg-ink text-sand",
    pine: "bg-pine-500 text-paper",
    midnight: "bg-ink text-paper",
  };

  return (
    <section id={id} className={cn("section-pad", bgMap[background], className)}>
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
        "mb-12 max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="text-h2 text-ink">{title}</h2>
      {description && (
        <p className="mt-4 text-ink-500 leading-relaxed max-w-[65ch]">{description}</p>
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
    <div className={cn("mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}
