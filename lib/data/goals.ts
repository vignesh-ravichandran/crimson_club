/**
 * Server-only goals data. Used by goals page so we don't rely on fetch() to own API on Cloudflare.
 */
import { getDb } from "@/lib/db";
import { journeyParticipants, goals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { GoalResponse } from "@/lib/types/api";

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

export async function getGoal(
  journeyId: string,
  userId: string,
  goalType: "weekly" | "monthly",
  periodStart: string
): Promise<GoalResponse | null> {
  const isParticipant = await ensureParticipant(journeyId, userId);
  if (!isParticipant) return null;
  const db = getDb();
  const rows = await db
    .select()
    .from(goals)
    .where(
      and(
        eq(goals.journeyId, journeyId),
        eq(goals.userId, userId),
        eq(goals.goalType, goalType),
        eq(goals.periodStart, periodStart)
      )
    );
  const goal = rows[0] ?? null;
  return goal ? goalToResponse(goal) : null;
}
