import { Pool } from "pg";
import { config } from "../config";

/** Shared connection pool. pg connects lazily, so the server can boot without a DB. */
export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
});

export async function checkDb(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
