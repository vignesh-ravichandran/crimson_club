/**
 * Create invite for private journey (creator only). POST /api/journeys/[id]/invite; show inviteUrl.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getBaseUrl, getCookieHeader } from "@/lib/server-request";
import { InviteForm } from "@/components/domain/InviteForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchJourney(
  id: string,
  cookie: string
): Promise<{ name: string; visibility: string; creatorId: string } | null> {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/journeys/${id}`, {
    cache: "no-store",
    headers: { cookie },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const j = data.journey;
  if (!j) return null;
  return {
    name: j.name,
    visibility: j.visibility,
    creatorId: j.creatorId,
  };
}

export default async function InvitePage({ params }: PageProps) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) notFound();

  const cookie = await getCookieHeader();
  const journey = await fetchJourney(id, cookie);
  if (!journey) notFound();
  if (journey.visibility !== "private") {
    return (
      <div className="mx-auto max-w-md space-y-4 p-4">
        <p className="text-secondary">Invites are only for private journeys.</p>
        <Link href={`/journeys/${id}`} className="text-brand-crimson hover:underline">
          ← Back to journey
        </Link>
      </div>
    );
  }
  if (journey.creatorId !== user.id) {
    return (
      <div className="mx-auto max-w-md space-y-4 p-4">
        <p className="text-secondary">Only the journey creator can create invites.</p>
        <Link href={`/journeys/${id}`} className="text-brand-crimson hover:underline">
          ← Back to journey
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <Link
        href={`/journeys/${id}`}
        className="text-sm text-brand-crimson hover:underline"
      >
        ← {journey.name}
      </Link>
      <h1 className="text-xl font-semibold text-primary">Invite someone</h1>
      <InviteForm journeyId={id} journeyName={journey.name} />
    </div>
  );
}
