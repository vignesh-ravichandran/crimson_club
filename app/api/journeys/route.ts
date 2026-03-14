/**
 * GET /api/journeys — list current user's journeys. Query ?archived=true for ended.
 * POST /api/journeys — create journey (dimensions, labels). Contract: api-contracts §4.2.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  journeys,
  journeyParticipants,
  journeyVisibleLabels,
  dimensions,
} from "@/lib/db/schema";
import { eq, and, isNull, inArray } from "drizzle-orm";
import { requireSession } from "@/lib/auth/require-session";
import type {
  ApiError,
  JourneySummary,
  CreateJourneyBody,
} from "@/lib/types/api";
import crypto from "crypto";

function jsonError(error: string, code?: string, status = 400) {
  return NextResponse.json({ error, code } as ApiError, { status });
}

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if ("response" in session) return session.response;
  const { user } = session;
  const db = getDb();
  const archived = request.nextUrl.searchParams.get("archived") === "true";

  const participants = await db
    .select({
      journeyId: journeyParticipants.journeyId,
      leftAt: journeyParticipants.leftAt,
    })
    .from(journeyParticipants)
    .where(eq(journeyParticipants.userId, user.id));

  const journeyIds = participants
    .filter((p) => (archived ? p.leftAt != null : p.leftAt == null))
    .map((p) => p.journeyId);

  if (journeyIds.length === 0) {
    return NextResponse.json({ journeys: [] });
  }

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

  const list: JourneySummary[] = filtered.map((j) => ({
    id: j.id,
    name: j.name,
    emoji: j.emoji,
    visibility: j.visibility,
    startDate: j.startDate,
    endDate: j.endDate ?? undefined,
    isPrimary: user.primaryJourneyId === j.id,
    participantCount: countMap[j.id] ?? 0,
  }));

  return NextResponse.json({ journeys: list });
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if ("response" in session) return session.response;
  const { user } = session;
  const db = getDb();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", "VALIDATION", 400);
  }

  const b = body as CreateJourneyBody;
  const dims = b.dimensions;
  if (!Array.isArray(dims) || dims.length < 2 || dims.length > 8) {
    return jsonError(
      "Journey must have 2–8 dimensions",
      "VALIDATION",
      400
    );
  }

  const weightSum = dims.reduce((s, d) => s + (Number(d.weight) || 0), 0);
  if (Math.abs(weightSum - 100) > 0.01) {
    return jsonError("Dimension weights must sum to 100", "VALIDATION", 400);
  }

  const visibility =
    b.visibility === "private" || b.visibility === "public"
      ? b.visibility
      : "public";
  const now = new Date();
  const journeyId = crypto.randomUUID();

  await db.insert(journeys).values({
    id: journeyId,
    creatorId: user.id,
    name: String(b.name ?? "").trim() || "Unnamed",
    description: b.description?.trim() || null,
    emoji: String(b.emoji ?? "📌").trim() || "📌",
    visibility,
    startDate: b.startDate ?? new Date().toISOString().slice(0, 10),
    endDate: b.endDate?.trim() || null,
    whyExists: b.whyExists?.trim() || null,
    successVision: b.successVision?.trim() || null,
    whatMattersMost: b.whatMattersMost?.trim() || null,
    whatShouldNotDistract: b.whatShouldNotDistract?.trim() || null,
    strengthsToPlayTo: b.strengthsToPlayTo?.trim() || null,
    createdAt: now,
    updatedAt: now,
  });

  const labels = b.visibleLabels ?? {
    labelMissed: "Missed",
    labelLow: "Showed up",
    labelMedium: "Progressed",
    labelHigh: "Built",
    labelExcellent: "Conquered",
  };

  await db.insert(journeyVisibleLabels).values({
    journeyId,
    labelMissed: labels.labelMissed ?? "Missed",
    labelLow: labels.labelLow ?? "Showed up",
    labelMedium: labels.labelMedium ?? "Progressed",
    labelHigh: labels.labelHigh ?? "Built",
    labelExcellent: labels.labelExcellent ?? "Conquered",
    updatedAt: now,
  });

  for (let i = 0; i < dims.length; i++) {
    const d = dims[i];
    await db.insert(dimensions).values({
      id: crypto.randomUUID(),
      journeyId,
      position: i,
      name: String(d.name ?? "").trim() || "Dimension",
      description: d.description?.trim() || null,
      emoji: String(d.emoji ?? "•").trim() || "•",
      weight: Number(d.weight) || 0,
      isMandatory: d.isMandatory ? 1 : 0,
      whyMatters: d.whyMatters?.trim() || null,
      whatGoodLooksLike: d.whatGoodLooksLike?.trim() || null,
      howHelpsJourney: d.howHelpsJourney?.trim() || null,
      strengthGuidance: d.strengthGuidance?.trim() || null,
      createdAt: now,
    });
  }

  await db.insert(journeyParticipants).values({
    id: crypto.randomUUID(),
    journeyId,
    userId: user.id,
    joinedAt: now,
    leftAt: null,
  });

  return NextResponse.json({ id: journeyId }, { status: 201 });
}
