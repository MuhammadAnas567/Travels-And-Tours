import { prisma } from "@/lib/db";
import { listAgents } from "@/actions/crm";
import { QuotesBoard } from "@/components/crm/quotes-board";

export const metadata = { title: "Quotes CRM" };

export default async function AdminQuotesPage() {
  const [quotes, agents] = await Promise.all([
    prisma.quoteRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        assignedAgent: { select: { id: true, name: true, email: true } },
      },
    }),
    listAgents(),
  ]);

  const boardQuotes = quotes.map((q) => ({
    id: q.id,
    name: q.name,
    email: q.email,
    destinations: q.destinations,
    adults: q.adults,
    children: q.children,
    budget: q.budget,
    preferences: q.preferences,
    status: q.status,
    assignedAgentId: q.assignedAgentId,
    assignedAgent: q.assignedAgent,
    createdAt: q.createdAt.toISOString(),
  }));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-900">
            Quotes CRM
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Move requests across the pipeline, assign agents, and leave internal notes.
          </p>
        </div>
      </div>
      <QuotesBoard quotes={boardQuotes} agents={agents} />
    </div>
  );
}
