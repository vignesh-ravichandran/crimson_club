"use client";

/**
 * Lessons list with filters (dimensionId, sourceType) and form to add lesson.
 */
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { DimensionResponse, LessonResponse } from "@/lib/types/api";

interface LessonsViewProps {
  journeyId: string;
  dimensions: DimensionResponse[];
  initialLessons: LessonResponse[];
  initialDimensionId: string;
  initialSourceType: string;
}

const SOURCE_TYPES = [
  { value: "", label: "All" },
  { value: "daily_reflection", label: "Daily reflection" },
  { value: "weekly_review", label: "Weekly review" },
] as const;

export function LessonsView({
  journeyId,
  dimensions,
  initialLessons,
  initialDimensionId,
  initialSourceType,
}: LessonsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [dimensionId, setDimensionId] = useState(initialDimensionId);
  const [sourceType, setSourceType] = useState(initialSourceType);

  const [text, setText] = useState("");
  const [sourceDate, setSourceDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [formSourceType, setFormSourceType] = useState<
    "daily_reflection" | "weekly_review"
  >("weekly_review");
  const [formDimensionId, setFormDimensionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function applyFilters() {
    const p = new URLSearchParams(searchParams.toString());
    if (dimensionId) p.set("dimensionId", dimensionId);
    else p.delete("dimensionId");
    if (sourceType) p.set("sourceType", sourceType);
    else p.delete("sourceType");
    startTransition(() => {
      router.push(`/journeys/${journeyId}/lessons?${p.toString()}`);
    });
  }

  async function handleAddLesson() {
    if (!text.trim()) {
      setError("Text is required");
      return;
    }
    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/journeys/${journeyId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          text: text.trim(),
          sourceDate,
          sourceType: formSourceType,
          dimensionId: formDimensionId.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to add lesson");
        return;
      }
      setMessage("Lesson added.");
      setText("");
      startTransition(() => router.refresh());
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-secondary">Dimension</label>
          <select
            value={dimensionId}
            onChange={(e) => setDimensionId(e.target.value)}
            className="mt-1 rounded border border-border-default bg-surface px-3 py-2 text-primary focus:border-brand-crimson focus:outline-none"
          >
            <option value="">All</option>
            {dimensions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.emoji} {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-secondary">Source type</label>
          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value)}
            className="mt-1 rounded border border-border-default bg-surface px-3 py-2 text-primary focus:border-brand-crimson focus:outline-none"
          >
            {SOURCE_TYPES.map((s) => (
              <option key={s.value || "all"} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={applyFilters}
          disabled={isPending}
          className="rounded border border-border-default bg-surface px-4 py-2 text-sm font-medium text-primary hover:border-brand-crimson min-h-[44px] disabled:opacity-50"
        >
          {isPending ? "Applying…" : "Apply"}
        </button>
      </div>

      {/* Add lesson form */}
      <section className="rounded-lg border border-border-default bg-surface p-4">
        <h2 className="text-sm font-medium text-primary">Add lesson</h2>
        {error && (
          <div className="mt-2 rounded border border-semantic-danger bg-semantic-dangerBg p-2 text-sm text-semantic-danger">
            {error}
          </div>
        )}
        {message && (
          <div className="mt-2 rounded border border-semantic-success bg-semantic-successBg p-2 text-sm text-semantic-success">
            {message}
          </div>
        )}
        <div className="mt-3 space-y-3">
          <div>
            <label className="block text-xs text-secondary">Text *</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary focus:border-brand-crimson focus:outline-none"
              placeholder="What did you learn?"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-secondary">Date</label>
              <input
                type="date"
                value={sourceDate}
                onChange={(e) => setSourceDate(e.target.value)}
                className="mt-1 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary focus:border-brand-crimson focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-secondary">Source type</label>
              <select
                value={formSourceType}
                onChange={(e) =>
                  setFormSourceType(e.target.value as "daily_reflection" | "weekly_review")
                }
                className="mt-1 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary focus:border-brand-crimson focus:outline-none"
              >
                <option value="daily_reflection">Daily reflection</option>
                <option value="weekly_review">Weekly review</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-secondary">Dimension (optional)</label>
            <select
              value={formDimensionId}
              onChange={(e) => setFormDimensionId(e.target.value)}
              className="mt-1 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary focus:border-brand-crimson focus:outline-none"
            >
              <option value="">None</option>
              {dimensions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.emoji} {d.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleAddLesson}
            disabled={submitting}
            className="rounded bg-brand-crimson px-4 py-2 text-sm font-medium text-onCrimson hover:bg-brand-crimsonActive disabled:opacity-50 min-h-[44px]"
          >
            {submitting ? "Adding…" : "Add lesson"}
          </button>
        </div>
      </section>

      {/* List */}
      <section>
        <h2 className="text-sm font-medium text-tertiary">Lessons</h2>
        {initialLessons.length === 0 ? (
          <p className="mt-2 text-secondary">No lessons yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {initialLessons.map((l) => (
              <li
                key={l.id}
                className="rounded-lg border border-border-default bg-surface p-3"
              >
                <p className="text-primary">{l.text}</p>
                <p className="mt-1 text-xs text-secondary">
                  {l.sourceDate} · {l.sourceType === "daily_reflection" ? "Daily reflection" : "Weekly review"}
                  {l.dimensionId &&
                    ` · ${
                      dimensions.find((d) => d.id === l.dimensionId)?.name ?? "Dimension"
                    }`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
