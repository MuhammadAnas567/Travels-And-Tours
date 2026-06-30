import { MongoMemoryReplSet } from "mongodb-memory-server";
import { MongoClient } from "mongodb";
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import net from "node:net";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const port = 27018;

const connectionCandidates = [
  `mongodb://127.0.0.1:${port}/travels-tours?replicaSet=testset`,
  `mongodb://127.0.0.1:${port}/travels-tours?replicaSet=rs0`,
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
      // try next candidate
    } finally {
      await client.close().catch(() => {});
    }
  }
  return null;
}

if (await isPortOpen()) {
  const existingUrl = await detectWorkingUrl();
  if (existingUrl) {
    updateEnvFiles(existingUrl);
    console.log(`MongoDB already running: ${existingUrl}`);
    process.exit(0);
  }

  console.error(
    `Port ${port} is in use but MongoDB did not respond. Stop the other process, then run: npm run db:mongo`
  );
  process.exit(1);
}

console.log("Starting in-memory MongoDB replica set (no local install needed)...");

const replSet = await MongoMemoryReplSet.create({
  replSet: { name: "rs0", count: 1, storageEngine: "wiredTiger" },
  instanceOpts: [{ port }],
});

const databaseUrl = replSet.getUri("travels-tours");
updateEnvFiles(databaseUrl);

console.log(`MongoDB ready: ${databaseUrl}`);
console.log("Press Ctrl+C to stop.");

process.on("SIGINT", async () => {
  await replSet.stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await replSet.stop();
  process.exit(0);
});

await new Promise(() => {});
