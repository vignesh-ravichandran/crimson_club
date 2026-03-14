/**
 * DB client for local dev (Node). Uses SQLite file at .data/local.sqlite.
 * Migrations: run `npm run db:push:local` once, or `wrangler d1 migrations apply` for D1.
 * In production (Cloudflare), use D1 binding; this file is for next dev only.
 */
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as fs from "fs";
import * as path from "path";
import * as schema from "./schema";

const dir = path.join(process.cwd(), ".data");
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH ?? path.join(dir, "local.sqlite");
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

export { db };
export type Db = typeof db;
