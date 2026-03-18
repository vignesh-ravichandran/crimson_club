/**
 * Server-only lessons data. Used by lessons page so we don't rely on fetch() to own API on Cloudflare.
 */
import { getDb } from "@/lib/db";
import { journeyParticipants, lessons } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { LessonResponse } from "@/lib/types/api";

const VALID_SOURCE_TYPES = ["daily_reflection", "weekly_review"] as const;

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

function lessonToResponse(row: {
  id: string;
  userId: string;
  journeyId: string;
  text: string;
  sourceDate: string;
  sourceType: string;
  dimensionId: string | null;
  createdAt: Date;
}): LessonResponse {
  return {
    id: row.id,
    userId: row.userId,
    journeyId: row.journeyId,
    text: row.text,
    sourceDate: row.sourceDate,
    sourceType: row.sourceType,
    dimensionId: row.dimensionId ?? undefined,
    createdAt: row.createdAt,
  };
}

export async function getLessons(
  journeyId: string,
  userId: string,
  dimensionId?: string,
  sourceType?: string
): Promise<LessonResponse[]> {
  const isParticipant = await ensureParticipant(journeyId, userId);
  if (!isParticipant) return [];

  const db = getDb();
  let rows = await db
    .select()
    .from(lessons)
    .where(
      and(
        eq(lessons.journeyId, journeyId),
        eq(lessons.userId, userId)
      )
    )
    .orderBy(desc(lessons.createdAt));

  if (dimensionId?.trim()) {
    rows = rows.filter((r) => r.dimensionId === dimensionId);
  }
  if (sourceType?.trim() && VALID_SOURCE_TYPES.includes(sourceType as (typeof VALID_SOURCE_TYPES)[number])) {
    rows = rows.filter((r) => r.sourceType === sourceType);
  }
  return rows.map(lessonToResponse);
}
