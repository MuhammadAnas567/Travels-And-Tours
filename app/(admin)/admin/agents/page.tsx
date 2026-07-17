import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { demoteAgentToUser, promoteUserToAgent } from "@/actions/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Agents" };

async function promoteAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "");
  await promoteUserToAgent(email);
  revalidatePath("/admin/agents");
}

async function demoteAction(formData: FormData) {
  "use server";
  const userId = String(formData.get("userId") ?? "");
  await demoteAgentToUser(userId);
  revalidatePath("/admin/agents");
}

export default async function AdminAgentsPage() {
  const session = await getSession();
  if (session?.user?.role !== "ADMIN") {
    redirect("/admin");
  }

  const agents = await prisma.user.findMany({
    where: { role: "AGENT" },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-900">
        Agents
      </h1>
      <p className="mt-1 text-sm text-ink-500">
        Promote staff to AGENT so they can access the quotes CRM.
      </p>

      <form action={promoteAction} className="mt-8 flex flex-wrap items-end gap-3">
        <div className="min-w-[240px] flex-1">
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            User email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="agent@example.com"
            className="mt-1"
          />
        </div>
        <Button type="submit" className="bg-pine-600 hover:bg-pine-700">
          Promote to AGENT
        </Button>
      </form>

      <div className="mt-10 space-y-3">
        <h2 className="text-sm font-semibold text-ink-800">Current agents</h2>
        {agents.map((a) => (
          <div
            key={a.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-paper px-4 py-3"
          >
            <div>
              <p className="font-medium text-ink-900">{a.name ?? "Unnamed"}</p>
              <p className="text-sm text-ink-500">{a.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge>AGENT</Badge>
              <form action={demoteAction}>
                <input type="hidden" name="userId" value={a.id} />
                <Button type="submit" variant="outline" size="sm">
                  Demote
                </Button>
              </form>
            </div>
          </div>
        ))}
        {agents.length === 0 && (
          <p className="text-sm text-ink-500">No agents yet. Promote a user by email above.</p>
        )}
      </div>
    </div>
  );
}
