import { prisma } from "@/lib/db";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { VisaInquiryActions } from "@/components/shared/visa-inquiry-actions";

export const metadata = { title: "Visa Inquiries" };

export default async function AdminVisaInquiriesPage() {
  const inquiries = await prisma.visaInquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, visaInfo: true },
  });

  return (
    <Section>
      <Container>
        <SectionHeader title="Visa inquiries" description="Manage visa assistance requests." />
        <div className="space-y-4">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium text-ink">{inq.country}</h3>
                  <p className="text-sm text-muted">
                    {inq.user.name} · {inq.user.email}
                  </p>
                  {inq.travelDate && (
                    <p className="text-sm text-muted">
                      Travel: {inq.travelDate.toLocaleDateString()}
                    </p>
                  )}
                  {inq.notes && <p className="mt-2 text-sm">{inq.notes}</p>}
                </div>
                <Badge variant="secondary">{inq.status}</Badge>
              </div>
              <VisaInquiryActions inquiryId={inq.id} currentStatus={inq.status} />
            </div>
          ))}
          {inquiries.length === 0 && (
            <p className="text-muted">No visa inquiries yet.</p>
          )}
        </div>
      </Container>
    </Section>
  );
}
