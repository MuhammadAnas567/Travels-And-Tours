#!/usr/bin/env node
/**
 * Ensures prisma generate works on Vercel even if DATABASE_URL
 * is briefly unavailable during postinstall.
 */
import { spawnSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "mongodb://127.0.0.1:27017/travels-tours?directConnection=true";
  console.warn(
    "[postinstall] DATABASE_URL missing — using placeholder for prisma generate only"
  );
}

const result = spawnSync("npx", ["prisma", "generate"], {
  stdio: "inherit",
  env: process.env,
  shell: true,
});

process.exit(result.status ?? 1);
