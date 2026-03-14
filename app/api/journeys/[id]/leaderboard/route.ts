/**
 * GET /api/journeys/[id]/leaderboard?period=weekly|monthly&periodStart=YYYY-MM-DD
 * Ranked list by normalized score %; only participants with ≥1 entry in period. Contract: api-contracts §4.7.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  journeys,
  journeyParticipants,
  users,
  dailyEntries,
  dailyDimensionValues,
  dimensions,
} from "@/lib/db/schema";
import { eq, and, isNull, gte, lte, inArray } from "drizzle-orm";
import { requireSession } from "@/lib/auth/require-session";
import { periodRange, scoreFactorForCanonicalScale, compareISODate } from "@/lib/date-utils";
import type { ApiError, LeaderboardResponse, LeaderboardRanking } from "@/lib/types/api";

function jsonError(error: string, code?: string, status = 400) {
  return NextResponse.json({ error, code } as ApiError, { status });
}

interface ParticipantScore {
  userId: string;
  displayName: string;
  joinedAt: Date;
  totalScoreEarned: number;
  totalBestPossible: number;
  missedMandatoryCount: number;
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

  const period = request.nextUrl.searchParams.get("period");
  const periodStart = request.nextUrl.searchParams.get("periodStart");
  if (period !== "weekly" && period !== "monthly") {
    return jsonError("Query period=weekly|monthly required", "VALIDATION", 400);
  }
  if (!periodStart || !/^\d{4}-\d{2}-\d{2}$/.test(periodStart)) {
    return jsonError("Query periodStart=YYYY-MM-DD required", "VALIDATION", 400);
  }

  const journeyRows = await db
    .select()
    .from(journeys)
    .where(eq(journeys.id, journeyId))
    .limit(1);
  const journey = journeyRows[0];
  if (!journey) {
    return NextResponse.json(
      { error: "Journey not found", code: "NOT_FOUND" } as ApiError,
      { status: 404 }
    );
  }

  const { start: periodStartDate, end: periodEndDate } = periodRange(
    period,
    periodStart,
    user.timezone
  );

  const participants = await db
    .select({
      userId: journeyParticipants.userId,
      joinedAt: journeyParticipants.joinedAt,
    })
    .from(journeyParticipants)
    .where(
      and(
        eq(journeyParticipants.journeyId, journeyId),
        isNull(journeyParticipants.leftAt)
      )
  );

  const journeyDims = await db
    .select({ id: dimensions.id, weight: dimensions.weight, isMandatory: dimensions.isMandatory })
    .from(dimensions)
    .where(eq(dimensions.journeyId, journeyId));

  const allUserIds = participants.map((p) => p.userId);
  const userList =
    allUserIds.length > 0
      ? await db
          .select({ id: users.id, publicDisplayName: users.publicDisplayName })
          .from(users)
          .where(inArray(users.id, allUserIds))
      : [];
  const userMap = Object.fromEntries(
    userList.map((u) => [u.id, u])
  );

  const scores: ParticipantScore[] = [];

  for (const p of participants) {
    const joinedAt = p.joinedAt;
    const joinedDateStr =
      joinedAt instanceof Date
        ? joinedAt.toISOString().slice(0, 10)
        : new Date(joinedAt).toISOString().slice(0, 10);
    const effectiveStart =
      compareISODate(periodStartDate, joinedDateStr) > 0
        ? periodStartDate
        : joinedDateStr;

    const entries = await db
      .select({ id: dailyEntries.id, date: dailyEntries.date })
      .from(dailyEntries)
      .where(
        and(
          eq(dailyEntries.journeyId, journeyId),
          eq(dailyEntries.userId, p.userId),
          gte(dailyEntries.date, effectiveStart),
          lte(dailyEntries.date, periodEndDate)
        )
      );

    if (entries.length === 0) continue;

    let totalScoreEarned = 0;
    let missedMandatoryCount = 0;

    for (const entry of entries) {
      const values = await db
        .select({
          dimensionId: dailyDimensionValues.dimensionId,
          canonicalScale: dailyDimensionValues.canonicalScale,
        })
        .from(dailyDimensionValues)
        .where(eq(dailyDimensionValues.dailyEntryId, entry.id));

      const dimMap = Object.fromEntries(
        journeyDims.map((d) => [d.id, d])
      );
      for (const v of values) {
        const dim = dimMap[v.dimensionId];
        if (!dim) continue;
        const factor = scoreFactorForCanonicalScale(v.canonicalScale);
        totalScoreEarned += dim.weight * factor;
        if (v.canonicalScale === 1 && dim.isMandatory) {
          missedMandatoryCount += 1;
        }
      }
    }

    const numDays = entries.length;
    const totalBestPossible = numDays * 100;

    scores.push({
      userId: p.userId,
      displayName: (userMap[p.userId]?.publicDisplayName ?? "Unknown") as string,
      joinedAt: joinedAt instanceof Date ? joinedAt : new Date(joinedAt),
      totalScoreEarned,
      totalBestPossible,
      missedMandatoryCount,
    });
  }

  const sorted = scores
    .map((s) => ({
      ...s,
      scorePercentage:
        s.totalBestPossible > 0
          ? (s.totalScoreEarned / s.totalBestPossible) * 100
          : 0,
    }))
    .sort((a, b) => {
      if (b.scorePercentage !== a.scorePercentage) {
        return b.scorePercentage - a.scorePercentage;
      }
      if (b.totalScoreEarned !== a.totalScoreEarned) {
        return b.totalScoreEarned - a.totalScoreEarned;
      }
      if (a.missedMandatoryCount !== b.missedMandatoryCount) {
        return a.missedMandatoryCount - b.missedMandatoryCount;
      }
      return a.joinedAt.getTime() - b.joinedAt.getTime();
    });

  const rankings: LeaderboardRanking[] = sorted.map((s, i) => ({
    rank: i + 1,
    userId: s.userId,
    displayName: s.displayName,
    scorePercentage: Math.round(s.scorePercentage * 10) / 10,
    rawScore: Math.round(s.totalScoreEarned * 10) / 10,
    trend: undefined,
  }));

  const response: LeaderboardResponse = { rankings };
  return NextResponse.json(response);
}
