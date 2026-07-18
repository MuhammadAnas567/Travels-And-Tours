import { MongoMemoryReplSet } from "mongodb-memory-server";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import net from "node:net";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const port = Number(process.env.MONGO_PORT || 27018);
const dbPath = join(projectRoot, process.env.MONGO_DB_PATH || ".mongo-data-v2");

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
    if (!existsSync(envPath)) continue;
    let content = readFileSync(envPath, "utf8");
    if (/^DATABASE_URL=/m.test(content)) {
      content = content.replace(/^DATABASE_URL=.*$/m, `DATABASE_URL="${databaseUrl}"`);
    } else {
      content = `DATABASE_URL="${databaseUrl}"\n${content}`;
    }
    if (/^MONGODB_URI=/m.test(content)) {
      content = content.replace(/^MONGODB_URI=.*$/m, `MONGODB_URI="${databaseUrl}"`);
    } else {
      content += `\nMONGODB_URI="${databaseUrl}"`;
    }
    writeFileSync(envPath, content);
  }
}

if (await isPortOpen()) {
  console.log(`Port ${port} already open — leaving existing Mongo running.`);
  process.exit(0);
}

mkdirSync(dbPath, { recursive: true });
console.log(`Starting MongoDB at ${dbPath} on port ${port} ...`);

const replSet = await MongoMemoryReplSet.create({
  replSet: { name: "rs0", count: 1, storageEngine: "wiredTiger" },
  instanceOpts: [{ port, dbPath, storageEngine: "wiredTiger" }],
});

const databaseUrl = replSet.getUri("travels-tours");
updateEnvFiles(databaseUrl);
console.log(`READY ${databaseUrl}`);
console.log("Keep this terminal open. Then run: npm run seed");

process.on("SIGINT", async () => {
  await replSet.stop({ doCleanup: false }).catch(() => {});
  process.exit(0);
});

setInterval(() => {}, 1 << 30);
