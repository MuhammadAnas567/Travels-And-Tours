import net from "node:net";
import { spawn } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const port = 27018;
const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const memoryScript = join(__dirname, "mongo-memory.mjs");
const seedIfEmptyScript = join(__dirname, "seed-if-empty.mjs");

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

async function waitForPort(maxSeconds = 120) {
  const deadline = Date.now() + maxSeconds * 1000;
  while (Date.now() < deadline) {
    if (await isPortOpen()) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

function startMongoDetached() {
  const child = spawn(process.execPath, [memoryScript], {
    cwd: projectRoot,
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  child.unref();
}

function runSeedIfEmpty() {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [seedIfEmptyScript], {
      cwd: projectRoot,
      stdio: "inherit",
      windowsHide: true,
    });
    child.on("exit", () => resolve());
    child.on("error", () => resolve());
  });
}

if (!(await isPortOpen())) {
  console.log("Starting persistent MongoDB (data in .mongo-data)...");
  startMongoDetached();

  if (!(await waitForPort(120))) {
    console.warn("");
    console.warn("WARNING: MongoDB did not start in time.");
    console.warn("Open a separate terminal and run: npm run db:mongo");
    console.warn("");
    process.exit(0);
  }
  console.log(`MongoDB ready on port ${port}`);
} else {
  console.log(`MongoDB already running on port ${port}`);
}

await runSeedIfEmpty();
process.exit(0);
