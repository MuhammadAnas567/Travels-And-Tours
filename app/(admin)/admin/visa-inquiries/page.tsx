import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { VisaInquiryActions } from "@/components/shared/visa-inquiry-actions";

export const metadata = { title: "Visa Inquiries" };

export default async function AdminVisaInquiriesPage() {
  const inquiries = await prisma.visaInquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, visaInfo: true },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-900">
        Visa inquiries
      </h1>
      <p className="mt-1 text-sm text-ink-500">
        Manage visa assistance requests.
      </p>
      <div className="mt-6 space-y-4">
        {inquiries.map((inq) => (
          <div
            key={inq.id}
            className="rounded-md border border-line bg-paper p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-medium text-ink-900">{inq.country}</h3>
                <p className="text-sm text-ink-500">
                  {inq.user.name} · {inq.user.email}
                </p>
                {inq.travelDate && (
                  <p className="text-sm text-ink-500">
                    Travel: {inq.travelDate.toLocaleDateString()}
                  </p>
                )}
                {inq.notes && (
                  <p className="mt-2 text-sm text-ink-700">{inq.notes}</p>
                )}
              </div>
              <Badge variant="secondary">{inq.status}</Badge>
            </div>
            <VisaInquiryActions inquiryId={inq.id} currentStatus={inq.status} />
          </div>
        ))}
        {inquiries.length === 0 && (
          <p className="text-ink-500">No visa inquiries yet.</p>
        )}
      </div>
    </div>
  );
}
