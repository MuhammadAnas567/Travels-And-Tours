import { MongoMemoryReplSet } from "mongodb-memory-server";
import { MongoClient } from "mongodb";
import {
  writeFileSync,
  readFileSync,
  existsSync,
  mkdirSync,
  rmSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import net from "node:net";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const port = 27018;

/**
 * Project path has spaces ("Travels and Tours") which often crashes mongod (exit 14).
 * Keep data under the user home instead.
 */
const dbPath = join(homedir(), ".ueb3-travel-mongo");

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

    if (/^MONGODB_URI=/m.test(content)) {
      content = content.replace(/^MONGODB_URI=.*$/m, `MONGODB_URI="${databaseUrl}"`);
    } else {
      content = `${content.trimEnd()}\nMONGODB_URI="${databaseUrl}"\n`;
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

function prepareDbPath({ wipe = false } = {}) {
  if (wipe && existsSync(dbPath)) {
    console.log(`Clearing broken Mongo data at ${dbPath} ...`);
    rmSync(dbPath, { recursive: true, force: true });
  }
  mkdirSync(dbPath, { recursive: true });

  // Stale lock with nothing listening on the port → previous crash
  const lock = join(dbPath, "mongod.lock");
  if (existsSync(lock)) {
    try {
      rmSync(lock, { force: true });
    } catch {
      // ignore
    }
  }
}

async function startReplSet() {
  return MongoMemoryReplSet.create({
    replSet: { name: "rs0", count: 1, storageEngine: "wiredTiger" },
    instanceOpts: [
      {
        port,
        dbPath,
        storageEngine: "wiredTiger",
      },
    ],
  });
}

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

prepareDbPath();
console.log(`Starting persistent MongoDB at ${dbPath} ...`);

let replSet;
try {
  replSet = await startReplSet();
} catch (error) {
  console.warn("First Mongo start failed, wiping data dir and retrying...");
  console.warn(String(error?.message || error));
  prepareDbPath({ wipe: true });
  try {
    replSet = await startReplSet();
  } catch (retryError) {
    console.error("");
    console.error("Local Mongo still failed to start.");
    console.error("Quick alternative — use Atlas for local auth:");
    console.error("  1. Copy Atlas URI into .env.local as DATABASE_URL and MONGODB_URI");
    console.error("  2. npm run seed:atlas");
    console.error("  3. npm run dev");
    console.error("");
    throw retryError;
  }
}

const databaseUrl = replSet.getUri("travels-tours");
updateEnvFiles(databaseUrl);

mkdirSync(dbPath, { recursive: true });
writeFileSync(join(dbPath, "mongod.pid"), String(process.pid));

console.log(`MongoDB ready: ${databaseUrl}`);
console.log(`Data folder: ${dbPath}`);
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

setInterval(() => {}, 1 << 30);
