/**
 * GET /api/journeys/[id]/weekly-reviews?weekStart=YYYY-MM-DD — review or null.
 * PUT /api/journeys/[id]/weekly-reviews — upsert. Body: { weekStart, done, notes? }. Contract: api-contracts §4.5.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDb, type Db } from "@/lib/db";
import {
  journeyParticipants,
  weeklyReviews,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireSession } from "@/lib/auth/require-session";
import type {
  ApiError,
  WeeklyReviewResponse,
  PutWeeklyReviewBody,
} from "@/lib/types/api";
import crypto from "crypto";

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
  const weekStart = request.nextUrl.searchParams.get("weekStart");
  if (!weekStart || !/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
    return jsonError("Query weekStart=YYYY-MM-DD required", "VALIDATION", 400);
  }

  const isParticipant = await ensureParticipant(db, journeyId, user.id);
  if (!isParticipant) {
    return NextResponse.json(
      { error: "Journey not found" } as ApiError,
      { status: 404 }
    );
  }

  const rows = await db
    .select()
    .from(weeklyReviews)
    .where(
      and(
        eq(weeklyReviews.journeyId, journeyId),
        eq(weeklyReviews.userId, user.id),
        eq(weeklyReviews.weekStart, weekStart)
      )
  );
  const review = rows[0] ?? null;
  const reviewResponse: WeeklyReviewResponse | null = review
    ? reviewToResponse(review)
    : null;
  return NextResponse.json({ review: reviewResponse });
}

export async function PUT(
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", "VALIDATION", 400);
  }
  const b = body as PutWeeklyReviewBody;
  if (
    !b.weekStart ||
    !/^\d{4}-\d{2}-\d{2}$/.test(b.weekStart) ||
    typeof b.done !== "boolean"
  ) {
    return jsonError(
      "weekStart (YYYY-MM-DD) and done (boolean) required",
      "VALIDATION",
      400
    );
  }

  const now = new Date();
  const existing = await db
    .select()
    .from(weeklyReviews)
    .where(
      and(
        eq(weeklyReviews.journeyId, journeyId),
        eq(weeklyReviews.userId, user.id),
        eq(weeklyReviews.weekStart, b.weekStart)
      )
  );

  if (existing.length > 0) {
    await db
      .update(weeklyReviews)
      .set({
        done: b.done ? 1 : 0,
        notes: b.notes?.trim() ?? existing[0].notes,
        updatedAt: now,
      })
      .where(eq(weeklyReviews.id, existing[0].id));
    const updated = await db
      .select()
      .from(weeklyReviews)
      .where(eq(weeklyReviews.id, existing[0].id))
      .limit(1);
    return NextResponse.json({
      review: reviewToResponse(updated[0]!),
    });
  }

  const id = crypto.randomUUID();
  await db.insert(weeklyReviews).values({
    id,
    userId: user.id,
    journeyId,
    weekStart: b.weekStart,
    done: b.done ? 1 : 0,
    notes: b.notes?.trim() || null,
    createdAt: now,
    updatedAt: now,
  });
  const inserted = await db
    .select()
    .from(weeklyReviews)
    .where(eq(weeklyReviews.id, id))
    .limit(1);
  return NextResponse.json({ review: reviewToResponse(inserted[0]!) });
}
