/**
 * GET /api/journeys/[id]/goals?goalType=weekly|monthly&periodStart=YYYY-MM-DD — goal or null.
 * POST /api/journeys/[id]/goals — create goal. User must be participant. Contract: api-contracts §4.4.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  journeyParticipants,
  goals,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireSession } from "@/lib/auth/require-session";
import type {
  ApiError,
  GoalResponse,
  PostGoalBody,
} from "@/lib/types/api";
import crypto from "crypto";

function jsonError(error: string, code?: string, status = 400) {
  return NextResponse.json({ error, code } as ApiError, { status });
}

async function ensureParticipant(
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

function goalToResponse(row: {
  id: string;
  userId: string;
  journeyId: string;
  goalType: string;
  periodStart: string;
  periodEnd: string;
  goalStatement: string | null;
  outcome: number | null;
  outcomeUpdatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): GoalResponse {
  return {
    id: row.id,
    userId: row.userId,
    journeyId: row.journeyId,
    goalType: row.goalType,
    periodStart: row.periodStart,
    periodEnd: row.periodEnd,
    goalStatement: row.goalStatement ?? undefined,
    outcome: row.outcome ?? undefined,
    outcomeUpdatedAt: row.outcomeUpdatedAt ?? undefined,
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
  const goalType = request.nextUrl.searchParams.get("goalType");
  const periodStart = request.nextUrl.searchParams.get("periodStart");
  if (
    !goalType ||
    !periodStart ||
    !/^(weekly|monthly)$/.test(goalType) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(periodStart)
  ) {
    return jsonError(
      "Query goalType=weekly|monthly and periodStart=YYYY-MM-DD required",
      "VALIDATION",
      400
    );
  }

  const isParticipant = await ensureParticipant(journeyId, user.id);
  if (!isParticipant) {
    return NextResponse.json(
      { error: "Journey not found" } as ApiError,
      { status: 404 }
    );
  }

  const rows = await db
    .select()
    .from(goals)
    .where(
      and(
        eq(goals.journeyId, journeyId),
        eq(goals.userId, user.id),
        eq(goals.goalType, goalType),
        eq(goals.periodStart, periodStart)
      )
  );
  const goal = rows[0] ?? null;
  const goalResponse: GoalResponse | null = goal
    ? goalToResponse(goal)
    : null;
  return NextResponse.json({ goal: goalResponse });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if ("response" in session) return session.response;
  const { user } = session;
  const { id: journeyId } = await params;

  const isParticipant = await ensureParticipant(journeyId, user.id);
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
  const b = body as PostGoalBody;
  if (
    !b.goalType ||
    !/^(weekly|monthly)$/.test(b.goalType) ||
    !b.periodStart ||
    !/^\d{4}-\d{2}-\d{2}$/.test(b.periodStart) ||
    !b.periodEnd ||
    !/^\d{4}-\d{2}-\d{2}$/.test(b.periodEnd)
  ) {
    return jsonError(
      "goalType (weekly|monthly), periodStart and periodEnd (YYYY-MM-DD) required",
      "VALIDATION",
      400
    );
  }

  const id = crypto.randomUUID();
  const now = new Date();
  try {
    await db.insert(goals).values({
      id,
      userId: user.id,
      journeyId,
      goalType: b.goalType,
      periodStart: b.periodStart,
      periodEnd: b.periodEnd,
      goalStatement: b.goalStatement?.trim() || null,
      createdAt: now,
      updatedAt: now,
    });
  } catch (err) {
    return jsonError(
      "Goal already exists for this period or invalid data",
      "VALIDATION",
      400
    );
  }
  return NextResponse.json({ id }, { status: 201 });
}
