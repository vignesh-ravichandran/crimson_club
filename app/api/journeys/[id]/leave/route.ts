/**
 * POST /api/journeys/[id]/leave — set left_at for current user. 200.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { journeyParticipants } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireSession } from "@/lib/auth/require-session";
import type { ApiError } from "@/lib/types/api";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if ("response" in session) return session.response;
  const { user } = session;
  const { id: journeyId } = await params;
  const db = getDb();

  const rows = await db
    .select()
    .from(journeyParticipants)
    .where(
      and(
        eq(journeyParticipants.journeyId, journeyId),
        eq(journeyParticipants.userId, user.id)
      )
  );
  if (rows.length === 0) {
    return NextResponse.json(
      { error: "Not a participant" } as ApiError,
      { status: 404 }
    );
  }

  const now = new Date();
  await db
    .update(journeyParticipants)
    .set({ leftAt: now })
    .where(
      and(
        eq(journeyParticipants.journeyId, journeyId),
        eq(journeyParticipants.userId, user.id)
      )
    );

  return NextResponse.json({});
}
