/**
 * List past weekly reviews. GET /api/journeys/[id]/weekly-reviews/list. Links to weekly-review?weekStart=.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBaseUrl, getCookieHeader } from "@/lib/server-request";
import type { WeeklyReviewResponse } from "@/lib/types/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchJourneyName(
  id: string,
  cookie: string
): Promise<string | null> {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/journeys/${id}`, {
    cache: "no-store",
    headers: { cookie },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.journey?.name ?? null;
}

async function fetchReviewsList(
  journeyId: string,
  cookie: string
): Promise<WeeklyReviewResponse[]> {
  const base = await getBaseUrl();
  const res = await fetch(
    `${base}/api/journeys/${journeyId}/weekly-reviews/list?limit=50`,
    { cache: "no-store", headers: { cookie } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.reviews ?? [];
}

export default async function WeeklyReviewsListPage({ params }: PageProps) {
  const { id } = await params;
  const cookie = await getCookieHeader();
  const [journeyName, reviews] = await Promise.all([
    fetchJourneyName(id, cookie),
    fetchReviewsList(id, cookie),
  ]);
  if (!journeyName) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4">
      <Link
        href={`/journeys/${id}/weekly-review`}
        className="text-sm text-brand-crimson hover:underline"
      >
        ← {journeyName} · Weekly review
      </Link>
      <h1 className="text-xl font-semibold text-primary">Past weekly reviews</h1>

      {reviews.length === 0 ? (
        <p className="text-secondary">No reviews yet.</p>
      ) : (
        <ul className="space-y-2">
          {reviews.map((r) => {
            const [y, m, d] = r.weekStart.split("-").map(Number);
            const date = new Date(y, m - 1, d);
            const label = date.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            return (
              <li key={r.id}>
                <Link
                  href={`/journeys/${id}/weekly-review?weekStart=${r.weekStart}`}
                  className="flex items-center justify-between rounded-lg border border-border-default bg-surface p-3 hover:border-border-crimson"
                >
                  <span className="text-primary">Week of {label}</span>
                  <span
                    className={`text-sm ${
                      r.done ? "text-semantic-success" : "text-secondary"
                    }`}
                  >
                    {r.done ? "Done" : "Not done"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
