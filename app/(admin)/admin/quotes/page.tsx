import { prisma } from "@/lib/db";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Quote Requests" };

export default async function AdminQuotesPage() {
  const quotes = await prisma.quoteRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return (
    <Section>
      <Container>
        <SectionHeader title="Custom quote requests" />
        <div className="space-y-4">
          {quotes.map((q) => (
            <div key={q.id} className="rounded-[var(--radius-lg)] border border-line bg-surface p-5">
              <div className="flex justify-between gap-4">
                <div>
                  <h3 className="font-medium">{q.name}</h3>
                  <p className="text-sm text-muted">{q.email}</p>
                  <p className="mt-2 text-sm">{q.destinations.join(", ")}</p>
                  <p className="text-sm text-muted">
                    {q.adults} adults, {q.children} children
                    {q.budget ? ` · Budget ${q.budget}` : ""}
                  </p>
                  {q.preferences && <p className="mt-2 text-sm">{q.preferences}</p>}
                </div>
                <Badge>{q.status}</Badge>
              </div>
            </div>
          ))}
          {quotes.length === 0 && <p className="text-muted">No quote requests yet.</p>}
        </div>
      </Container>
    </Section>
  );
}
