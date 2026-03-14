/**
 * Drizzle schema for Crimson Club. Canonical design: docs/db/data-model.md.
 */
import {
  sqliteTable,
  text,
  integer,
  real,
  unique,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  publicDisplayName: text("public_display_name").notNull(),
  primaryJourneyId: text("primary_journey_id"),
  timezone: text("timezone").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const journeys = sqliteTable("journeys", {
  id: text("id").primaryKey(),
  creatorId: text("creator_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  emoji: text("emoji").notNull(),
  visibility: text("visibility").notNull(), // 'public' | 'private'
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  whyExists: text("why_exists"),
  successVision: text("success_vision"),
  whatMattersMost: text("what_matters_most"),
  whatShouldNotDistract: text("what_should_not_distract"),
  strengthsToPlayTo: text("strengths_to_play_to"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const journeyParticipants = sqliteTable("journey_participants", {
  id: text("id").primaryKey(),
  journeyId: text("journey_id")
    .notNull()
    .references(() => journeys.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  joinedAt: integer("joined_at", { mode: "timestamp_ms" }).notNull(),
  leftAt: integer("left_at", { mode: "timestamp_ms" }),
});

export const dimensions = sqliteTable("dimensions", {
  id: text("id").primaryKey(),
  journeyId: text("journey_id")
    .notNull()
    .references(() => journeys.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  emoji: text("emoji").notNull(),
  weight: real("weight").notNull(),
  isMandatory: integer("is_mandatory", { mode: "number" }).notNull(), // 0 | 1
  whyMatters: text("why_matters"),
  whatGoodLooksLike: text("what_good_looks_like"),
  howHelpsJourney: text("how_helps_journey"),
  strengthGuidance: text("strength_guidance"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const journeyVisibleLabels = sqliteTable("journey_visible_labels", {
  journeyId: text("journey_id")
    .primaryKey()
    .references(() => journeys.id, { onDelete: "cascade" }),
  labelMissed: text("label_missed").notNull(),
  labelLow: text("label_low").notNull(),
  labelMedium: text("label_medium").notNull(),
  labelHigh: text("label_high").notNull(),
  labelExcellent: text("label_excellent").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const dailyEntries = sqliteTable("daily_entries", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  journeyId: text("journey_id")
    .notNull()
    .references(() => journeys.id),
  date: text("date").notNull(),
  reflectionNote: text("reflection_note"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const dailyDimensionValues = sqliteTable("daily_dimension_values", {
  id: text("id").primaryKey(),
  dailyEntryId: text("daily_entry_id")
    .notNull()
    .references(() => dailyEntries.id, { onDelete: "cascade" }),
  dimensionId: text("dimension_id")
    .notNull()
    .references(() => dimensions.id),
  canonicalScale: integer("canonical_scale").notNull(),
});

export const journeyInvites = sqliteTable("journey_invites", {
  id: text("id").primaryKey(),
  journeyId: text("journey_id")
    .notNull()
    .references(() => journeys.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  token: text("token").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  usedAt: integer("used_at", { mode: "timestamp_ms" }),
});

// Goals: one weekly + one monthly per user per journey per period. Outcome editable 7 days after period_end.
export const goals = sqliteTable(
  "goals",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    journeyId: text("journey_id")
      .notNull()
      .references(() => journeys.id),
    goalType: text("goal_type").notNull(), // 'weekly' | 'monthly'
    periodStart: text("period_start").notNull(),
    periodEnd: text("period_end").notNull(),
    goalStatement: text("goal_statement"),
    outcome: integer("outcome"), // 0-5 canonical scale; nullable until set
    outcomeUpdatedAt: integer("outcome_updated_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => ({
    unqUserJourneyTypePeriod: unique().on(
      t.userId,
      t.journeyId,
      t.goalType,
      t.periodStart
    ),
  })
);

// Weekly reviews: one per user per journey per week (Monday = week_start).
export const weeklyReviews = sqliteTable(
  "weekly_reviews",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    journeyId: text("journey_id")
      .notNull()
      .references(() => journeys.id),
    weekStart: text("week_start").notNull(),
    done: integer("done", { mode: "number" }).notNull(), // 0 | 1
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => ({
    unqUserJourneyWeek: unique().on(t.userId, t.journeyId, t.weekStart),
  })
);

// Lessons: saved insights; optional dimension link. sourceType: daily_reflection | weekly_review.
export const lessons = sqliteTable("lessons", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  journeyId: text("journey_id")
    .notNull()
    .references(() => journeys.id),
  text: text("text").notNull(),
  sourceDate: text("source_date").notNull(),
  sourceType: text("source_type").notNull(),
  dimensionId: text("dimension_id").references(() => dimensions.id),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Journey = typeof journeys.$inferSelect;
export type JourneyParticipant = typeof journeyParticipants.$inferSelect;
export type Dimension = typeof dimensions.$inferSelect;
export type JourneyVisibleLabel = typeof journeyVisibleLabels.$inferSelect;
export type DailyEntry = typeof dailyEntries.$inferSelect;
export type DailyDimensionValue = typeof dailyDimensionValues.$inferSelect;
export type JourneyInvite = typeof journeyInvites.$inferSelect;
export type Goal = typeof goals.$inferSelect;
export type WeeklyReview = typeof weeklyReviews.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
