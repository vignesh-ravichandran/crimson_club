"use client";

/**
 * Weekly review form: done checkbox, notes. Fetches GET review; PUT on save.
 */
import { useState, useEffect } from "react";

interface WeeklyReviewFormProps {
  journeyId: string;
  weekStart: string;
  journeyName: string;
}

interface Review {
  id: string;
  weekStart: string;
  done: boolean;
  notes?: string | null;
}

export function WeeklyReviewForm({
  journeyId,
  weekStart,
}: WeeklyReviewFormProps) {
  const [done, setDone] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/journeys/${journeyId}/weekly-reviews?weekStart=${weekStart}`,
          { credentials: "include" }
        );
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const review: Review | null = data.review ?? null;
        if (review) {
          setDone(review.done);
          setNotes(review.notes ?? "");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [journeyId, weekStart]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/journeys/${journeyId}/weekly-reviews`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            weekStart,
            done,
            notes: notes.trim() || undefined,
          }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to save");
        return;
      }
      setMessage("Saved.");
    } finally {
      setSaving(false);
    }
  }

  const weekLabel = (() => {
    const [y, m, d] = weekStart.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  })();

  if (loading) {
    return <p className="text-secondary">Loading...</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-secondary">Week of {weekLabel}</p>

      {error && (
        <div className="rounded border border-semantic-danger bg-semantic-dangerBg p-3 text-sm text-semantic-danger">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded border border-semantic-success bg-semantic-successBg p-3 text-sm text-semantic-success">
          {message}
        </div>
      )}

      <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border border-border-default bg-surface p-3">
        <input
          type="checkbox"
          checked={done}
          onChange={(e) => setDone(e.target.checked)}
          className="h-5 w-5 rounded border-border-default text-brand-crimson focus:ring-border-crimson"
        />
        <span className="font-medium text-primary">Mark review as done</span>
      </label>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-primary">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="mt-2 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary focus:border-border-crimson focus:outline-none"
          placeholder="Reflections, learnings..."
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="rounded bg-brand-crimson px-4 py-2 text-sm font-medium text-onCrimson hover:bg-brand-crimsonActive disabled:opacity-50 min-h-[44px]"
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
