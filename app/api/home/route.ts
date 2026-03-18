/**
 * GET /api/home — aggregated payload for Home screen. Requires session. Contract: api-contracts §4.8.
 */
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { getHomeData } from "@/lib/data/home";

export async function GET() {
  const session = await requireSession();
  if ("response" in session) return session.response;
  const { user } = session;
  const response = await getHomeData(user);
  return NextResponse.json(response);
}
