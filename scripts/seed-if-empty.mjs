/**
 * Seeds only when data is missing.
 * - Prisma: Tour / User (packages, admin)
 * - Mongoose: Destination / Hotel / Flight (home images, hotels, flights)
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

async function getCounts(uri) {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  try {
    await client.connect();
    const db = client.db();
    const counts = {
      tours: await countByNames(db, ["Tour", "tours"]),
      users: await countByNames(db, ["User", "users"]),
      destinations: await countByNames(db, ["destinations", "Destination"]),
      hotels: await countByNames(db, ["hotels", "Hotel"]),
      flights: await countByNames(db, ["flights", "Flight"]),
    };
    console.log(
      `DB check — tours:${counts.tours} users:${counts.users} destinations:${counts.destinations} hotels:${counts.hotels} flights:${counts.flights}`
    );
    return counts;
  } finally {
    await client.close().catch(() => {});
  }
}

function run(scriptRel) {
  return new Promise((resolve, reject) => {
    // Windows: spawn npx.cmd with shell:false → EINVAL; use node + local tsx
    const tsxCli = join(projectRoot, "node_modules", "tsx", "dist", "cli.mjs");
    const child = spawn(process.execPath, [tsxCli, scriptRel], {
      cwd: projectRoot,
      stdio: "inherit",
      shell: false,
      env: { ...process.env },
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
  const needPrisma = counts.users === 0 || counts.tours === 0;
  const needCatalog =
    counts.destinations === 0 || counts.hotels === 0 || counts.flights === 0;

  if (!needPrisma && !needCatalog) {
    console.log("Database already seeded — skipping.");
    process.exit(0);
  }

  if (needPrisma) {
    console.log("Seeding Prisma data (tours / users)...");
    await run("prisma/seed.ts");
  }

  if (needCatalog) {
    console.log("Seeding catalog data (destinations / hotels / flights)...");
    await run("scripts/seed.ts");
  }

  console.log("Seed complete — data persists in .mongo-data.");
  process.exit(0);
} catch (err) {
  console.warn("seed-if-empty:", err?.message ?? err);
  process.exit(0);
}
