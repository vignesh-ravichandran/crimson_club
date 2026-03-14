/**
 * POST /api/auth/sign-up. Contract: docs/lld/api-contracts.md §3.3.
 * Validate email, password, publicDisplayName; hash password (bcrypt); insert user; create session; set cookie; return 201 + user.
 */
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  createSession,
  sessionCookieOptions,
} from "@/lib/auth/session";
import {
  validateEmail,
  validatePassword,
  validatePublicDisplayName,
} from "@/lib/auth/validation";
import type { SignUpBody, UserResponse, ApiError } from "@/lib/types/api";
import crypto from "crypto";

function jsonError(error: string, code?: string, status: number = 400): NextResponse<ApiError> {
  return NextResponse.json({ error, code }, { status });
}

function userToResponse(u: {
  id: string;
  email: string;
  publicDisplayName: string;
  primaryJourneyId: string | null;
  timezone: string;
}): UserResponse {
  return {
    id: u.id,
    email: u.email,
    publicDisplayName: u.publicDisplayName,
    primaryJourneyId: u.primaryJourneyId,
    timezone: u.timezone,
  };
}

export async function POST(request: NextRequest) {
  const db = getDb();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", "VALIDATION", 400);
  }

  const { email: rawEmail, password, publicDisplayName: rawName } = body as SignUpBody;
  const email = validateEmail(rawEmail);
  if (!email) return jsonError("Valid email is required", "VALIDATION", 400);

  const pwdResult = validatePassword(password);
  if (!pwdResult.ok) return jsonError(pwdResult.error, "VALIDATION", 400);

  const publicDisplayName = validatePublicDisplayName(rawName);
  if (!publicDisplayName) return jsonError("publicDisplayName is required", "VALIDATION", 400);

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return jsonError("Email already registered", "CONFLICT", 400);
  }

  const passwordHash = await hash(password, 10);
  const now = new Date();
  const id = crypto.randomUUID();
  const defaultTimezone = "America/New_York";

  await db.insert(users).values({
    id,
    email,
    passwordHash,
    publicDisplayName,
    primaryJourneyId: null,
    timezone: defaultTimezone,
    createdAt: now,
    updatedAt: now,
  });

  const token = await createSession(id);
  const opts = sessionCookieOptions(token);
  const response = NextResponse.json(
    { user: userToResponse({ id, email, publicDisplayName, primaryJourneyId: null, timezone: defaultTimezone }) },
    { status: 201 }
  );
  response.cookies.set(opts.name, opts.value, {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    path: opts.path,
    maxAge: opts.maxAge,
  });
  return response;
}
