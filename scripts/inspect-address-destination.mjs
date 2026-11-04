import fs from "node:fs";
import path from "node:path";

const directory = path.join(process.cwd(), "src/data/addresses");

const files = [
  "ward-merge-history.json",
  "wards-legacy.json",
  "districts-legacy.json",
  "wards.json",
];

for (const filename of files) {
  const filePath = path.join(directory, filename);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const rows = Array.isArray(data)
    ? data
    : Array.isArray(data.data)
      ? data.data
      : null;
  console.log(`\n${filename}`);

  console.log("Root type:", Array.isArray(data) ? "array" : typeof data);
  console.log("Root keys:", Object.keys(data).slice(0, 20));
  console.log("Total records:", rows?.length ?? "Unknown");

  if (rows?.length) {
    console.log("Record fields:", Object.keys(rows[0]));
    console.log("Sample:", JSON.stringify(rows[0], null, 2));
  }
}
