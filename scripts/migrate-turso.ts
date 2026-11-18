import { createClient } from "@libsql/client";
import { readFile } from "node:fs/promises";
import path from "node:path";

async function main() {
  const url = process.env.TURSO_DB_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error("Missing Turso credentials");
  }

  const db = createClient({
    url,
    authToken,
  });

  const migrationPath = path.join(
  process.cwd(),
  "src",
  "data",
  "db",
  "migrations",
  "001_ticket_analysis.sql",
);

  const sql = await readFile(migrationPath, "utf8");

  const statements = sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await db.execute(statement);
  }

  console.log("Turso migration completed successfully");
}

main().catch((error) => {
  console.error("[TURSO_MIGRATION_ERROR]", error);
  process.exitCode = 1;
});