/**
 * POST /api/journeys/[id]/invite — create invite for private journey (creator only). Contract: api-contracts §4.2.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { journeys, journeyInvites } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireSession } from "@/lib/auth/require-session";
import type { ApiError, PostInviteBody, InviteResponse } from "@/lib/types/api";
import crypto from "crypto";

function jsonError(error: string, code?: string, status = 400) {
  return NextResponse.json({ error, code } as ApiError, { status });
}

function validEmail(email: unknown): email is string {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if ("response" in session) return session.response;
  const { user } = session;
  const { id: journeyId } = await params;
  const db = getDb();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", "VALIDATION", 400);
  }
  const b = body as PostInviteBody;
  if (!validEmail(b.email)) {
    return jsonError("Valid email required", "VALIDATION", 400);
  }
  const email = (b.email as string).trim().toLowerCase();

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
  if (journey.creatorId !== user.id) {
    return NextResponse.json(
      { error: "Only the journey creator can create invites", code: "FORBIDDEN" } as ApiError,
      { status: 403 }
    );
  }
  if (journey.visibility !== "private") {
    return NextResponse.json(
      { error: "Invites are only for private journeys", code: "VALIDATION" } as ApiError,
      { status: 400 }
    );
  }

  const token = crypto.randomBytes(24).toString("hex");
  const now = new Date();
  await db.insert(journeyInvites).values({
    id: crypto.randomUUID(),
    journeyId,
    email,
    token,
    createdAt: now,
    usedAt: null,
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const inviteUrl = `${baseUrl}/journeys/${journeyId}/join?token=${encodeURIComponent(token)}`;

  const response: InviteResponse = { token, inviteUrl };
  return NextResponse.json(response, { status: 201 });
}
