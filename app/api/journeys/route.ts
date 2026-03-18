/**
 * GET /api/journeys — list current user's journeys. Query ?archived=true for ended.
 * POST /api/journeys — create journey (dimensions, labels). Contract: api-contracts §4.2.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  journeys,
  journeyVisibleLabels,
  dimensions,
  journeyParticipants,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth/require-session";
import { getJourneysForUser } from "@/lib/data/journeys";
import type {
  ApiError,
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
  const archived = request.nextUrl.searchParams.get("archived") === "true";
  const list = await getJourneysForUser(
    user.id,
    user.primaryJourneyId,
    archived
  );
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
