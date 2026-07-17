/**
 * Production build used by `npm run build` and Vercel.
 * - Always runs `prisma generate` (required on Vercel).
 * - On Windows, a running `next dev` can lock query_engine-windows.dll.node (EPERM).
 *   Locally we retry once, then continue if a client already exists.
 *   On Vercel, generate failure is fatal.
 */
import { spawnSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const isVercel = process.env.VERCEL === "1" || process.env.CI === "true";

/**
 * Next.js 16.2 + Vercel adapter may try to load `.env` at runtime.
 * If the file is expected but missing from the serverless bundle, every
 * dynamic route 500s with EnvFileReadError. An empty traced `.env` avoids
 * that crash; real secrets still come from the Vercel project env UI.
 */
if (isVercel && !existsSync(join(root, ".env"))) {
  writeFileSync(join(root, ".env"), "# Generated on Vercel for Next 16.2 runtime env loader\n", "utf8");
}
const engine = join(
  root,
  "node_modules",
  ".prisma",
  "client",
  process.platform === "win32"
    ? "query_engine-windows.dll.node"
    : "libquery_engine-debian-openssl-3.0.x.so.node"
);

function run(bin, args) {
  const result = spawnSync(bin, args, {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });
  return result.status ?? 1;
}

function prismaGenerate() {
  let code = run("npx", ["prisma", "generate"]);
  if (code === 0) return 0;

  if (isVercel) return code;

  console.warn(
    "prisma generate failed — if next dev is running, stop it and retry. Waiting 2s…"
  );
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 2000);
  code = run("npx", ["prisma", "generate"]);
  if (code === 0) return 0;

  if (existsSync(join(root, "node_modules", ".prisma", "client", "index.js"))) {
    console.warn(
      "Using existing Prisma Client (generate still locked). Stop `next dev` for a clean generate."
    );
    return 0;
  }

  return code;
}

const genCode = prismaGenerate();
if (genCode !== 0) {
  console.error("prisma generate failed with code", genCode);
  process.exit(genCode);
}

const buildCode = run("npx", ["next", "build", "--webpack"]);
process.exit(buildCode);
