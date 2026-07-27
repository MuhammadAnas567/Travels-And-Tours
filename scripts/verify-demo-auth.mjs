import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

function load(f) {
  const p = join(process.cwd(), f);
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[m[1]]) process.env[m[1]] = v;
  }
}

load(".env");
load(".env.local");

const prisma = new PrismaClient();
const user = await prisma.user.findUnique({ where: { email: "user@example.com" } });
const passwordOk = user?.hashedPassword
  ? await bcrypt.compare("user123", user.hashedPassword)
  : false;
console.log(
  JSON.stringify({
    exists: !!user,
    hasHash: !!user?.hashedPassword,
    passwordOk,
    role: user?.role ?? null,
  })
);
await prisma.$disconnect();
