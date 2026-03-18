/**
 * App layout: session guard (redirect to sign-in if 401); shell with header, nav, journey selector, user menu.
 * Uses server data layer directly (no fetch to own API) so it works on Cloudflare Workers.
 */
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getJourneysForUser } from "@/lib/data/journeys";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");

  const journeys = await getJourneysForUser(user.id, user.primaryJourneyId);

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
