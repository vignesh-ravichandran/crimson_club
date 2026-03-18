/**
 * GET /api/journeys/[id] — journey detail + dimensions + visibleLabels. 404 if not participant.
 * DELETE /api/journeys/[id] — creator only; 204 or 403/404.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { journeys } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth/require-session";
import { getJourneyDetail } from "@/lib/data/journeys";
import type { ApiError } from "@/lib/types/api";

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
  const data = await getJourneyDetail(journeyId, user.id);
  if (!data) {
    return NextResponse.json(
      { error: "Journey not found" } as ApiError,
      { status: 404 }
    );
  }
  return NextResponse.json(data);
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
