import { ArrowRight } from "lucide-react";
import { getTourWhatsAppUrl, getWhatsAppUrl } from "@/lib/site-config";
import { Button } from "@/components/ui/button";

type WhatsAppInquiryButtonProps = {
  tourTitle: string;
  tourSlug: string;
  variant?: "default" | "outline" | "accent" | "secondary" | "ghost";
  className?: string;
};

export function WhatsAppInquiryButton({
  tourTitle,
  tourSlug,
  variant = "outline",
  className,
}: WhatsAppInquiryButtonProps) {
  const url = getTourWhatsAppUrl(tourTitle, tourSlug);
  if (!url) return null;

  return (
    <Button variant={variant} className={className} asChild>
      <a href={url} target="_blank" rel="noopener noreferrer">
        Inquire on WhatsApp
        <ArrowRight className="h-4 w-4" />
      </a>
    </Button>
  );
}

export function WhatsAppLink({
  message,
  children,
  className,
}: {
  message?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const url = getWhatsAppUrl(message);
  if (!url) return <>{children}</>;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}
