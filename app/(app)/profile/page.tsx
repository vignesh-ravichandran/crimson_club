/**
 * Profile: view/edit display name and primary journey. PATCH /api/users/me and /api/users/me/primary-journey.
 */
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getBaseUrl, getCookieHeader } from "@/lib/server-request";
import type { UserResponse, JourneySummary } from "@/lib/types/api";
import { ProfileForm } from "@/components/domain/ProfileForm";

async function fetchJourneys(cookie: string): Promise<JourneySummary[]> {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/journeys`, {
    cache: "no-store",
    headers: { cookie },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.journeys ?? [];
}

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) notFound();

  const cookie = await getCookieHeader();
  const journeys = await fetchJourneys(cookie);

  const userResponse: UserResponse = {
    id: user.id,
    email: user.email,
    publicDisplayName: user.publicDisplayName,
    primaryJourneyId: user.primaryJourneyId,
    timezone: user.timezone,
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <h1 className="text-xl font-semibold text-primary">Profile</h1>
      <ProfileForm user={userResponse} journeys={journeys} />
    </div>
  );
}
