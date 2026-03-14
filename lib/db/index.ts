/**
 * DB client: Node SQLite for local dev (next dev), D1 for Cloudflare Workers.
 * Use getDb() in API routes and server code so production uses the request's D1 binding.
 */
import Database from "better-sqlite3";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import * as fs from "fs";
import * as path from "path";
import * as schema from "./schema";

// Node SQLite (local dev)
let nodeDb: ReturnType<typeof drizzleSqlite<typeof schema>> | null = null;

function getNodeDb(): ReturnType<typeof drizzleSqlite<typeof schema>> {
  if (!nodeDb) {
    const dir = path.join(process.cwd(), ".data");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const dbPath = process.env.DATABASE_PATH ?? path.join(dir, "local.sqlite");
    const sqlite = new Database(dbPath);
    nodeDb = drizzleSqlite(sqlite, { schema });
  }
  return nodeDb;
}

export type Db = ReturnType<typeof getNodeDb>;

/** Use in API routes and server code. Returns D1-backed db on Cloudflare, SQLite locally. */
export function getDb(): Db {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    const { env } = getCloudflareContext();
    if (env?.DB) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { drizzle } = require("drizzle-orm/d1");
      return drizzle(env.DB, { schema }) as Db;
    }
  } catch {
    // Not on Cloudflare or binding missing
  }
  return getNodeDb();
}

/** Lazy default db: delegates to getDb() so we never touch fs at module load (Workers don't support fs). Prefer getDb() in request handlers. */
export const db = new Proxy({} as Db, {
  get(_, prop) {
    return (getDb() as unknown as Record<string, unknown>)[prop as string];
  },
});
