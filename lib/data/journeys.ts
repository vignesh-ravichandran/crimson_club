/**
 * Server-only data for journeys. Used by API routes and Server Components so we don't rely on fetch() to own API (avoids subrequest issues on Cloudflare).
 */
import { getDb } from "@/lib/db";
import {
  journeys,
  journeyParticipants,
  dimensions,
  journeyVisibleLabels,
} from "@/lib/db/schema";
import { eq, and, isNull, inArray } from "drizzle-orm";
import type {
  JourneySummary,
  JourneyResponse,
  DimensionResponse,
  JourneyVisibleLabelsResponse,
} from "@/lib/types/api";

export async function getJourneysForUser(
  userId: string,
  primaryJourneyId: string | null,
  archived = false
): Promise<JourneySummary[]> {
  const db = getDb();
  const participants = await db
    .select({
      journeyId: journeyParticipants.journeyId,
      leftAt: journeyParticipants.leftAt,
    })
    .from(journeyParticipants)
    .where(eq(journeyParticipants.userId, userId));

  const journeyIds = participants
    .filter((p) => (archived ? p.leftAt != null : p.leftAt == null))
    .map((p) => p.journeyId);

  if (journeyIds.length === 0) return [];

  const filtered = await db
    .select()
    .from(journeys)
    .where(inArray(journeys.id, journeyIds));

  const participantCounts = await Promise.all(
    filtered.map(async (j) => {
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
    participantCounts.map((p) => [p.journeyId, p.count])
  );

  return filtered.map((j) => ({
    id: j.id,
    name: j.name,
    emoji: j.emoji,
    visibility: j.visibility,
    startDate: j.startDate,
    endDate: j.endDate ?? undefined,
    isPrimary: primaryJourneyId === j.id,
    participantCount: countMap[j.id] ?? 0,
  }));
}

/** Minimal journey info by id (no participant check). Use for join page where user may not be member yet. */
export async function getJourneyById(journeyId: string): Promise<{
  name: string;
  visibility: string;
  creatorId: string;
} | null> {
  const db = getDb();
  const rows = await db
    .select({ name: journeys.name, visibility: journeys.visibility, creatorId: journeys.creatorId })
    .from(journeys)
    .where(eq(journeys.id, journeyId))
    .limit(1);
  const row = rows[0];
  return row ? { name: row.name, visibility: row.visibility, creatorId: row.creatorId } : null;
}

export async function getJourneyDetail(
  journeyId: string,
  userId: string
): Promise<{
  journey: JourneyResponse;
  dimensions: DimensionResponse[];
  visibleLabels: JourneyVisibleLabelsResponse;
} | null> {
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
  if (participantRows.length === 0) return null;

  const journeyRows = await db
    .select()
    .from(journeys)
    .where(eq(journeys.id, journeyId))
    .limit(1);
  const journey = journeyRows[0];
  if (!journey) return null;

  const dimRows = await db
    .select()
    .from(dimensions)
    .where(eq(dimensions.journeyId, journeyId))
    .orderBy(dimensions.position);

  const labelRows = await db
    .select()
    .from(journeyVisibleLabels)
    .where(eq(journeyVisibleLabels.journeyId, journeyId))
    .limit(1);
  const labels = labelRows[0];

  const journeyResponse: JourneyResponse = {
    id: journey.id,
    creatorId: journey.creatorId,
    name: journey.name,
    description: journey.description,
    emoji: journey.emoji,
    visibility: journey.visibility,
    startDate: journey.startDate,
    endDate: journey.endDate,
    whyExists: journey.whyExists,
    successVision: journey.successVision,
    whatMattersMost: journey.whatMattersMost,
    whatShouldNotDistract: journey.whatShouldNotDistract,
    strengthsToPlayTo: journey.strengthsToPlayTo,
  };

  const dimensionsResponse: DimensionResponse[] = dimRows.map((d) => ({
    id: d.id,
    journeyId: d.journeyId,
    position: d.position,
    name: d.name,
    description: d.description,
    emoji: d.emoji,
    weight: d.weight,
    isMandatory: d.isMandatory,
    whyMatters: d.whyMatters,
    whatGoodLooksLike: d.whatGoodLooksLike,
    howHelpsJourney: d.howHelpsJourney,
    strengthGuidance: d.strengthGuidance,
  }));

  const visibleLabels: JourneyVisibleLabelsResponse = labels
    ? {
        labelMissed: labels.labelMissed,
        labelLow: labels.labelLow,
        labelMedium: labels.labelMedium,
        labelHigh: labels.labelHigh,
        labelExcellent: labels.labelExcellent,
      }
    : {
        labelMissed: "Missed",
        labelLow: "Showed up",
        labelMedium: "Progressed",
        labelHigh: "Built",
        labelExcellent: "Conquered",
      };

  return { journey: journeyResponse, dimensions: dimensionsResponse, visibleLabels };
}
