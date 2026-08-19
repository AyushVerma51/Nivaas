/**
 * Minimal migration runner. Applies every `.sql` file in `migrations/`
 * (lexicographic order) that hasn't been applied yet, each inside its own
 * transaction, tracked in the `schema_migrations` table.
 *
 * Usage: npm run db:migrate  (needs a reachable DATABASE_URL)
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { pool } from "./pool";

const MIGRATIONS_DIR = join(__dirname, "migrations");

async function migrate(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const { rows } = await pool.query<{ name: string }>(
    "SELECT name FROM schema_migrations",
  );
  const applied = new Set(rows.map((r) => r.name));

  let ran = 0;
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = await readFile(join(MIGRATIONS_DIR, file), "utf8");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log(`  ✓ applied ${file}`);
      ran += 1;
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`  ✗ failed ${file}:`, err);
      process.exitCode = 1;
      return;
    } finally {
      client.release();
    }
  }

  if (ran === 0) console.log("No pending migrations.");
  await pool.end();
}

migrate().catch((err) => {
  console.error("Migration run failed:", err);
  process.exitCode = 1;
});
