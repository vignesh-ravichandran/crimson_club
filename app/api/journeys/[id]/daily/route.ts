/**
 * GET /api/journeys/[id]/daily?date=YYYY-MM-DD — entry + dimensionValues. User must be participant.
 * PUT /api/journeys/[id]/daily — upsert entry; 7-day window (user TZ). Contract: api-contracts §4.3.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  journeyParticipants,
  dailyEntries,
  dailyDimensionValues,
  dimensions,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireSession } from "@/lib/auth/require-session";
import { isWithin7DayWindow } from "@/lib/date-utils";
import type {
  ApiError,
  DailyEntryResponse,
  DimensionValueResponse,
  PutDailyBody,
} from "@/lib/types/api";
import crypto from "crypto";

function jsonError(error: string, code?: string, status = 400) {
  return NextResponse.json({ error, code } as ApiError, { status });
}

async function ensureParticipant(
  journeyId: string,
  userId: string
): Promise<boolean> {
  const rows = await db
    .select()
    .from(journeyParticipants)
    .where(
      and(
        eq(journeyParticipants.journeyId, journeyId),
        eq(journeyParticipants.userId, userId)
      )
  );
  if (rows.length === 0 || rows[0].leftAt != null) return false;
  return true;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if ("response" in session) return session.response;
  const { user } = session;
  const { id: journeyId } = await params;
  const date = request.nextUrl.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return jsonError("Query date=YYYY-MM-DD required", "VALIDATION", 400);
  }

  const isParticipant = await ensureParticipant(journeyId, user.id);
  if (!isParticipant) {
    return NextResponse.json(
      { error: "Journey not found" } as ApiError,
      { status: 404 }
    );
  }

  const entryRows = await db
    .select()
    .from(dailyEntries)
    .where(
      and(
        eq(dailyEntries.journeyId, journeyId),
        eq(dailyEntries.userId, user.id),
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

  return NextResponse.json({
    entry: entryResponse,
    dimensionValues,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if ("response" in session) return session.response;
  const { user } = session;
  const { id: journeyId } = await params;

  const isParticipant = await ensureParticipant(journeyId, user.id);
  if (!isParticipant) {
    return NextResponse.json(
      { error: "Journey not found" } as ApiError,
      { status: 404 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", "VALIDATION", 400);
  }
  const b = body as PutDailyBody;
  const date = b.date;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return jsonError("date YYYY-MM-DD required", "VALIDATION", 400);
  }
  if (!isWithin7DayWindow(date, user.timezone)) {
    return jsonError(
      "Date is outside the 7-day edit window",
      "VALIDATION",
      400
    );
  }

  const dimensionIds = await db
    .select({ id: dimensions.id })
    .from(dimensions)
    .where(eq(dimensions.journeyId, journeyId));
  const validDimensionIds = new Set(dimensionIds.map((d) => d.id));

  const dimensionValues = Array.isArray(b.dimensionValues) ? b.dimensionValues : [];
  for (const dv of dimensionValues) {
    if (!validDimensionIds.has(dv.dimensionId)) {
      return jsonError(
        "dimensionIds must belong to this journey",
        "VALIDATION",
        400
      );
    }
    const scale = Number(dv.canonicalScale);
    if (!Number.isInteger(scale) || scale < 0 || scale > 5) {
      return jsonError(
        "canonicalScale must be 0–5 for each dimension",
        "VALIDATION",
        400
      );
    }
  }

  const now = new Date();
  const entryRows = await db
    .select()
    .from(dailyEntries)
    .where(
      and(
        eq(dailyEntries.journeyId, journeyId),
        eq(dailyEntries.userId, user.id),
        eq(dailyEntries.date, date)
      )
  );
  let entry = entryRows[0];

  if (!entry) {
    const entryId = crypto.randomUUID();
    await db.insert(dailyEntries).values({
      id: entryId,
      userId: user.id,
      journeyId,
      date,
      reflectionNote: b.reflectionNote?.trim() || null,
      createdAt: now,
      updatedAt: now,
    });
    entry = {
      id: entryId,
      userId: user.id,
      journeyId,
      date,
      reflectionNote: b.reflectionNote?.trim() || null,
      createdAt: now,
      updatedAt: now,
    } as typeof entry;
  } else {
    await db
      .update(dailyEntries)
      .set({
        reflectionNote: b.reflectionNote?.trim() ?? entry.reflectionNote,
        updatedAt: now,
      })
      .where(eq(dailyEntries.id, entry.id));
  }

  for (const dv of dimensionValues) {
    const existing = await db
      .select()
      .from(dailyDimensionValues)
      .where(
        and(
          eq(dailyDimensionValues.dailyEntryId, entry!.id),
          eq(dailyDimensionValues.dimensionId, dv.dimensionId)
        )
      );
    if (existing.length > 0) {
      await db
        .update(dailyDimensionValues)
        .set({ canonicalScale: dv.canonicalScale })
        .where(eq(dailyDimensionValues.id, existing[0].id));
    } else {
      await db.insert(dailyDimensionValues).values({
        id: crypto.randomUUID(),
        dailyEntryId: entry!.id,
        dimensionId: dv.dimensionId,
        canonicalScale: dv.canonicalScale,
      });
    }
  }

  const valueRows = await db
    .select({
      dimensionId: dailyDimensionValues.dimensionId,
      canonicalScale: dailyDimensionValues.canonicalScale,
    })
    .from(dailyDimensionValues)
    .where(eq(dailyDimensionValues.dailyEntryId, entry!.id));
  const responseValues: DimensionValueResponse[] = valueRows.map((r) => ({
    dimensionId: r.dimensionId,
    canonicalScale: r.canonicalScale,
  }));

  const entryResponse: DailyEntryResponse = {
    id: entry!.id,
    userId: entry!.userId,
    journeyId: entry!.journeyId,
    date: entry!.date,
    reflectionNote: entry!.reflectionNote ?? undefined,
    createdAt: entry!.createdAt,
    updatedAt: now,
  };

  return NextResponse.json({
    entry: entryResponse,
    dimensionValues: responseValues,
  });
}
