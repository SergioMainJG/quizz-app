import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import type { Database } from "../../src/config/drizzle/database.js";

export async function createTestDb() {
  const client = new PGlite();
  const db = drizzle({ client });
  await migrate(db, { migrationsFolder: fileURLToPath(new URL("../../drizzle", import.meta.url)) });
  return { db: db as unknown as Database, close: () => client.close() };
}
