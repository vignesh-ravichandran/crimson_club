/**
 * Join journey by invite link: ?token=... . Uses server data layer for journey name (no self-fetch) on Cloudflare.
 */
import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { getJourneyById } from "@/lib/data/journeys";
import { JoinJourneyForm } from "@/components/domain/JoinJourneyForm";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function JoinJourneyPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { token } = await searchParams;
  const user = await getSessionUser();
  if (!user) {
    const signInUrl = `/sign-in?callbackUrl=${encodeURIComponent(`/journeys/${id}/join?token=${token ?? ""}`)}`;
    return (
      <div className="mx-auto max-w-md space-y-4 p-4">
        <h1 className="text-xl font-semibold text-primary">Sign in to join</h1>
        <p className="text-secondary">
          You need to sign in to join this journey.
        </p>
        <Link
          href={signInUrl}
          className="inline-block rounded bg-brand-crimson px-4 py-2 text-sm font-medium text-onCrimson hover:bg-brand-crimsonActive"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const journey = await getJourneyById(id);
  const journeyName = journey?.name ?? "This journey";

  if (!token?.trim()) {
    return (
      <div className="mx-auto max-w-md space-y-4 p-4">
        <h1 className="text-xl font-semibold text-primary">Invalid invite</h1>
        <p className="text-secondary">This invite link is missing a token.</p>
        <Link href="/journeys" className="text-brand-crimson hover:underline">
          ← Back to journeys
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <h1 className="text-xl font-semibold text-primary">Join journey</h1>
      <JoinJourneyForm
        journeyId={id}
        journeyName={journeyName}
        inviteToken={token}
      />
    </div>
  );
}
