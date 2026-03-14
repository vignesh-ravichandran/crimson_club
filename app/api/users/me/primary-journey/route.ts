/**
 * PATCH /api/users/me/primary-journey — set primary journey. Contract: api-contracts §4.1.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, journeyParticipants } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { requireSession } from "@/lib/auth/require-session";
import type { ApiError, UserResponse } from "@/lib/types/api";

function jsonError(error: string, code?: string, status = 400) {
  return NextResponse.json({ error, code } as ApiError, { status });
}

function toUserResponse(row: {
  id: string;
  email: string;
  publicDisplayName: string;
  primaryJourneyId: string | null;
  timezone: string;
}): UserResponse {
  return {
    id: row.id,
    email: row.email,
    publicDisplayName: row.publicDisplayName,
    primaryJourneyId: row.primaryJourneyId,
    timezone: row.timezone,
  };
}

export async function PATCH(request: NextRequest) {
  const session = await requireSession();
  if ("response" in session) return session.response;
  const { user } = session;

  let body: { journeyId?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", "VALIDATION", 400);
  }

  const journeyId =
    body.journeyId === null || body.journeyId === undefined
      ? ""
      : typeof body.journeyId === "string"
        ? body.journeyId.trim()
        : "";

  if (journeyId) {
    const participantRows = await db
      .select()
      .from(journeyParticipants)
      .where(
        and(
          eq(journeyParticipants.journeyId, journeyId),
          eq(journeyParticipants.userId, user.id),
          isNull(journeyParticipants.leftAt)
        )
      )
      .limit(1);
    if (participantRows.length === 0) {
      return NextResponse.json(
        { error: "Journey not found or you are not a participant", code: "NOT_FOUND" } as ApiError,
        { status: 404 }
      );
    }
  }

  const now = new Date();
  await db
    .update(users)
    .set({
      primaryJourneyId: journeyId || null,
      updatedAt: now,
    })
    .where(eq(users.id, user.id));

  const rows = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  const row = rows[0];
  if (!row) return NextResponse.json({ error: "User not found" } as ApiError, { status: 404 });
  return NextResponse.json({ user: toUserResponse(row) });
}
