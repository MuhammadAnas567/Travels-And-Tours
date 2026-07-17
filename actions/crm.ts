"use server";

import { revalidatePath } from "next/cache";
import type { QuoteStatus } from "@prisma/client";
import { requireAdmin, requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/db";

const QUOTE_STATUSES: QuoteStatus[] = ["NEW", "QUOTED", "CONVERTED", "CLOSED"];

function revalidateCrm() {
  revalidatePath("/admin/quotes");
  revalidatePath("/admin/crm");
  revalidatePath("/admin/agents");
}

export async function assignQuote(quoteId: string, agentId: string | null) {
  await requireStaff();

  if (agentId) {
    const agent = await prisma.user.findFirst({
      where: { id: agentId, role: { in: ["AGENT", "ADMIN"] } },
    });
    if (!agent) return { error: "Agent not found" };
  }

  await prisma.quoteRequest.update({
    where: { id: quoteId },
    data: { assignedAgentId: agentId },
  });

  revalidateCrm();
  return { success: true };
}

export async function updateQuoteStatus(quoteId: string, status: QuoteStatus) {
  await requireStaff();

  if (!QUOTE_STATUSES.includes(status)) {
    return { error: "Invalid status" };
  }

  await prisma.quoteRequest.update({
    where: { id: quoteId },
    data: { status },
  });

  revalidateCrm();
  return { success: true };
}

export async function addCrmNote(quoteId: string, body: string) {
  const session = await requireStaff();
  const trimmed = body.trim();
  if (!trimmed || trimmed.length > 4000) {
    return { error: "Note must be 1–4000 characters" };
  }

  const quote = await prisma.quoteRequest.findUnique({ where: { id: quoteId } });
  if (!quote) return { error: "Quote not found" };

  await prisma.crmNote.create({
    data: {
      quoteId,
      authorId: session.user.id,
      body: trimmed,
    },
  });

  revalidateCrm();
  return { success: true };
}

export async function listAgents() {
  await requireStaff();

  return prisma.user.findMany({
    where: { role: { in: ["AGENT", "ADMIN"] } },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  });
}

export async function listCrmNotes(quoteId: string) {
  await requireStaff();

  return prisma.crmNote.findMany({
    where: { quoteId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

/** ADMIN only — promote a user by email to AGENT */
export async function promoteUserToAgent(email: string) {
  await requireAdmin();

  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@")) return { error: "Valid email required" };

  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user) return { error: "No user with that email" };
  if (user.role === "ADMIN") return { error: "Cannot change an admin’s role here" };

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "AGENT" },
  });

  revalidateCrm();
  return { success: true, userId: user.id };
}

export async function demoteAgentToUser(userId: string) {
  await requireAdmin();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "User not found" };
  if (user.role !== "AGENT") return { error: "User is not an agent" };

  await prisma.user.update({
    where: { id: userId },
    data: { role: "USER" },
  });

  revalidateCrm();
  return { success: true };
}
