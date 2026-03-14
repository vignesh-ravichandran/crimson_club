/**
 * Session and cookie helpers. Contract: docs/lld/api-contracts.md §3.
 * Cookie name: crimson_session. Opaque token in cookie; server stores hash in sessions.
 */
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users, sessions } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import type { User } from "@/lib/db/schema";
import crypto from "crypto";

export const COOKIE_NAME = "crimson_session";
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters");
  }
  return secret;
}

/** Hash the opaque token for storage and lookup. */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(getSecret() + token).digest("hex");
}

/** Generate a new opaque session token (32-byte hex). */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export interface SessionUser {
  id: string;
  email: string;
  publicDisplayName: string;
  primaryJourneyId: string | null;
  timezone: string;
}

function userToSessionUser(u: User): SessionUser {
  return {
    id: u.id,
    email: u.email,
    publicDisplayName: u.publicDisplayName,
    primaryJourneyId: u.primaryJourneyId,
    timezone: u.timezone,
  };
}

/**
 * Get current user from session cookie. Returns null if no cookie, invalid, or expired.
 * Call from route handlers that need the current user.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const now = new Date();

  const rows = await db
    .select()
    .from(sessions)
    .where(
      and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now))
    )
    .limit(1);

  const session = rows[0];
  if (!session) return null;

  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  const user = userRows[0];
  if (!user) return null;

  return userToSessionUser(user);
}

/** Create a session for the user and return the opaque token to set in cookie. */
export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + MAX_AGE_SECONDS * 1000);
  const id = crypto.randomUUID();

  await db.insert(sessions).values({
    id,
    userId,
    tokenHash,
    expiresAt,
    createdAt: now,
  });

  return token;
}

/** Clear session in DB by token from cookie, then clear cookie. */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    const tokenHash = hashToken(token);
    await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
  }
}

/** Options for setting the session cookie on the response. */
export function sessionCookieOptions(token: string): {
  name: string;
  value: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
} {
  const isDev = process.env.NODE_ENV !== "production";
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: !isDev,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}
