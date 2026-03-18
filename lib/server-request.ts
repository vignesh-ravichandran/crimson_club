/**
 * Server-side request helpers (e.g. base URL for same-origin API fetch from layout).
 */
import { headers, cookies } from "next/headers";

/** Base URL for the current request (e.g. http://localhost:3000). Used for server-side fetch to own API. */
export async function getBaseUrl(): Promise<string> {
  // Deploy: set APP_URL or NEXT_PUBLIC_APP_URL so server-side fetch hits the correct origin (e.g. https://app.crimson-club.workers.dev).
  const envUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL;
  if (envUrl?.startsWith("http")) return envUrl.replace(/\/$/, "");

  const h = await headers();
  const host =
    h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Cookie header string for server-side fetch to own API (session). */
export async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
}
