/**
 * POST /api/auth/sign-out. Clear session in DB; clear cookie; 200.
 */
import { NextResponse } from "next/server";
import { destroySession, COOKIE_NAME } from "@/lib/auth/session";

export async function POST() {
  await destroySession();
  const response = new NextResponse(null, { status: 200 });
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
