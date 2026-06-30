import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  imageClassName?: string;
  showText?: boolean;
  href?: string;
};

export function Logo({
  className,
  imageClassName,
  showText = false,
  href = "/",
}: LogoProps) {
  const content = (
    <>
      <Image
        src="/ueb3-logo.png"
        alt="UEB3 Tours"
        width={140}
        height={40}
        className={cn("h-8 w-auto object-contain sm:h-9", imageClassName)}
        priority
      />
      {showText && (
        <span className="sr-only">UEB3 Tours</span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn("inline-flex shrink-0 items-center", className)}>
        {content}
      </Link>
    );
  }

  return <div className={cn("inline-flex items-center", className)}>{content}</div>;
}
