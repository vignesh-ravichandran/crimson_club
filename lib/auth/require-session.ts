import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import type { SessionUser } from "@/lib/auth/session";
import type { ApiError } from "@/lib/types/api";

/**
 * Use in protected route handlers. Returns { user } or { response: NextResponse } for 401.
 * Example: const result = await requireSession(); if (result.response) return result.response;
 */
export async function requireSession(): Promise<
  | { user: SessionUser }
  | { response: NextResponse<ApiError> }
> {
  const user = await getSessionUser();
  if (!user) {
    return {
      response: NextResponse.json(
        { error: "Not authenticated" } as ApiError,
        { status: 401 }
      ),
    };
  }
  return { user };
}
