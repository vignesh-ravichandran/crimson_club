/**
 * Review tab: pending weekly reviews (from home), link to journeys.
 * Uses server data layer directly (no fetch to own API) so it works on Cloudflare Workers.
 */
import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { getHomeData } from "@/lib/data/home";

export default async function ReviewPage() {
  const user = await getSessionUser();
  if (!user) {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <h1 className="text-xl font-semibold text-primary">Review</h1>
        <p className="mt-2 text-secondary">Not signed in.</p>
      </div>
    );
  }
  const data = await getHomeData(user);

  const { pendingWeeklyReviews } = data;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <h1 className="text-xl font-semibold text-primary">Review</h1>

      {pendingWeeklyReviews.length > 0 ? (
        <section>
          <h2 className="text-sm font-medium text-tertiary">Pending weekly reviews</h2>
          <ul className="mt-2 space-y-2">
            {pendingWeeklyReviews.map((p) => (
              <li key={`${p.journeyId}-${p.weekStart}`}>
                <Link
                  href={`/journeys/${p.journeyId}/weekly-review?weekStart=${p.weekStart}`}
                  className="block rounded-lg border border-border-default bg-surface p-3 text-primary hover:border-border-crimson"
                >
                  Week of {p.weekStart} — Complete review
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="text-secondary">No pending weekly reviews.</p>
      )}

      <Link href="/journeys" className="inline-block text-brand-crimson hover:underline">
        Browse journeys →
      </Link>
    </div>
  );
}
