/**
 * Ensures only one `next dev` for this project is running.
 * Clears stale .next/dev/lock and frees ports 3000/3001 before npm run dev.
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import net from "node:net";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const lockPath = join(projectRoot, ".next", "dev", "lock");
const DEV_PORTS = [3000, 3001];
const isWin = process.platform === "win32";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection(port, "127.0.0.1");
    socket.setTimeout(400);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => resolve(false));
  });
}

function killPid(pid) {
  if (!pid || !Number.isFinite(pid) || pid <= 0) return;
  if (pid === process.pid) return;
  try {
    if (isWin) {
      execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore" });
    } else {
      process.kill(pid, "SIGTERM");
    }
    console.log(`Stopped previous dev process (PID ${pid})`);
  } catch {
    // already gone
  }
}

function pidsOnPort(port) {
  try {
    if (isWin) {
      const out = execSync(`netstat -ano -p tcp`, { encoding: "utf8" });
      const pids = new Set();
      for (const line of out.split(/\r?\n/)) {
        if (!line.includes("LISTENING")) continue;
        // e.g. TCP    0.0.0.0:3000    0.0.0.0:0    LISTENING    1068
        const m = line.match(new RegExp(`:${port}\\s+.+LISTENING\\s+(\\d+)\\s*$`, "i"));
        if (m) pids.add(Number(m[1]));
      }
      return [...pids];
    }
    const out = execSync(`lsof -ti tcp:${port} -sTCP:LISTEN || true`, {
      encoding: "utf8",
      shell: "/bin/bash",
    });
    return out
      .split(/\s+/)
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
  } catch {
    return [];
  }
}

function readLockPid() {
  if (!existsSync(lockPath)) return null;
  try {
    const raw = readFileSync(lockPath, "utf8").trim();
    // lock may be JSON or plain PID
    if (/^\d+$/.test(raw)) return Number(raw);
    const json = JSON.parse(raw);
    const pid = Number(json.pid ?? json.PID ?? json.processId);
    return Number.isFinite(pid) ? pid : null;
  } catch {
    return null;
  }
}

function clearLock() {
  try {
    if (existsSync(lockPath)) {
      unlinkSync(lockPath);
      console.log("Cleared stale Next.js dev lock");
    }
  } catch {
    // lock held — process kill should release it
  }
  // Next 16 also keeps a logs folder; leave it
}

function isProcessAlive(pid) {
  if (!pid) return false;
  try {
    if (isWin) {
      const out = execSync(`tasklist /FI "PID eq ${pid}" /NH`, { encoding: "utf8" });
      return out.includes(String(pid));
    }
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/** Kill any next/start-server processes belonging to this project. */
function pidsForThisProjectNext() {
  const rootLower = projectRoot.toLowerCase();
  const rootFwd = rootLower.replace(/\\/g, "/");
  const pids = new Set();
  try {
    if (isWin) {
      const out = execSync(
        'wmic process where "name=\'node.exe\'" get ProcessId,CommandLine /FORMAT:CSV',
        { encoding: "utf8", windowsHide: true, maxBuffer: 8 * 1024 * 1024 }
      );
      for (const line of out.split(/\r?\n/)) {
        if (!/next/i.test(line) && !/start-server\.js/i.test(line)) continue;
        const normalized = line.toLowerCase();
        if (!normalized.includes(rootLower) && !normalized.includes(rootFwd)) continue;
        const parts = line.split(",");
        const pid = Number(parts[parts.length - 1]?.trim());
        if (Number.isFinite(pid) && pid > 0 && pid !== process.pid) pids.add(pid);
      }
    } else {
      const out = execSync(`ps -Ao pid=,args=`, { encoding: "utf8" });
      for (const line of out.split("\n")) {
        if (!line.includes("next") && !line.includes("start-server")) continue;
        if (!line.includes(projectRoot)) continue;
        const pid = Number(line.trim().split(/\s+/)[0]);
        if (Number.isFinite(pid) && pid !== process.pid) pids.add(pid);
      }
    }
  } catch {
    // wmic may be unavailable on some Windows builds — port kill is enough
  }
  return [...pids];
}

const killed = new Set();

const lockPid = readLockPid();
if (lockPid) {
  if (isProcessAlive(lockPid)) {
    killPid(lockPid);
    killed.add(lockPid);
  } else {
    clearLock();
  }
}

for (const pid of pidsForThisProjectNext()) {
  if (killed.has(pid)) continue;
  console.log(`Found leftover Next.js for this project (PID ${pid}) — stopping…`);
  killPid(pid);
  killed.add(pid);
}

for (const port of DEV_PORTS) {
  if (!(await isPortOpen(port))) continue;
  const pids = pidsOnPort(port);
  if (!pids.length) {
    console.log(`Port ${port} busy but no owner found — waiting briefly…`);
    await sleep(300);
    continue;
  }
  for (const pid of pids) {
    if (killed.has(pid)) continue;
    console.log(`Port ${port} in use by PID ${pid} — freeing for this project…`);
    killPid(pid);
    killed.add(pid);
  }
}

await sleep(800);
clearLock();

// Retry once if OS still reports the port
if (await isPortOpen(3000)) {
  for (const pid of pidsOnPort(3000)) {
    if (!killed.has(pid)) {
      killPid(pid);
      killed.add(pid);
    } else {
      killPid(pid); // force again
    }
  }
  await sleep(600);
  clearLock();
}

if (await isPortOpen(3000)) {
  const leftover = pidsOnPort(3000);
  console.warn("");
  console.warn("WARNING: Port 3000 is still in use by another app.");
  if (leftover.length) {
    console.warn(`PIDs: ${leftover.join(", ")}`);
    console.warn(isWin ? `Run: taskkill /PID ${leftover[0]} /F` : `Run: kill -9 ${leftover[0]}`);
  }
  console.warn("");
} else if (killed.size) {
  console.log("Dev port 3000 is free — starting Next.js…");
}

process.exit(0);
