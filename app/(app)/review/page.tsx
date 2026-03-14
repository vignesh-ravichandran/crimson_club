/**
 * Review tab: pending weekly reviews (from home), link to journeys.
 */
import Link from "next/link";
import { getBaseUrl, getCookieHeader } from "@/lib/server-request";
import type { HomeResponse } from "@/lib/types/api";

async function fetchHome(): Promise<HomeResponse | null> {
  const base = await getBaseUrl();
  const cookie = await getCookieHeader();
  const res = await fetch(`${base}/api/home`, { cache: "no-store", headers: { cookie } });
  if (!res.ok) return null;
  return res.json();
}

export default async function ReviewPage() {
  const data = await fetchHome();

  if (!data) {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <h1 className="text-xl font-semibold text-primary">Review</h1>
        <p className="mt-2 text-secondary">Could not load review data.</p>
      </div>
    );
  }

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
