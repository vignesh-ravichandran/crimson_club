#!/usr/bin/env node
/**
 * Seed test data: one user (test@example.com / password123), one journey with 3 dimensions,
 * and 14 days of daily entries so Insights charts have data. Uses local SQLite.
 * Run: node scripts/seed-test-data.mjs
 * Then sign in at http://localhost:3000 (or your dev port) as test@example.com / password123
 */
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

const dir = join(process.cwd(), ".data");
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
const dbPath = process.env.DATABASE_PATH || join(dir, "local.sqlite");
const db = new Database(dbPath);

const TZ = "America/New_York";
function todayInTimezone() {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return f.format(new Date()).replace(/-/g, "-");
}
function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + n);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

const now = Date.now();
let userId = randomUUID();
const journeyId = randomUUID();
const dimIds = [randomUUID(), randomUUID(), randomUUID()];

// Remove existing test user data so we can re-seed (delete in safe order: entries -> participant -> dimensions/labels -> journey -> sessions -> user)
const existing = db.prepare("SELECT id FROM users WHERE email = 'test@example.com'").get();
if (existing) {
  userId = existing.id;
  const journeys = db.prepare("SELECT id FROM journeys WHERE creator_id = ?").all(userId);
  journeys.forEach((j) => {
    db.prepare("DELETE FROM daily_dimension_values WHERE daily_entry_id IN (SELECT id FROM daily_entries WHERE journey_id = ?)").run(j.id);
    db.prepare("DELETE FROM daily_entries WHERE journey_id = ?").run(j.id);
    db.prepare("DELETE FROM journey_participants WHERE journey_id = ?").run(j.id);
    db.prepare("DELETE FROM dimensions WHERE journey_id = ?").run(j.id);
    db.prepare("DELETE FROM journey_visible_labels WHERE journey_id = ?").run(j.id);
    db.prepare("DELETE FROM journeys WHERE id = ?").run(j.id);
  });
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
  db.prepare("UPDATE users SET primary_journey_id = NULL, updated_at = ? WHERE id = ?").run(now, userId);
}

// User (insert new or update existing)
if (!existing) {
  db.prepare(`
    INSERT INTO users (id, email, password_hash, public_display_name, primary_journey_id, timezone, created_at, updated_at)
    VALUES (?, 'test@example.com', ?, 'Test User', ?, '${TZ}', ${now}, ${now})
  `).run(userId, bcrypt.hashSync("password123", 10), journeyId);
} else {
  db.prepare("UPDATE users SET primary_journey_id = ?, updated_at = ?, password_hash = ? WHERE id = ?").run(journeyId, now, bcrypt.hashSync("password123", 10), userId);
}

// Journey
db.prepare(`
  INSERT INTO journeys (id, creator_id, name, description, emoji, visibility, start_date, end_date, created_at, updated_at)
  VALUES (?, ?, 'Test Journey', 'For testing charts and insights', '📊', 'public', ?, NULL, ${now}, ${now})
`).run(journeyId, userId, addDays(todayInTimezone(), -14));

// Dimensions (34, 33, 33)
const dims = [
  { id: dimIds[0], name: "Focus", emoji: "🎯", weight: 34, pos: 0 },
  { id: dimIds[1], name: "Movement", emoji: "🏃", weight: 33, pos: 1 },
  { id: dimIds[2], name: "Rest", emoji: "😴", weight: 33, pos: 2 },
];
dims.forEach((d) => {
  db.prepare(`
    INSERT INTO dimensions (id, journey_id, position, name, description, emoji, weight, is_mandatory, created_at)
    VALUES (?, ?, ?, ?, NULL, ?, ?, 0, ${now})
  `).run(d.id, journeyId, d.pos, d.name, d.emoji, d.weight);
});

// Visible labels
db.prepare(`
  INSERT INTO journey_visible_labels (journey_id, label_missed, label_low, label_medium, label_high, label_excellent, updated_at)
  VALUES (?, 'Missed', 'Showed up', 'Progressed', 'Built', 'Conquered', ${now})
`).run(journeyId);

// Participant
db.prepare(`
  INSERT INTO journey_participants (id, journey_id, user_id, joined_at, left_at)
  VALUES (?, ?, ?, ${now}, NULL)
`).run(randomUUID(), journeyId, userId);

// 14 days of daily entries with varying scores (2–5 so chart looks good)
const today = todayInTimezone();
for (let i = 0; i < 14; i++) {
  const date = addDays(today, -13 + i);
  const entryId = randomUUID();
  db.exec(`
    INSERT OR REPLACE INTO daily_entries (id, user_id, journey_id, date, reflection_note, created_at, updated_at)
    VALUES ('${entryId}', '${userId}', '${journeyId}', '${date}', NULL, ${now}, ${now})
  `);
  // Vary scale 2–5 per dimension so trend and radar look interesting
  const s1 = 2 + (i % 4);
  const s2 = 2 + ((i + 1) % 4);
  const s3 = 2 + ((i + 2) % 4);
  dimIds.forEach((dimId, idx) => {
    const scale = [s1, s2, s3][idx];
    db.exec(`
      INSERT INTO daily_dimension_values (id, daily_entry_id, dimension_id, canonical_scale)
      VALUES ('${randomUUID()}', '${entryId}', '${dimId}', ${scale})
    `);
  });
}

console.log("Seed done.");
console.log("  User: test@example.com / password123");
console.log("  Journey: Test Journey (id:", journeyId, ")");
console.log("  14 days of daily entries added. Sign in and open Insights to see charts.");

db.close();
