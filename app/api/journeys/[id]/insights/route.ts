/**
 * GET /api/journeys/[id]/insights — chart data for Insights: daily scores (14d), dimension averages (radar), heatmap (84d).
 */
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  journeyParticipants,
  dailyEntries,
  dailyDimensionValues,
  dimensions,
} from "@/lib/db/schema";
import { eq, and, isNull, gte, lte } from "drizzle-orm";
import { requireSession } from "@/lib/auth/require-session";
import { todayInTimezone, addDays, scoreFactorForCanonicalScale } from "@/lib/date-utils";

const HEATMAP_DAYS = 84; // ~12 weeks for calendar heatmap
const LINE_CHART_DAYS = 14;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if ("response" in session) return session.response;
  const { user } = session;
  const { id: journeyId } = await params;
  const db = getDb();

  const participantRows = await db
    .select()
    .from(journeyParticipants)
    .where(
      and(
        eq(journeyParticipants.journeyId, journeyId),
        eq(journeyParticipants.userId, user.id),
        isNull(journeyParticipants.leftAt)
      )
    )
    .limit(1);
  if (participantRows.length === 0) {
    return NextResponse.json({ error: "Journey not found" }, { status: 404 });
  }

  const today = todayInTimezone(user.timezone);
  const heatmapStart = addDays(today, -HEATMAP_DAYS + 1) ?? today;

  const journeyDims = await db
    .select({ id: dimensions.id, name: dimensions.name, emoji: dimensions.emoji, weight: dimensions.weight })
    .from(dimensions)
    .where(eq(dimensions.journeyId, journeyId))
    .orderBy(dimensions.position);
  const dimMap = Object.fromEntries(journeyDims.map((d) => [d.id, d]));

  const entries = await db
    .select({ id: dailyEntries.id, date: dailyEntries.date })
    .from(dailyEntries)
    .where(
      and(
        eq(dailyEntries.journeyId, journeyId),
        eq(dailyEntries.userId, user.id),
        gte(dailyEntries.date, heatmapStart),
        lte(dailyEntries.date, today)
      )
    )
    .orderBy(dailyEntries.date);

  const dimensionSums: Record<string, { sum: number; count: number }> = {};
  journeyDims.forEach((d) => {
    dimensionSums[d.id] = { sum: 0, count: 0 };
  });

  const heatmapScoreByDate: Record<string, number> = {};
  const heatmapDimByDate: Record<string, Record<string, number>> = {};

  for (let i = 0; i < HEATMAP_DAYS; i++) {
    const d = addDays(heatmapStart, i);
    if (d) {
      heatmapScoreByDate[d] = 0;
      heatmapDimByDate[d] = {};
      journeyDims.forEach((dim) => {
        heatmapDimByDate[d][dim.id] = 0;
      });
    }
  }

  const dailyScores: { date: string; scorePercentage: number }[] = [];
  const lineChartStart = addDays(today, -LINE_CHART_DAYS + 1) ?? today;
  const stackedBarData: {
    date: string;
    shortDate: string;
    totalScore: number;
    segments: { dimensionId: string; name: string; emoji: string; contribution: number }[];
  }[] = [];

  for (const entry of entries) {
    const values = await db
      .select({
        dimensionId: dailyDimensionValues.dimensionId,
        canonicalScale: dailyDimensionValues.canonicalScale,
      })
      .from(dailyDimensionValues)
      .where(eq(dailyDimensionValues.dailyEntryId, entry.id));

    let dayScoreEarned = 0;
    const dimScores: Record<string, number> = {};
    const contributions: Record<string, number> = {};
    journeyDims.forEach((d) => {
      contributions[d.id] = 0;
    });
    for (const v of values) {
      const dim = dimMap[v.dimensionId];
      if (!dim) continue;
      const factor = scoreFactorForCanonicalScale(v.canonicalScale);
      const contrib = dim.weight * factor;
      dayScoreEarned += contrib;
      contributions[v.dimensionId] = Math.round(contrib * 10) / 10;
      dimensionSums[v.dimensionId].sum += v.canonicalScale;
      dimensionSums[v.dimensionId].count += 1;
      const pct = Math.round((v.canonicalScale / 5) * 1000) / 10;
      dimScores[v.dimensionId] = Math.max(0, Math.min(100, pct));
    }
    const raw = (dayScoreEarned / 100) * 100;
    const scorePercentage = Math.round(Math.max(0, Math.min(100, raw)) * 10) / 10;
    heatmapScoreByDate[entry.date] = scorePercentage;
    if (heatmapDimByDate[entry.date]) {
      journeyDims.forEach((dim) => {
        heatmapDimByDate[entry.date][dim.id] = dimScores[dim.id] ?? 0;
      });
    }
    dailyScores.push({ date: entry.date, scorePercentage });
    if (entry.date >= lineChartStart && entry.date <= today) {
      stackedBarData.push({
        date: entry.date,
        shortDate: entry.date.slice(5),
        totalScore: scorePercentage,
        segments: journeyDims.map((d) => ({
          dimensionId: d.id,
          name: d.name,
          emoji: d.emoji,
          contribution: contributions[d.id] ?? 0,
        })),
      });
    }
  }

  const dailyScoresLine = dailyScores.filter(
    (s) => s.date >= lineChartStart && s.date <= today
  );

  const heatmapDailyScores: { date: string; scorePercentage: number }[] = [];
  for (let i = 0; i < HEATMAP_DAYS; i++) {
    const d = addDays(heatmapStart, i);
    if (!d) continue;
    heatmapDailyScores.push({
      date: d,
      scorePercentage: heatmapScoreByDate[d] ?? 0,
    });
  }

  const dailyDimensionScores: Record<string, { date: string; scorePercentage: number }[]> = {};
  journeyDims.forEach((dim) => {
    dailyDimensionScores[dim.id] = heatmapDailyScores.map(({ date }) => ({
      date,
      scorePercentage: heatmapDimByDate[date]?.[dim.id] ?? 0,
    }));
  });

  const dimensionScores = journeyDims.map((d) => {
    const { sum, count } = dimensionSums[d.id];
    const averageScale = count > 0 ? sum / count : 0;
    const scorePercentage = Math.round((averageScale / 5) * 1000) / 10;
    return {
      dimensionId: d.id,
      name: d.name,
      emoji: d.emoji,
      averageScale: Math.round(averageScale * 10) / 10,
      scorePercentage,
    };
  });

  return NextResponse.json({
    dailyScores: dailyScoresLine,
    dimensionScores,
    heatmapDailyScores,
    dailyDimensionScores,
    stackedBarData,
  });
}
