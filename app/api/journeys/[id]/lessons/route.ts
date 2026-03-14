/**
 * GET /api/journeys/[id]/lessons?dimensionId=&sourceType= — list lessons; optional filters.
 * POST /api/journeys/[id]/lessons — create lesson. sourceType: daily_reflection | weekly_review. Contract: api-contracts §4.6.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  journeyParticipants,
  lessons,
  dimensions,
} from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireSession } from "@/lib/auth/require-session";
import type {
  ApiError,
  LessonResponse,
  PostLessonBody,
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

function lessonToResponse(row: {
  id: string;
  userId: string;
  journeyId: string;
  text: string;
  sourceDate: string;
  sourceType: string;
  dimensionId: string | null;
  createdAt: Date;
}): LessonResponse {
  return {
    id: row.id,
    userId: row.userId,
    journeyId: row.journeyId,
    text: row.text,
    sourceDate: row.sourceDate,
    sourceType: row.sourceType,
    dimensionId: row.dimensionId ?? undefined,
    createdAt: row.createdAt,
  };
}

const VALID_SOURCE_TYPES = ["daily_reflection", "weekly_review"] as const;

export async function GET(
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

  const dimensionId = request.nextUrl.searchParams.get("dimensionId");
  const sourceType = request.nextUrl.searchParams.get("sourceType");

  let rows = await db
    .select()
    .from(lessons)
    .where(
      and(
        eq(lessons.journeyId, journeyId),
        eq(lessons.userId, user.id)
      )
    )
    .orderBy(desc(lessons.createdAt));

  if (dimensionId && dimensionId.trim() !== "") {
    rows = rows.filter((r) => r.dimensionId === dimensionId);
  }
  if (sourceType && sourceType.trim() !== "") {
    if (!VALID_SOURCE_TYPES.includes(sourceType as (typeof VALID_SOURCE_TYPES)[number])) {
      return jsonError(
        "sourceType must be daily_reflection or weekly_review",
        "VALIDATION",
        400
      );
    }
    rows = rows.filter((r) => r.sourceType === sourceType);
  }

  const lessonList: LessonResponse[] = rows.map(lessonToResponse);
  return NextResponse.json({ lessons: lessonList });
}

export async function POST(
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
  const b = body as PostLessonBody;
  if (
    typeof b.text !== "string" ||
    !b.sourceDate ||
    !/^\d{4}-\d{2}-\d{2}$/.test(b.sourceDate) ||
    !b.sourceType ||
    !VALID_SOURCE_TYPES.includes(b.sourceType)
  ) {
    return jsonError(
      "text, sourceDate (YYYY-MM-DD), and sourceType (daily_reflection|weekly_review) required",
      "VALIDATION",
      400
    );
  }

  if (b.dimensionId) {
    const dimRows = await db
      .select({ id: dimensions.id })
      .from(dimensions)
      .where(
        and(
          eq(dimensions.id, b.dimensionId),
          eq(dimensions.journeyId, journeyId)
        )
      );
    if (dimRows.length === 0) {
      return jsonError(
        "dimensionId must belong to this journey",
        "VALIDATION",
        400
      );
    }
  }

  const id = crypto.randomUUID();
  const now = new Date();
  await db.insert(lessons).values({
    id,
    userId: user.id,
    journeyId,
    text: b.text.trim(),
    sourceDate: b.sourceDate,
    sourceType: b.sourceType,
    dimensionId: b.dimensionId?.trim() || null,
    createdAt: now,
  });

  return NextResponse.json({ id }, { status: 201 });
}
