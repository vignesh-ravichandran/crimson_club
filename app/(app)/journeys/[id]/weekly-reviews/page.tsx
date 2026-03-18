/**
 * List past weekly reviews. Uses server data layer (no self-fetch) for Cloudflare.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getJourneyDetail } from "@/lib/data/journeys";
import { getWeeklyReviewsList } from "@/lib/data/weekly-reviews";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WeeklyReviewsListPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) notFound();

  const [detail, reviews] = await Promise.all([
    getJourneyDetail(id, user.id),
    getWeeklyReviewsList(id, user.id, 50),
  ]);
  if (!detail) notFound();
  const journeyName = detail.journey.name;

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
