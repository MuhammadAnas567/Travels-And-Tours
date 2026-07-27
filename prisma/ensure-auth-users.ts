/**
 * Always upserts demo auth users so login stays reliable even when
 * catalogue seed or an older User document left a broken password field.
 * Safe to run on every `npm run dev` (idempotent).
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function upsertAuthUser(
  email: string,
  data: { name: string; password: string; role: "USER" | "ADMIN" }
) {
  const hashedPassword = await bcrypt.hash(data.password, 12);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    await prisma.user.create({
      data: {
        email,
        name: data.name,
        hashedPassword,
        role: data.role,
      },
    });
    console.log(`Created auth user ${email}`);
    return;
  }
  await prisma.user.update({
    where: { email },
    data: {
      name: data.name,
      hashedPassword,
      role: data.role,
    },
  });
  console.log(`Refreshed auth user ${email}`);
}

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.warn("ensure-auth-users: DATABASE_URL missing — skip");
    return;
  }

  await upsertAuthUser("user@example.com", {
    name: "Demo User",
    password: "user123",
    role: "USER",
  });
  await upsertAuthUser("admin@traveltours.com", {
    name: "Admin",
    password: "admin123",
    role: "ADMIN",
  });
}

main()
  .catch((err) => {
    console.warn("ensure-auth-users:", err?.message ?? err);
  })
  .finally(async () => {
    await prisma.$disconnect().catch(() => {});
  });
