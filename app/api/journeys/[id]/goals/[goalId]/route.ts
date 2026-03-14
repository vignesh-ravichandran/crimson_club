/**
 * PATCH /api/journeys/[id]/goals/[goalId] — set outcome (0–5). 7-day edit window after periodEnd (user TZ). Contract: api-contracts §4.4.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDb, type Db } from "@/lib/db";
import { journeyParticipants, goals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireSession } from "@/lib/auth/require-session";
import { isWithinOutcomeEditWindow } from "@/lib/date-utils";
import type { ApiError, GoalResponse, PatchGoalBody } from "@/lib/types/api";

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; goalId: string }> }
) {
  const session = await requireSession();
  if ("response" in session) return session.response;
  const { user } = session;
  const { id: journeyId, goalId } = await params;
  const db = getDb();

  const isParticipant = await ensureParticipant(db, journeyId, user.id);
  if (!isParticipant) {
    return NextResponse.json(
      { error: "Journey not found" } as ApiError,
      { status: 404 }
    );
  }

  const goalRows = await db
    .select()
    .from(goals)
    .where(
      and(
        eq(goals.id, goalId),
        eq(goals.journeyId, journeyId),
        eq(goals.userId, user.id)
      )
  );
  const goal = goalRows[0];
  if (!goal) {
    return NextResponse.json(
      { error: "Goal not found" } as ApiError,
      { status: 404 }
    );
  }

  if (!isWithinOutcomeEditWindow(goal.periodEnd, user.timezone)) {
    return jsonError(
      "Outcome can only be edited within 7 days after the period end",
      "VALIDATION",
      400
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", "VALIDATION", 400);
  }
  const b = body as PatchGoalBody;
  const outcome = Number(b.outcome);
  if (!Number.isInteger(outcome) || outcome < 0 || outcome > 5) {
    return jsonError("outcome must be 0–5", "VALIDATION", 400);
  }

  const now = new Date();
  await db
    .update(goals)
    .set({
      outcome,
      outcomeUpdatedAt: now,
      updatedAt: now,
    })
    .where(eq(goals.id, goalId));

  const updated = await db
    .select()
    .from(goals)
    .where(eq(goals.id, goalId))
    .limit(1);
  const row = updated[0]!;
  return NextResponse.json({ goal: goalToResponse(row) });
}
