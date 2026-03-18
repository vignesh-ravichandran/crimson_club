/**
 * Server-side request helpers (e.g. base URL for same-origin API fetch from layout).
 */
import { headers, cookies } from "next/headers";

/** Production app URL when running on Cloudflare. Change if you use a different domain. */
const PRODUCTION_APP_URL = "https://app.crimson-club.workers.dev";

/** Base URL for the current request (e.g. http://localhost:3000). Used for server-side fetch to own API. */
export async function getBaseUrl(): Promise<string> {
  // 1) process.env (local .env, or inlined at build — may be missing in Worker runtime)
  let envUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL;
  // 2) Cloudflare Worker env (wrangler [vars])
  if (!envUrl?.startsWith("http")) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getCloudflareContext } = require("@opennextjs/cloudflare");
      const { env } = getCloudflareContext();
      envUrl = (env as { APP_URL?: string })?.APP_URL ?? envUrl;
    } catch {
      // Not on Cloudflare or context missing
    }
  }
  if (envUrl?.startsWith("http")) return envUrl.replace(/\/$/, "");

  const h = await headers();
  const host =
    h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");
  const fromHeaders = `${proto}://${host}`;
  // 3) Same-origin from request headers (works when Host is correct)
  if (fromHeaders.includes("crimson-club") || fromHeaders.includes("localhost")) {
    return fromHeaders;
  }
  // 4) Worker runtime: Host often wrong or internal — use known production URL
  return PRODUCTION_APP_URL;
}

/** Cookie header string for server-side fetch to own API (session). */
export async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
}
