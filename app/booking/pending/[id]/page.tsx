import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { siteConfig } from "@/lib/site-config";
import { formatCurrency } from "@/lib/currency";
import { Container, Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { PaymentProofForm } from "@/components/shared/payment-proof-form";
import { bookingTitle, type ProductSnapshot } from "@/lib/commerce";

type Props = { params: Promise<{ id: string }> };

export default async function PendingBookingPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user?.id) notFound();

  const booking = await prisma.booking.findFirst({
    where: { id, userId: session.user.id },
    include: { tour: true, tourDate: true },
  });

  if (!booking || booking.status !== "PENDING_VERIFICATION") notFound();

  const bank = siteConfig.bankTransfer;
  const snapshot = booking.productSnapshot as ProductSnapshot | null;
  const title =
    booking.tour?.title ?? bookingTitle(booking.type, snapshot ?? undefined);
  const start = booking.tourDate?.startDate
    ? booking.tourDate.startDate
    : snapshot?.startDate
      ? new Date(snapshot.startDate)
      : null;

  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-2xl">
          <Badge variant="warning">Pending verification</Badge>
          <h1 className="mt-4 font-display text-h2 text-ink">Complete your payment</h1>
          <p className="mt-2 text-muted">
            {title}
            {start ? ` · ${start.toLocaleDateString()}` : ""}
          </p>
          <p className="mt-4 text-2xl font-semibold text-primary">
            {formatCurrency(booking.totalPrice, booking.currency)}
          </p>

          {booking.paymentMethod === "BANK_TRANSFER" && bank.enabled && (
            <div className="mt-8 rounded-[var(--radius-lg)] border border-line bg-surface p-6">
              <h2 className="font-display text-lg">Bank transfer details</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Bank</dt>
                  <dd>{bank.bankName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Account title</dt>
                  <dd>{bank.accountTitle}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Account #</dt>
                  <dd className="font-mono">{bank.accountNumber || "Contact office"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">IBAN</dt>
                  <dd className="font-mono">{bank.iban || "—"}</dd>
                </div>
              </dl>
            </div>
          )}

          <div className="mt-8">
            <PaymentProofForm bookingId={booking.id} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
