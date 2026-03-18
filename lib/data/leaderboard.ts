/**
 * Server-only leaderboard data. Used by leaderboard page so we don't rely on fetch() to own API on Cloudflare.
 */
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
import { periodRange, scoreFactorForCanonicalScale, compareISODate } from "@/lib/date-utils";
import type { LeaderboardRanking } from "@/lib/types/api";

interface ParticipantScore {
  userId: string;
  displayName: string;
  joinedAt: Date;
  totalScoreEarned: number;
  totalBestPossible: number;
  missedMandatoryCount: number;
}

export async function getLeaderboard(
  journeyId: string,
  userId: string,
  period: "weekly" | "monthly",
  periodStart: string,
  timezone: string
): Promise<LeaderboardRanking[]> {
  const db = getDb();

  const journeyRows = await db
    .select()
    .from(journeys)
    .where(eq(journeys.id, journeyId))
    .limit(1);
  const journey = journeyRows[0];
  if (!journey) return [];

  const { start: periodStartDate, end: periodEndDate } = periodRange(
    period,
    periodStart,
    timezone
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

  return rankings;
}
