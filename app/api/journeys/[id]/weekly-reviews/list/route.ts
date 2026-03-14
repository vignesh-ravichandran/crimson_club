/**
 * GET /api/journeys/[id]/weekly-reviews/list?limit= — list past reviews (reverse chronological). Contract: api-contracts §4.5, apis-and-modules §2.6.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDb, type Db } from "@/lib/db";
import { journeyParticipants, weeklyReviews } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireSession } from "@/lib/auth/require-session";
import type { ApiError, WeeklyReviewResponse } from "@/lib/types/api";

function jsonError(error: string, code?: string, status = 400) {
  return NextResponse.json({ error, code } as ApiError, { status });
}

async function ensureParticipant(
  db: Db,
  journeyId: string,
  userId: string
): Promise<boolean> {
  const rows = await db
    .select()
    .from(journeyParticipants)
    .where(
      and(
        eq(journeyParticipants.journeyId, journeyId),
        eq(journeyParticipants.userId, userId)
      )
  );
  if (rows.length === 0 || rows[0].leftAt != null) return false;
  return true;
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if ("response" in session) return session.response;
  const { user } = session;
  const { id: journeyId } = await params;
  const db = getDb();

  const isParticipant = await ensureParticipant(db, journeyId, user.id);
  if (!isParticipant) {
    return NextResponse.json(
      { error: "Journey not found" } as ApiError,
      { status: 404 }
    );
  }

  const limitParam = request.nextUrl.searchParams.get("limit");
  const parsed = limitParam ? parseInt(limitParam, 10) : 50;
  const limit = Number.isNaN(parsed) ? 50 : Math.min(100, Math.max(1, parsed));

  const rows = await db
    .select()
    .from(weeklyReviews)
    .where(
      and(
        eq(weeklyReviews.journeyId, journeyId),
        eq(weeklyReviews.userId, user.id)
      )
    )
    .orderBy(desc(weeklyReviews.weekStart))
    .limit(limit);

  const reviews: WeeklyReviewResponse[] = rows.map(reviewToResponse);
  return NextResponse.json({ reviews });
}
