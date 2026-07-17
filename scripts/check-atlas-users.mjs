/**
 * Verifies Prisma demo users exist on Atlas (uses .env.atlas.local).
 * Does not print passwords or full connection strings.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(name, override = false) {
  const path = join(root, name);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (!m) continue;
    if (override || !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

loadEnv(".env");
loadEnv(".env.local");
loadEnv(".env.atlas.local", true);

const uri = process.env.DATABASE_URL || process.env.MONGODB_URI || "";
if (!uri || uri.includes("localhost") || uri.includes("127.0.0.1")) {
  console.error("No Atlas DATABASE_URL found. Create .env.atlas.local first.");
  process.exit(1);
}

console.log("Checking users on Atlas DB:", uri.replace(/:[^:@/]+@/, ":****@").split("?")[0]);

const code = `
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const users = await prisma.user.findMany({ select: { email: true, role: true, hashedPassword: true } });
console.log("User count:", users.length);
for (const u of users) {
  console.log("-", u.email, u.role, u.hashedPassword ? "(password set)" : "(NO PASSWORD)");
}
const demo = users.find((u) => u.email === "user@example.com");
if (!demo) {
  console.error("MISSING user@example.com — run: npm run seed:atlas");
  process.exitCode = 2;
} else {
  console.log("OK: user@example.com is ready");
}
await prisma.$disconnect();
`;

const result = spawnSync("npx", ["tsx", "-e", code], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: uri },
  shell: true,
});

process.exit(result.status ?? 1);
