"use client";

/**
 * Join journey: POST /api/journeys/[id]/join with inviteToken; on success redirect to journey.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface JoinJourneyFormProps {
  journeyId: string;
  journeyName: string;
  inviteToken: string;
}

export function JoinJourneyForm({
  journeyId,
  journeyName,
  inviteToken,
}: JoinJourneyFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/journeys/${journeyId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ inviteToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to join");
        return;
      }
      router.push(`/journeys/${journeyId}`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-secondary">
        You’re invited to join <strong className="text-primary">{journeyName}</strong>.
      </p>
      {error && (
        <div className="rounded border border-semantic-danger bg-semantic-dangerBg p-3 text-sm text-semantic-danger">
          {error}
        </div>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleJoin}
          disabled={submitting}
          className="rounded bg-brand-crimson px-4 py-2 text-sm font-medium text-onCrimson hover:bg-brand-crimsonActive disabled:opacity-50 min-h-[44px]"
        >
          {submitting ? "Joining…" : "Join journey"}
        </button>
        <Link
          href="/journeys"
          className="rounded border border-border-default bg-surface px-4 py-2 text-sm font-medium text-primary hover:border-brand-crimson min-h-[44px] inline-flex items-center"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}
