/**
 * GET /api/journeys/[id] — journey detail + dimensions + visibleLabels. 404 if not participant.
 * DELETE /api/journeys/[id] — creator only; 204 or 403/404.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  journeys,
  journeyParticipants,
  dimensions,
  journeyVisibleLabels,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireSession } from "@/lib/auth/require-session";
import type {
  ApiError,
  JourneyResponse,
  DimensionResponse,
  JourneyVisibleLabelsResponse,
} from "@/lib/types/api";

function jsonError(error: string, code?: string, status = 400) {
  return NextResponse.json({ error, code } as ApiError, { status });
}

export async function GET(
  _request: NextRequest,
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
        eq(journeyParticipants.userId, user.id)
      )
  );
  if (participantRows.length === 0) {
    return NextResponse.json(
      { error: "Journey not found" } as ApiError,
      { status: 404 }
    );
  }

  const journeyRows = await db
    .select()
    .from(journeys)
    .where(eq(journeys.id, journeyId))
    .limit(1);
  const journey = journeyRows[0];
  if (!journey) {
    return NextResponse.json(
      { error: "Journey not found" } as ApiError,
      { status: 404 }
    );
  }

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

  return NextResponse.json({
    journey: journeyResponse,
    dimensions: dimensionsResponse,
    visibleLabels,
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if ("response" in session) return session.response;
  const { user } = session;
  const { id: journeyId } = await params;
  const db = getDb();

  const journeyRows = await db
    .select({ creatorId: journeys.creatorId })
    .from(journeys)
    .where(eq(journeys.id, journeyId))
    .limit(1);
  const journey = journeyRows[0];
  if (!journey) {
    return NextResponse.json(
      { error: "Journey not found" } as ApiError,
      { status: 404 }
    );
  }
  if (journey.creatorId !== user.id) {
    return NextResponse.json(
      { error: "Only the creator can delete this journey" } as ApiError,
      { status: 403 }
    );
  }

  await db.delete(journeys).where(eq(journeys.id, journeyId));
  return new NextResponse(null, { status: 204 });
}
