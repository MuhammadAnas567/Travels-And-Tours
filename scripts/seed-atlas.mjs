/**
 * Seed MongoDB Atlas. Falls back to non-SRV URI when Node DNS SRV fails (common on some Windows networks).
 * Usage: node scripts/seed-atlas.mjs
 */
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Resolver } from "node:dns/promises";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(name, { override = false } = {}) {
  const path = join(root, name);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (!m) continue;
    if (override || !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

// Localhost .env first, then Atlas override file wins for seeding
loadEnvFile(".env");
loadEnvFile(".env.local");
loadEnvFile(".env.atlas.local", { override: true });

async function toStandardUri(srvUri) {
  const m = srvUri.match(
    /^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?]+)\/?([^?]*)(\?.*)?$/
  );
  if (!m) return srvUri;

  const [, user, pass, host, db = "travels-tours", qs = ""] = m;
  const resolver = new Resolver();
  resolver.setServers(["8.8.8.8", "1.1.1.1"]);

  const [srv, txt] = await Promise.all([
    resolver.resolveSrv(`_mongodb._tcp.${host}`),
    resolver.resolveTxt(host).catch(() => []),
  ]);

  const hosts = srv.map((r) => `${r.name}:${r.port || 27017}`).join(",");
  const params = new URLSearchParams();

  for (const chunk of [...(txt.flat?.() ?? txt), qs.replace(/^\?/, "")]) {
    if (!chunk) continue;
    for (const part of String(chunk).split("&")) {
      const [k, v] = part.split("=");
      if (k && v !== undefined && !params.has(k)) params.set(k, v);
    }
  }

  if (!params.get("authSource")) params.set("authSource", "admin");
  if (!params.get("ssl") && !params.get("tls")) params.set("tls", "true");
  if (!params.get("retryWrites")) params.set("retryWrites", "true");
  if (!params.get("w")) params.set("w", "majority");

  const dbName = db || "travels-tours";
  return `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${hosts}/${dbName}?${params.toString()}`;
}

const raw = process.env.MONGODB_URI || process.env.DATABASE_URL;
if (!raw || raw.includes("127.0.0.1") || raw.includes("localhost")) {
  console.error("Set Atlas MONGODB_URI in .env.local first (not localhost).");
  process.exit(1);
}

let uri = raw;
if (raw.startsWith("mongodb+srv://")) {
  try {
    uri = await toStandardUri(raw);
    console.log("Using non-SRV Atlas URI (DNS workaround)");
  } catch (e) {
    console.warn("SRV→standard conversion failed, trying SRV:", e.message);
  }
}

console.log("Seeding Atlas:", uri.replace(/:[^:@/]+@/, ":****@"));

const env = { ...process.env, MONGODB_URI: uri, DATABASE_URL: uri };

const catalogue = spawnSync("npx", ["tsx", "scripts/seed.ts"], {
  cwd: root,
  stdio: "inherit",
  env,
  shell: true,
});
if ((catalogue.status ?? 1) !== 0) process.exit(catalogue.status ?? 1);

const schema = spawnSync("npx", ["prisma", "db", "push", "--skip-generate"], {
  cwd: root,
  stdio: "inherit",
  env,
  shell: true,
});
if ((schema.status ?? 1) !== 0) process.exit(schema.status ?? 1);

const prismaSeed = spawnSync("npx", ["tsx", "prisma/seed.ts"], {
  cwd: root,
  stdio: "inherit",
  env,
  shell: true,
});

process.exit(prismaSeed.status ?? 1);
