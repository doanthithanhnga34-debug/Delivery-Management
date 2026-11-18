

import { createClient } from "@libsql/client";

async function main() {
  const url = process.env.TURSO_DB_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error("Missing Turso credentials");
  }

  const db = createClient({ url, authToken });

  const result = await db.execute(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
      AND name = 'ticket_analysis'
  `);

  if (result.rows.length === 0) {
    throw new Error(
      "Chưa tìm thấy bảng ticket_analysis. Hãy chạy migration.",
    );
  }

  console.log("Turso connected successfully");
  console.log("Table ticket_analysis exists");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});