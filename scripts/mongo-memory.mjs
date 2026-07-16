import { MongoMemoryReplSet } from "mongodb-memory-server";
import { MongoClient } from "mongodb";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import net from "node:net";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const port = 27018;
// Prefer .mongo-data-v2 when present (older .mongo-data can crash mongod with exit 14)
const dbPath = join(
  projectRoot,
  existsSync(join(projectRoot, ".mongo-data-v2")) ? ".mongo-data-v2" : ".mongo-data"
);

const connectionCandidates = [
  `mongodb://127.0.0.1:${port}/travels-tours?replicaSet=rs0`,
  `mongodb://127.0.0.1:${port}/travels-tours?replicaSet=testset`,
  `mongodb://127.0.0.1:${port}/travels-tours?directConnection=true`,
];

function isPortOpen() {
  return new Promise((resolve) => {
    const socket = net.createConnection(port, "127.0.0.1");
    socket.once("connect", () => {
      socket.end();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
  });
}

function updateEnvFiles(databaseUrl) {
  for (const file of [".env", ".env.local"]) {
    const envPath = join(projectRoot, file);
    let content = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";

    if (/^DATABASE_URL=/m.test(content)) {
      content = content.replace(/^DATABASE_URL=.*$/m, `DATABASE_URL="${databaseUrl}"`);
    } else {
      content = `DATABASE_URL="${databaseUrl}"\n${content}`;
    }

    writeFileSync(envPath, content);
  }
}

async function detectWorkingUrl() {
  for (const url of connectionCandidates) {
    const client = new MongoClient(url, { serverSelectionTimeoutMS: 2000 });
    try {
      await client.connect();
      await client.db("travels-tours").command({ ping: 1 });
      return url;
    } catch {
      // try next
    } finally {
      await client.close().catch(() => {});
    }
  }
  return null;
}

mkdirSync(dbPath, { recursive: true });

if (await isPortOpen()) {
  const existingUrl = await detectWorkingUrl();
  if (existingUrl) {
    updateEnvFiles(existingUrl);
    console.log(`MongoDB already running (persistent): ${existingUrl}`);
    process.exit(0);
  }

  console.error(
    `Port ${port} is in use but MongoDB did not respond. Stop the other process, then run: npm run db:mongo`
  );
  process.exit(1);
}

console.log(`Starting persistent MongoDB at ${dbPath} ...`);

const replSet = await MongoMemoryReplSet.create({
  replSet: { name: "rs0", count: 1, storageEngine: "wiredTiger" },
  instanceOpts: [
    {
      port,
      dbPath,
      storageEngine: "wiredTiger",
    },
  ],
});

const databaseUrl = replSet.getUri("travels-tours");
updateEnvFiles(databaseUrl);

const pidPath = join(projectRoot, ".mongo-data", "mongod.pid");
writeFileSync(pidPath, String(process.pid));

console.log(`MongoDB ready (data persists in .mongo-data): ${databaseUrl}`);
console.log("Press Ctrl+C to stop (data is kept).");

async function shutdown() {
  try {
    await replSet.stop({ doCleanup: false });
  } catch {
    // ignore
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("SIGHUP", shutdown);

// Keep process alive without unsettled top-level await warnings
setInterval(() => {}, 1 << 30);
