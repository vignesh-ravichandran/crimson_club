/**
 * Server-side request helpers (e.g. base URL for same-origin API fetch from layout).
 */
import { headers, cookies } from "next/headers";

/** Base URL for the current request (e.g. http://localhost:3000). Used for server-side fetch to own API. */
export async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Cookie header string for server-side fetch to own API (session). */
export async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
}
