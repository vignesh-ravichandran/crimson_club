/**
 * PATCH /api/users/me — update publicDisplayName and/or timezone. Contract: api-contracts §4.1.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
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

  let body: { publicDisplayName?: string; timezone?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", "VALIDATION", 400);
  }

  const updates: { publicDisplayName?: string; timezone?: string } = {};
  if (body.publicDisplayName !== undefined) {
    const name = String(body.publicDisplayName).trim();
    if (name.length === 0) return jsonError("publicDisplayName cannot be empty", "VALIDATION", 400);
    updates.publicDisplayName = name;
  }
  if (body.timezone !== undefined) {
    const tz = String(body.timezone).trim();
    if (tz.length === 0) return jsonError("timezone cannot be empty", "VALIDATION", 400);
    updates.timezone = tz;
  }

  if (Object.keys(updates).length === 0) {
    const rows = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    const row = rows[0];
    if (!row) return NextResponse.json({ error: "User not found" } as ApiError, { status: 404 });
    return NextResponse.json({ user: toUserResponse(row) });
  }

  const now = new Date();
  await db
    .update(users)
    .set({
      ...updates,
      updatedAt: now,
    })
    .where(eq(users.id, user.id));

  const rows = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  const row = rows[0];
  if (!row) return NextResponse.json({ error: "User not found" } as ApiError, { status: 404 });
  return NextResponse.json({ user: toUserResponse(row) });
}
