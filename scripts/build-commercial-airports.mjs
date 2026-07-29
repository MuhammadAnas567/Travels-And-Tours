import https from "https";
import fs from "fs";

const url = "https://davidmegginson.github.io/ourairports-data/airports.csv";

function parseCSVLine(line) {
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQ = !inQ;
      continue;
    }
    if (ch === "," && !inQ) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

https
  .get(url, (res) => {
    let data = "";
    res.on("data", (c) => {
      data += c;
    });
    res.on("end", () => {
      const lines = data.split(/\r?\n/);
      const cols = parseCSVLine(lines[0]);
      const idx = Object.fromEntries(cols.map((c, i) => [c, i]));
      const types = new Set(["large_airport", "medium_airport", "small_airport"]);
      const seen = new Set();
      const airports = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue;
        const row = parseCSVLine(lines[i]);
        const iata = (row[idx.iata_code] || "").trim().toUpperCase();
        const type = row[idx.type] || "";
        const scheduled = row[idx.scheduled_service] === "yes";
        if (!/^[A-Z]{3}$/.test(iata)) continue;
        if (!types.has(type)) continue;
        // Keep large/medium always; small only if scheduled commercial service.
        if (type === "small_airport" && !scheduled) continue;
        if (seen.has(iata)) continue;
        seen.add(iata);
        airports.push({
          code: iata,
          name: (row[idx.name] || "").trim(),
          city: (row[idx.municipality] || "").trim(),
          country: (row[idx.iso_country] || "").trim(),
          type: type.replace("_airport", ""),
        });
      }

      airports.sort((a, b) => a.code.localeCompare(b.code));
      fs.mkdirSync("lib/data", { recursive: true });
      fs.writeFileSync("lib/data/commercial-airports.json", JSON.stringify(airports));
      console.log("count", airports.length);
      console.log(
        "sample",
        airports.filter((a) => ["KHI", "DXB", "LHR", "JFK", "CDG", "SIN"].includes(a.code))
      );
    });
  })
  .on("error", (e) => {
    console.error(e);
    process.exit(1);
  });
