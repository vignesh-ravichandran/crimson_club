/**
 * App layout: session guard (redirect to sign-in if 401); shell with header, nav, journey selector, user menu.
 * Per docs/lld/frontend-design.md §8.1 and task 04-frontend-auth-shell.
 */
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getBaseUrl } from "@/lib/server-request";
import { AppShell } from "@/components/layout/AppShell";
import type { JourneySummary } from "@/lib/types/api";

async function fetchJourneys(cookieHeader: string): Promise<JourneySummary[]> {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/journeys`, {
    cache: "no-store",
    headers: { cookie: cookieHeader },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.journeys ?? [];
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const journeys = await fetchJourneys(cookieHeader);

  return (
    <AppShell
      user={{
        id: user.id,
        email: user.email,
        publicDisplayName: user.publicDisplayName,
        primaryJourneyId: user.primaryJourneyId,
        timezone: user.timezone,
      }}
      journeys={journeys}
      primaryJourneyId={user.primaryJourneyId}
    >
      {children}
    </AppShell>
  );
}
