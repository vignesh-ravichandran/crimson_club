/**
 * POST /api/auth/sign-in. Contract: docs/lld/api-contracts.md §3.3.
 * Body email, password; verify password; create session; set cookie; return 200 + user. 401 on failure.
 */
import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createSession, sessionCookieOptions } from "@/lib/auth/session";
import { validateEmail } from "@/lib/auth/validation";
import type { SignInBody, UserResponse, ApiError } from "@/lib/types/api";

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

  const { email: rawEmail, password } = body as SignInBody;
  const email = validateEmail(rawEmail);
  if (!email) return jsonError("Valid email is required", "VALIDATION", 400);
  if (typeof password !== "string" || password.length === 0) {
    return jsonError("Password is required", "VALIDATION", 400);
  }

  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];
  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const match = await compare(password, user.passwordHash);
  if (!match) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const token = await createSession(user.id);
  const opts = sessionCookieOptions(token);
  const response = NextResponse.json({
    user: userToResponse({
      id: user.id,
      email: user.email,
      publicDisplayName: user.publicDisplayName,
      primaryJourneyId: user.primaryJourneyId,
      timezone: user.timezone,
    }),
  });
  response.cookies.set(opts.name, opts.value, {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    path: opts.path,
    maxAge: opts.maxAge,
  });
  return response;
}
