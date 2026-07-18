import { prisma } from "@/lib/db";

/**
 * Resolve the paying user for checkout.
 * Prefer the signed-in session; otherwise find-or-create a guest account from traveller email
 * so flights/hotels/cars can be booked without a prior login.
 */
export async function resolveCheckoutUserId(opts: {
  sessionUserId?: string | null;
  email: string;
  name: string;
}) {
  if (opts.sessionUserId) return opts.sessionUserId;

  const email = opts.email.trim().toLowerCase();
  if (!email.includes("@")) {
    throw new Error("A valid email is required to complete booking");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing.id;

  const created = await prisma.user.create({
    data: {
      email,
      name: opts.name.trim() || email.split("@")[0],
    },
  });
  return created.id;
}
