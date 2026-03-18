/**
 * Server-only weekly reviews data. Used by weekly-reviews list page so we don't rely on fetch() to own API on Cloudflare.
 */
import { getDb } from "@/lib/db";
import { journeyParticipants, weeklyReviews } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { WeeklyReviewResponse } from "@/lib/types/api";

async function ensureParticipant(
  journeyId: string,
  userId: string
): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select()
    .from(journeyParticipants)
    .where(
      and(
        eq(journeyParticipants.journeyId, journeyId),
        eq(journeyParticipants.userId, userId)
      )
  );
  return rows.length > 0 && rows[0].leftAt == null;
}

function reviewToResponse(row: {
  id: string;
  userId: string;
  journeyId: string;
  weekStart: string;
  done: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}): WeeklyReviewResponse {
  return {
    id: row.id,
    userId: row.userId,
    journeyId: row.journeyId,
    weekStart: row.weekStart,
    done: row.done === 1,
    notes: row.notes ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getWeeklyReviewsList(
  journeyId: string,
  userId: string,
  limit = 50
): Promise<WeeklyReviewResponse[]> {
  const isParticipant = await ensureParticipant(journeyId, userId);
  if (!isParticipant) return [];

  const db = getDb();
  const capped = Math.min(100, Math.max(1, limit));
  const rows = await db
    .select()
    .from(weeklyReviews)
    .where(
      and(
        eq(weeklyReviews.journeyId, journeyId),
        eq(weeklyReviews.userId, userId)
      )
    )
    .orderBy(desc(weeklyReviews.weekStart))
    .limit(capped);

  return rows.map(reviewToResponse);
}
