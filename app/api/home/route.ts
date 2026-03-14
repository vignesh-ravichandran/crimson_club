/**
 * GET /api/home — aggregated payload for Home screen. Requires session. Contract: api-contracts §4.8.
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  journeys,
  journeyParticipants,
  dailyEntries,
  dailyDimensionValues,
  weeklyReviews,
} from "@/lib/db/schema";
import { eq, and, isNull, inArray } from "drizzle-orm";
import { requireSession } from "@/lib/auth/require-session";
import { todayInTimezone, weekStartForDate } from "@/lib/date-utils";
import type {
  ApiError,
  HomeResponse,
  JourneySummary,
  PrimaryTodayState,
  PendingWeeklyReview,
} from "@/lib/types/api";
import type { DimensionValueResponse } from "@/lib/types/api";

function addDays(iso: string, delta: number): string {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  const session = await requireSession();
  if ("response" in session) return session.response;
  const { user } = session;

  const tz = user.timezone;
  const today = todayInTimezone(tz);
  const weekStart = weekStartForDate(today, tz);

  const participants = await db
    .select({ journeyId: journeyParticipants.journeyId })
    .from(journeyParticipants)
    .where(
      and(
        eq(journeyParticipants.userId, user.id),
        isNull(journeyParticipants.leftAt)
      )
    );
  const journeyIds = participants.map((p) => p.journeyId);
  if (journeyIds.length === 0) {
    const response: HomeResponse = {
      primaryJourney: null,
      primaryTodayState: null,
      otherJourneys: [],
      pendingBackfillCount: 0,
      pendingWeeklyReviews: [],
    };
    return NextResponse.json(response);
  }

  const activeJourneys = await db
    .select()
    .from(journeys)
    .where(inArray(journeys.id, journeyIds));

  const participantCounts = await Promise.all(
    activeJourneys.map(async (j) => {
      const rows = await db
        .select()
        .from(journeyParticipants)
        .where(
          and(
            eq(journeyParticipants.journeyId, j.id),
            isNull(journeyParticipants.leftAt)
          )
        );
      return { journeyId: j.id, count: rows.length };
    })
  );
  const countMap = Object.fromEntries(
    participantCounts.map((c) => [c.journeyId, c.count])
  );

  const toSummary = (j: (typeof activeJourneys)[0]): JourneySummary => ({
    id: j.id,
    name: j.name,
    emoji: j.emoji,
    visibility: j.visibility,
    startDate: j.startDate,
    endDate: j.endDate ?? undefined,
    isPrimary: user.primaryJourneyId === j.id,
    participantCount: countMap[j.id] ?? 0,
  });

  const primaryJourney = user.primaryJourneyId
    ? activeJourneys.find((j) => j.id === user.primaryJourneyId)
    : null;
  const otherJourneys = activeJourneys
    .filter((j) => j.id !== user.primaryJourneyId)
    .map(toSummary);

  let primaryTodayState: PrimaryTodayState | null = null;
  if (primaryJourney) {
    const entryRows = await db
      .select()
      .from(dailyEntries)
      .where(
        and(
          eq(dailyEntries.journeyId, primaryJourney.id),
          eq(dailyEntries.userId, user.id),
          eq(dailyEntries.date, today)
        )
      );
    const entry = entryRows[0] ?? null;
    let dimensionValues: DimensionValueResponse[] = [];
    if (entry) {
      const valueRows = await db
        .select({
          dimensionId: dailyDimensionValues.dimensionId,
          canonicalScale: dailyDimensionValues.canonicalScale,
        })
        .from(dailyDimensionValues)
        .where(eq(dailyDimensionValues.dailyEntryId, entry.id));
      dimensionValues = valueRows.map((r) => ({
        dimensionId: r.dimensionId,
        canonicalScale: r.canonicalScale,
      }));
    }
    primaryTodayState = {
      date: today,
      entry: entry
        ? {
            id: entry.id,
            userId: entry.userId,
            journeyId: entry.journeyId,
            date: entry.date,
            reflectionNote: entry.reflectionNote,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
          }
        : null,
      dimensionValues,
    };
  }

  let pendingBackfillCount = 0;
  const sevenDaysAgo = addDays(today, -6);
  for (const j of activeJourneys) {
    for (let i = 0; i < 7; i++) {
      const d = addDays(sevenDaysAgo, i);
      const rows = await db
        .select()
        .from(dailyEntries)
        .where(
          and(
            eq(dailyEntries.journeyId, j.id),
            eq(dailyEntries.userId, user.id),
            eq(dailyEntries.date, d)
          )
        );
      if (rows.length === 0) pendingBackfillCount += 1;
    }
  }

  const pendingWeeklyReviews: PendingWeeklyReview[] = [];
  for (const j of activeJourneys) {
    const reviewRows = await db
      .select()
      .from(weeklyReviews)
      .where(
        and(
          eq(weeklyReviews.userId, user.id),
          eq(weeklyReviews.journeyId, j.id),
          eq(weeklyReviews.weekStart, weekStart)
        )
      )
      .limit(1);
    const done = reviewRows[0]?.done === 1;
    if (!done) {
      pendingWeeklyReviews.push({ journeyId: j.id, weekStart });
    }
  }

  const response: HomeResponse = {
    primaryJourney: primaryJourney ? toSummary(primaryJourney) : null,
    primaryTodayState,
    otherJourneys,
    pendingBackfillCount,
    pendingWeeklyReviews,
  };
  return NextResponse.json(response);
}
