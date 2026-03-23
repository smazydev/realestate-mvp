#!/usr/bin/env node
/**
 * Fetches the 1000 largest US cities JSON and writes lib/data/us-cities.ts
 * Run: node scripts/generate-us-cities.js
 */
const fs = require("fs");
const path = require("path");

const STATE_TO_ABBR = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA",
  Colorado: "CO", Connecticut: "CT", Delaware: "DE", "District of Columbia": "DC",
  Florida: "FL", Georgia: "GA", Hawaii: "HI", Idaho: "ID", Illinois: "IL",
  Indiana: "IN", Iowa: "IA", Kansas: "KS", Kentucky: "KY", Louisiana: "LA",
  Maine: "ME", Maryland: "MD", Massachusetts: "MA", Michigan: "MI", Minnesota: "MN",
  Mississippi: "MS", Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
  "North Carolina": "NC", "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK",
  Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT",
  Virginia: "VA", Washington: "WA", "West Virginia": "WV", Wisconsin: "WI", Wyoming: "WY",
};

const url = "https://gist.githubusercontent.com/fasterthanlime/52664aadaf55fec2ffd280969c028cfc/raw/cities.json";

async function main() {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const data = await res.json();
  const out = [];
  out.push("/** US cities (top ~1000 by population). Use for Filter dropdown and buyer target city. */");
  out.push("");
  out.push("export type USCity = { city: string; state: string };");
  out.push("");
  out.push("const US_CITIES: USCity[] = [");
  for (const row of data) {
    const state = STATE_TO_ABBR[row.state] || row.state;
    const city = (row.city || "").replace(/"/g, '\\"');
    out.push(`  { city: "${city}", state: "${state}" },`);
  }
  out.push("];");
  out.push("");
  out.push("export { US_CITIES };");
  out.push("");
  out.push("/** Sorted \"City, ST\" for dropdowns. */");
  out.push("export function getUSCityOptions(): string[] {");
  out.push("  return US_CITIES.map((c) => `${c.city}, ${c.state}`).sort();");
  out.push("}");
  out.push("");
  out.push("/** Normalize city param (e.g. \"Springfield, MA\" -> \"springfield\") for DB matching. */");
  out.push("export function cityParamToFilterValue(param: string | null | undefined): string {");
  out.push("  if (!param?.trim()) return \"\";");
  out.push("  const s = param.trim();");
  out.push("  const cityPart = s.includes(\",\") ? s.split(\",\")[0].trim() : s;");
  out.push("  return cityPart.toLowerCase();");
  out.push("}");
  const dir = path.join(__dirname, "..", "lib", "data");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "us-cities.ts"), out.join("\n"));
  console.log("Wrote lib/data/us-cities.ts with", data.length, "cities");
}

main().catch((e) => { console.error(e); process.exit(1); });
