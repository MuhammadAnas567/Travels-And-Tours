"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { QuoteStatus } from "@prisma/client";
import { assignQuote, updateQuoteStatus, addCrmNote } from "@/actions/crm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type QuoteBoardItem = {
  id: string;
  name: string;
  email: string;
  destinations: string[];
  adults: number;
  children: number;
  budget: number | null;
  preferences: string | null;
  status: QuoteStatus;
  assignedAgentId: string | null;
  assignedAgent: { id: string; name: string | null; email: string } | null;
  createdAt: string;
};

export type AgentOption = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

const COLUMNS: { status: QuoteStatus; label: string; tint: string }[] = [
  { status: "NEW", label: "New", tint: "border-t-sand-600" },
  { status: "QUOTED", label: "Quoted", tint: "border-t-pine-500" },
  { status: "CONVERTED", label: "Converted", tint: "border-t-pine-700" },
  { status: "CLOSED", label: "Closed", tint: "border-t-ink-400" },
];

function QuoteCard({
  quote,
  agents,
}: {
  quote: QuoteBoardItem;
  agents: AgentOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [openNote, setOpenNote] = useState(false);

  function move(status: QuoteStatus) {
    startTransition(async () => {
      await updateQuoteStatus(quote.id, status);
      router.refresh();
    });
  }

  function onAssign(agentId: string) {
    startTransition(async () => {
      await assignQuote(quote.id, agentId || null);
      router.refresh();
    });
  }

  function submitNote() {
    if (!note.trim()) return;
    startTransition(async () => {
      await addCrmNote(quote.id, note);
      setNote("");
      setOpenNote(false);
      router.refresh();
    });
  }

  return (
    <article className="rounded-md border border-line bg-paper p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-ink-900">{quote.name}</h3>
          <p className="truncate text-xs text-ink-500">{quote.email}</p>
        </div>
        <Badge className="shrink-0 text-[0.65rem]">{quote.status}</Badge>
      </div>
      <p className="mt-2 line-clamp-2 text-xs text-ink-700">
        {quote.destinations.join(", ") || "No destinations"}
      </p>
      <p className="mt-1 text-xs text-ink-500">
        {quote.adults} adults
        {quote.children ? `, ${quote.children} children` : ""}
        {quote.budget != null ? ` · Budget ${quote.budget}` : ""}
      </p>
      {quote.assignedAgent ? (
        <p className="mt-2 text-xs text-pine-700">
          Agent: {quote.assignedAgent.name ?? quote.assignedAgent.email}
        </p>
      ) : (
        <p className="mt-2 text-xs text-ink-400">Unassigned</p>
      )}

      <label className="mt-3 block text-[0.65rem] font-semibold uppercase tracking-wide text-ink-500">
        Assign
        <select
          className="mt-1 w-full rounded-sm border border-line bg-sand px-2 py-1.5 text-xs text-ink-800"
          disabled={pending}
          value={quote.assignedAgentId ?? ""}
          onChange={(e) => onAssign(e.target.value)}
        >
          <option value="">— Unassigned —</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name ?? a.email} ({a.role})
            </option>
          ))}
        </select>
      </label>

      <label className="mt-2 block text-[0.65rem] font-semibold uppercase tracking-wide text-ink-500">
        Status
        <select
          className="mt-1 w-full rounded-sm border border-line bg-sand px-2 py-1.5 text-xs text-ink-800"
          disabled={pending}
          value={quote.status}
          onChange={(e) => move(e.target.value as QuoteStatus)}
        >
          {COLUMNS.map((c) => (
            <option key={c.status} value={c.status}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-3 border-t border-line pt-2">
        {openNote ? (
          <div className="space-y-2">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Internal note…"
              className="w-full rounded-sm border border-line bg-sand px-2 py-1.5 text-xs text-ink-800"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                disabled={pending || !note.trim()}
                onClick={submitNote}
                className="bg-pine-600 hover:bg-pine-700"
              >
                Save note
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setOpenNote(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="text-xs font-medium text-pine-600 hover:underline"
            onClick={() => setOpenNote(true)}
          >
            + Add note
          </button>
        )}
      </div>
    </article>
  );
}

export function QuotesBoard({
  quotes,
  agents,
}: {
  quotes: QuoteBoardItem[];
  agents: AgentOption[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {COLUMNS.map((col) => {
        const items = quotes.filter((q) => q.status === col.status);
        return (
          <section
            key={col.status}
            className={cn(
              "rounded-md border border-line border-t-4 bg-sand/60 p-3",
              col.tint
            )}
          >
            <header className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink-900">{col.label}</h2>
              <span className="rounded-sm bg-paper px-2 py-0.5 text-xs tabular-nums text-ink-500">
                {items.length}
              </span>
            </header>
            <div className="space-y-3">
              {items.map((q) => (
                <QuoteCard key={q.id} quote={q} agents={agents} />
              ))}
              {items.length === 0 && (
                <p className="py-6 text-center text-xs text-ink-400">No quotes</p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
