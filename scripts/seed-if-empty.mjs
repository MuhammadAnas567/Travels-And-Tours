/**
 * Seeds only when data is missing.
 * - Catalogue first (destinations / hotels / flights) — never touches auth users
 * - Prisma last (tours + demo auth users) so login always works
 * Runs from ensure-mongo on every `npm run dev`.
 */
import { spawn } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";
import { readFileSync, existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const port = 27018;

function readDatabaseUrl() {
  for (const file of [".env.local", ".env"]) {
    const envPath = join(projectRoot, file);
    if (!existsSync(envPath)) continue;
    const content = readFileSync(envPath, "utf8");
    const match = content.match(/^DATABASE_URL=["']?([^"'\r\n]+)["']?/m);
    if (match?.[1]) return match[1];
  }
  return `mongodb://127.0.0.1:${port}/travels-tours?replicaSet=rs0`;
}

async function countByNames(db, names) {
  const cols = await db.listCollections().toArray();
  const map = new Map(cols.map((c) => [c.name.toLowerCase(), c.name]));
  for (const name of names) {
    const actual = map.get(name.toLowerCase());
    if (actual) return db.collection(actual).countDocuments();
  }
  return 0;
}

async function hasPrismaDemoUser(db) {
  const cols = await db.listCollections().toArray();
  const map = new Map(cols.map((c) => [c.name.toLowerCase(), c.name]));
  const userCol = map.get("user");
  if (!userCol) return false;
  const demo = await db.collection(userCol).findOne({
    email: "user@example.com",
    hashedPassword: { $exists: true, $ne: null },
  });
  return Boolean(demo);
}

async function getCounts(uri) {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  try {
    await client.connect();
    const db = client.db();
    const demoUser = await hasPrismaDemoUser(db);
    const counts = {
      tours: await countByNames(db, ["Tour", "tours"]),
      destinations: await countByNames(db, ["destinations", "Destination"]),
      hotels: await countByNames(db, ["hotels", "Hotel"]),
      flights: await countByNames(db, ["flights", "Flight"]),
      demoUser,
    };
    console.log(
      `DB check — tours:${counts.tours} destinations:${counts.destinations} hotels:${counts.hotels} flights:${counts.flights} demoUser:${counts.demoUser}`
    );
    return counts;
  } finally {
    await client.close().catch(() => {});
  }
}

function run(scriptRel, databaseUrl) {
  return new Promise((resolve, reject) => {
    const tsxCli = join(projectRoot, "node_modules", "tsx", "dist", "cli.mjs");
    const child = spawn(process.execPath, [tsxCli, scriptRel], {
      cwd: projectRoot,
      stdio: "inherit",
      shell: false,
      env: { ...process.env, DATABASE_URL: databaseUrl },
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`tsx ${scriptRel} exited ${code}`));
    });
    child.on("error", reject);
  });
}

const uri = readDatabaseUrl();

try {
  const counts = await getCounts(uri);
  const needCatalog =
    counts.destinations === 0 || counts.hotels === 0 || counts.flights === 0;
  const needPrisma = counts.tours === 0 || !counts.demoUser;

  if (!needPrisma && !needCatalog) {
    console.log("Catalogue + tours present — ensuring demo auth passwords…");
    await run("prisma/ensure-auth-users.ts", uri);
    console.log("Database already seeded.");
    process.exit(0);
  }

  // Catalogue first so reviews can attach to Prisma users seeded next
  if (needCatalog) {
    console.log("Seeding catalog data (destinations / hotels / flights)...");
    await run("scripts/seed.ts", uri);
  }

  if (needPrisma) {
    console.log("Seeding Prisma data (tours / auth users)...");
    await run("prisma/seed.ts", uri);
  } else {
    await run("prisma/ensure-auth-users.ts", uri);
  }

  console.log("Seed complete — data persists in .mongo-data.");
  process.exit(0);
} catch (err) {
  console.warn("seed-if-empty:", err?.message ?? err);
  process.exit(0);
}
