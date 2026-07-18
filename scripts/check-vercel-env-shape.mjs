import { readFileSync, existsSync, unlinkSync } from "node:fs";

const path = ".env.vercel.check";
if (!existsSync(path)) {
  console.error("missing .env.vercel.check — run vercel env pull first");
  process.exit(1);
}

const text = readFileSync(path, "utf8");
function get(key) {
  const m = text.match(new RegExp(`^${key}=(.*)$`, "m"));
  if (!m) return "";
  return m[1].replace(/^"|"$/g, "").replace(/^'|'$/g, "");
}

function shape(label, value) {
  const chars = [...value];
  return {
    label,
    len: value.length,
    empty: value.length === 0,
    allStars: /^\*+$/.test(value),
    isEncryptedLiteral: value === "Encrypted",
    startsAt: value.startsWith("@"),
    startsHttp: /^https?:\/\//.test(value),
    startsMongo: value.startsWith("mongodb"),
    onlyWord: /^[A-Za-z0-9_-]+$/.test(value),
    hasSlash: value.includes("/"),
    hasColon: value.includes(":"),
    hasAt: value.includes("@"),
    hasDot: value.includes("."),
    firstClass:
      value.length === 0
        ? "empty"
        : /[A-Za-z]/.test(value[0])
          ? "letter"
          : /\d/.test(value[0])
            ? "digit"
            : "other",
    uniqueCharCount: new Set(chars).size,
  };
}

const keys = [
  "AUTH_URL",
  "AUTH_SECRET",
  "DATABASE_URL",
  "MONGODB_URI",
  "NEXT_PUBLIC_APP_URL",
];

console.log(JSON.stringify(keys.map((k) => shape(k, get(k))), null, 2));
unlinkSync(path);
