import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Quote Requests" };

export default async function AdminQuotesPage() {
  const quotes = await prisma.quoteRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-900">
        Custom quote requests
      </h1>
      <div className="mt-6 space-y-4">
        {quotes.map((q) => (
          <div
            key={q.id}
            className="rounded-md border border-line bg-paper p-5 shadow-sm"
          >
            <div className="flex justify-between gap-4">
              <div>
                <h3 className="font-medium text-ink-900">{q.name}</h3>
                <p className="text-sm text-ink-500">{q.email}</p>
                <p className="mt-2 text-sm text-ink-700">
                  {q.destinations.join(", ")}
                </p>
                <p className="text-sm text-ink-500">
                  {q.adults} adults, {q.children} children
                  {q.budget ? ` · Budget ${q.budget}` : ""}
                </p>
                {q.preferences && (
                  <p className="mt-2 text-sm text-ink-700">{q.preferences}</p>
                )}
              </div>
              <Badge>{q.status}</Badge>
            </div>
          </div>
        ))}
        {quotes.length === 0 && (
          <p className="text-ink-500">No quote requests yet.</p>
        )}
      </div>
    </div>
  );
}
