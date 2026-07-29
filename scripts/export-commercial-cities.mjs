import { writeFileSync } from "fs";
import data from "../lib/data/commercial-airports.json" with { type: "json" };

const POPULAR = [
  "KHI",
  "LHE",
  "ISB",
  "PEW",
  "DXB",
  "AUH",
  "DOH",
  "JED",
  "RUH",
  "IST",
  "LHR",
  "JFK",
  "KUL",
  "BKK",
];

const airports = data;
const byCity = new Map();

for (const a of airports) {
  const city = (a.city || "").split("(")[0].trim();
  if (!city) continue;
  const key = `${city.toLowerCase()}|${a.country}`;
  const cur = byCity.get(key) ?? { city, country: a.country, codes: [] };
  if (!cur.codes.includes(a.code)) cur.codes.push(a.code);
  byCity.set(key, cur);
}

const rows = [...byCity.values()].sort(
  (a, b) => a.city.localeCompare(b.city) || a.country.localeCompare(b.country)
);

const lines = rows.map(
  (r) => `${r.city} (${r.country}) - ${r.codes.sort().join(", ")}`
);

writeFileSync("lib/data/commercial-cities.txt", `${lines.join("\n")}\n`);
writeFileSync(
  "lib/data/commercial-cities.json",
  `${JSON.stringify(
    rows.map((r) => ({ city: r.city, country: r.country, airports: r.codes.sort() })),
    null,
    2
  )}\n`
);

const popular = POPULAR.map((code) => {
  const a = airports.find((x) => x.code === code);
  const city = (a?.city || "").split("(")[0].trim();
  return city ? `${city} (${code})` : code;
});

console.log(
  JSON.stringify(
    {
      uniqueCityCountryPairs: rows.length,
      uniqueCityNames: new Set(rows.map((r) => r.city.toLowerCase())).size,
      airports: airports.length,
      popularOnFocus: popular,
      files: ["lib/data/commercial-cities.txt", "lib/data/commercial-cities.json"],
    },
    null,
    2
  )
);
