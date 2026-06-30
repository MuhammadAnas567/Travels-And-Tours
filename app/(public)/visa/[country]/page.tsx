import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, FileText } from "lucide-react";
import { getVisaBySlug } from "@/lib/visa";
import { getSession } from "@/lib/auth";
import { Container, Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { VisaInquiryForm } from "@/components/shared/visa-inquiry-form";
import { formatCurrency } from "@/lib/currency";

type Props = { params: Promise<{ country: string }> };

export async function generateMetadata({ params }: Props) {
  const { country } = await params;
  const visa = await getVisaBySlug(country);
  if (!visa) return { title: "Visa Not Found" };
  return {
    title: `${visa.country} Visa for Pakistanis`,
    description: visa.requirements.slice(0, 160),
  };
}

export default async function VisaDetailPage({ params }: Props) {
  const { country: slug } = await params;
  const [visa, session] = await Promise.all([
    getVisaBySlug(slug),
    getSession(),
  ]);

  if (!visa) notFound();

  return (
    <Section>
      <Container>
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{visa.flagEmoji ?? "🌍"}</span>
              <div>
                <p className="text-caption">Visa Assistance</p>
                <h1 className="text-h2 font-display font-medium text-ink">
                  {visa.country} — {visa.visaType}
                </h1>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3.5 w-3.5" /> {visa.processingTime}
              </Badge>
              <Badge variant="outline">
                Gov fee: {formatCurrency(visa.govFee, "PKR")}
              </Badge>
              <Badge variant="accent">
                Our service: {formatCurrency(visa.serviceFee, "PKR")}
              </Badge>
            </div>

            <div className="prose prose-neutral mt-8 max-w-none">
              <h2 className="font-display text-xl">Requirements</h2>
              <p className="text-muted leading-relaxed whitespace-pre-line">
                {visa.requirements}
              </p>
            </div>

            <div className="mt-10">
              <h2 className="flex items-center gap-2 font-display text-xl text-ink">
                <FileText className="h-5 w-5 text-primary" />
                Document checklist
              </h2>
              <ul className="mt-4 space-y-3">
                {visa.documentChecklist.map((doc) => (
                  <li
                    key={doc}
                    className="flex items-start gap-3 rounded-[var(--radius-md)] border border-line bg-sand/50 px-4 py-3"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {visa.successNotes && (
              <div className="mt-8 rounded-[var(--radius-lg)] border border-primary/20 bg-primary/5 p-5">
                <p className="text-sm text-ink">{visa.successNotes}</p>
              </div>
            )}

            <p className="mt-8 text-sm text-muted">
              <Link href="/tours" className="text-primary hover:underline">
                Browse {visa.country} tour packages →
              </Link>
            </p>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <VisaInquiryForm
              visaInfoId={visa.id}
              country={visa.country}
              isLoggedIn={!!session?.user}
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
