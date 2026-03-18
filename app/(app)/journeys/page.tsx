/**
 * Journeys list. Uses server data layer directly (no fetch to own API) so it works on Cloudflare Workers.
 */
import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { getJourneysForUser } from "@/lib/data/journeys";

export default async function JourneysListPage() {
  const user = await getSessionUser();
  const journeys = user
    ? await getJourneysForUser(user.id, user.primaryJourneyId)
    : [];

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-primary">Journeys</h1>
        <Link
          href="/journeys/new"
          className="rounded bg-brand-crimson px-4 py-2 text-sm font-medium text-onCrimson hover:bg-brand-crimsonActive"
        >
          Create journey
        </Link>
      </div>

      {journeys.length === 0 ? (
        <div className="rounded-lg border border-border-default bg-subtle p-6 text-center">
          <p className="text-secondary">No journeys yet.</p>
          <Link
            href="/journeys/new"
            className="mt-3 inline-block text-brand-crimson hover:underline"
          >
            Create your first journey →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {journeys.map((j) => (
            <li key={j.id}>
              <Link
                href={`/journeys/${j.id}`}
                className="flex items-center gap-4 rounded-lg border border-border-default bg-surface p-4 hover:border-border-crimson"
              >
                <span className="text-2xl">{j.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-primary">{j.name}</p>
                  <p className="text-sm text-secondary">
                    {j.visibility} · {j.participantCount ?? 0} participants
                    {j.isPrimary ? " · Primary" : ""}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
