/**
 * GET /api/auth/me. Require valid session; return 200 with user or 401.
 */
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import type { ApiError } from "@/lib/types/api";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "Not authenticated" } as ApiError,
      { status: 401 }
    );
  }
  return NextResponse.json({ user });
}
