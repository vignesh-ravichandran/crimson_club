/**
 * POST /api/journeys/[id]/join — Public: add participant. Private: require inviteToken, mark used, add participant.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  journeys,
  journeyParticipants,
  journeyInvites,
} from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { requireSession } from "@/lib/auth/require-session";
import type { ApiError } from "@/lib/types/api";
import crypto from "crypto";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if ("response" in session) return session.response;
  const { user } = session;
  const { id: journeyId } = await params;

  let body: { inviteToken?: string } = {};
  try {
    body = await request.json();
  } catch {
    // optional body
  }

  const journeyRows = await db
    .select()
    .from(journeys)
    .where(eq(journeys.id, journeyId))
    .limit(1);
  const journey = journeyRows[0];
  if (!journey) {
    return NextResponse.json(
      { error: "Journey not found", code: "NOT_FOUND" } as ApiError,
      { status: 404 }
    );
  }

  const existing = await db
    .select()
    .from(journeyParticipants)
    .where(
      and(
        eq(journeyParticipants.journeyId, journeyId),
        eq(journeyParticipants.userId, user.id)
      )
  );
  if (existing.length > 0 && existing[0].leftAt == null) {
    return NextResponse.json({}); // already a participant
  }

  if (journey.visibility === "private") {
    const token = body.inviteToken?.trim();
    if (!token) {
      return NextResponse.json(
        { error: "Invite token required for private journey", code: "VALIDATION" } as ApiError,
        { status: 400 }
      );
    }
    const inviteRows = await db
      .select()
      .from(journeyInvites)
      .where(
        and(
          eq(journeyInvites.journeyId, journeyId),
          eq(journeyInvites.token, token),
          isNull(journeyInvites.usedAt)
        )
      )
      .limit(1);
    const invite = inviteRows[0];
    if (!invite) {
      return NextResponse.json(
        { error: "Invalid or already used invite token", code: "NOT_FOUND" } as ApiError,
        { status: 404 }
      );
    }
    const now = new Date();
    await db
      .update(journeyInvites)
      .set({ usedAt: now })
      .where(eq(journeyInvites.id, invite.id));
  }

  const now = new Date();
  if (existing.length > 0 && existing[0].leftAt != null) {
    await db
      .update(journeyParticipants)
      .set({ leftAt: null })
      .where(
        and(
          eq(journeyParticipants.journeyId, journeyId),
          eq(journeyParticipants.userId, user.id)
        )
      );
  } else {
    await db.insert(journeyParticipants).values({
      id: crypto.randomUUID(),
      journeyId,
      userId: user.id,
      joinedAt: now,
      leftAt: null,
    });
  }

  return NextResponse.json({});
}
