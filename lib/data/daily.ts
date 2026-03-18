/**
 * Server-only daily entry data. Used by today page and API so we don't rely on fetch() to own API on Cloudflare.
 */
import { getDb } from "@/lib/db";
import {
  journeyParticipants,
  dailyEntries,
  dailyDimensionValues,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { DailyEntryResponse, DimensionValueResponse } from "@/lib/types/api";

export async function getDailyData(
  journeyId: string,
  userId: string,
  date: string
): Promise<{ entry: DailyEntryResponse | null; dimensionValues: DimensionValueResponse[] } | null> {
  const db = getDb();
  const participantRows = await db
    .select()
    .from(journeyParticipants)
    .where(
      and(
        eq(journeyParticipants.journeyId, journeyId),
        eq(journeyParticipants.userId, userId)
      )
  );
  if (participantRows.length === 0 || participantRows[0].leftAt != null) {
    return null;
  }

  const entryRows = await db
    .select()
    .from(dailyEntries)
    .where(
      and(
        eq(dailyEntries.journeyId, journeyId),
        eq(dailyEntries.userId, userId),
        eq(dailyEntries.date, date)
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

  const entryResponse: DailyEntryResponse | null = entry
    ? {
        id: entry.id,
        userId: entry.userId,
        journeyId: entry.journeyId,
        date: entry.date,
        reflectionNote: entry.reflectionNote,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      }
    : null;

  return { entry: entryResponse, dimensionValues };
}
