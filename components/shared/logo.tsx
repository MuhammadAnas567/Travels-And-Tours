import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

type LogoProps = {
  className?: string;
  imageClassName?: string;
  showText?: boolean;
  href?: string | false;
  variant?: "stack" | "mark" | "compact" | "full";
  onDark?: boolean;
};

/**
 * Official Arreat lockup — square plate, rounded corners (not circle),
 * mark above wordmark on teal. No border.
 */
export function Logo({
  className,
  imageClassName,
  href = "/",
  variant = "stack",
}: LogoProps) {
  const isMark = variant === "mark";
  const isCompact = variant === "compact" || variant === "full";

  // 1:1 square like the brand file
  const size = isMark
    ? { w: 56, h: 56, className: "h-12 w-12 sm:h-14 sm:w-14" }
    : isCompact
      ? { w: 72, h: 72, className: "h-14 w-14 sm:h-16 sm:w-16" }
      : { w: 168, h: 168, className: "h-36 w-36 sm:h-40 sm:w-40" };

  const content = (
    <Image
      src="/arreat-logo-square.png"
      alt={siteConfig.name}
      width={size.w}
      height={size.h}
      priority
      className={cn(
        // Rounded square — matches brand plate, not a circle
        "block aspect-square border-0 object-cover object-center shadow-none outline-none ring-0",
        "rounded-[22%]",
        size.className,
        imageClassName
      )}
    />
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "inline-flex shrink-0 items-center border-0 p-0 shadow-none outline-none ring-0",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 focus-visible:ring-offset-2",
          className
        )}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={cn("inline-flex shrink-0 items-center border-0 p-0 shadow-none", className)}>
      {content}
    </div>
  );
}
