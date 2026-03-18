/**
 * Create invite for private journey (creator only). Uses server data layer (no self-fetch) for Cloudflare.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getJourneyDetail } from "@/lib/data/journeys";
import { InviteForm } from "@/components/domain/InviteForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvitePage({ params }: PageProps) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) notFound();

  const detail = await getJourneyDetail(id, user.id);
  if (!detail) notFound();
  const journey = detail.journey;
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
