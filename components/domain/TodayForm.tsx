"use client";

/**
 * Today screen form: dimension chips (scale 2–5), reflection note, save. 7-day date picker.
 */
import { useState, useEffect, useCallback } from "react";
import type {
  DimensionResponse,
  JourneyVisibleLabelsResponse,
  DimensionValueResponse,
  DailyEntryResponse,
} from "@/lib/types/api";

interface TodayFormProps {
  journeyId: string;
  dimensions: DimensionResponse[];
  visibleLabels: JourneyVisibleLabelsResponse;
  initialDate: string;
  initialEntry: DailyEntryResponse | null;
  initialDimensionValues: DimensionValueResponse[];
  /** User timezone for display */
  timezone: string;
}

const SCALE_LEVELS = [2, 3, 4, 5] as const;

function getLabel(scale: number, labels: JourneyVisibleLabelsResponse): string {
  switch (scale) {
    case 2: return labels.labelLow;
    case 3: return labels.labelMedium;
    case 4: return labels.labelHigh;
    case 5: return labels.labelExcellent;
    default: return "—";
  }
}

export function TodayForm({
  journeyId,
  dimensions,
  visibleLabels,
  initialDate,
  initialEntry,
  initialDimensionValues,
}: TodayFormProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [datesInWindow, setDatesInWindow] = useState<string[]>([initialDate]);
  const [values, setValues] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const d of dimensions) {
      const v = initialDimensionValues.find((dv) => dv.dimensionId === d.id);
      map[d.id] = v?.canonicalScale ?? 2;
    }
    return map;
  });
  const [reflectionNote, setReflectionNote] = useState(initialEntry?.reflectionNote ?? "");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Build list of 7 days (today back to today-6)
  useEffect(() => {
    const list: string[] = [];
    const d = new Date(initialDate + "T12:00:00");
    for (let i = 0; i < 7; i++) {
      const x = new Date(d);
      x.setDate(x.getDate() - i);
      list.push(x.toISOString().slice(0, 10));
    }
    setDatesInWindow(list);
  }, [initialDate]);

  const loadDaily = useCallback(
    async (date: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/journeys/${journeyId}/daily?date=${date}`,
          { credentials: "include" }
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "Failed to load");
          return;
        }
        const data = await res.json();
        const map: Record<string, number> = {};
        for (const d of dimensions) {
          const v = data.dimensionValues?.find(
            (dv: DimensionValueResponse) => dv.dimensionId === d.id
          );
          map[d.id] = v?.canonicalScale ?? 2;
        }
        setValues(map);
        setReflectionNote(data.entry?.reflectionNote ?? "");
      } finally {
        setLoading(false);
      }
    },
    [journeyId, dimensions]
  );

  useEffect(() => {
    if (selectedDate) loadDaily(selectedDate);
  }, [selectedDate, loadDaily]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaveMessage(null);
    try {
      const dimensionValues = dimensions.map((d) => ({
        dimensionId: d.id,
        canonicalScale: values[d.id] ?? 2,
      }));
      const res = await fetch(`/api/journeys/${journeyId}/daily`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          date: selectedDate,
          dimensionValues,
          reflectionNote: reflectionNote.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Save failed");
        return;
      }
      setSaveMessage("Saved.");
    } finally {
      setSaving(false);
    }
  }

  const sortedDimensions = [...dimensions].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-6">
      <p className="text-sm text-secondary">
        You can edit entries for the last 7 days (including today).
      </p>

      {/* Date picker */}
      <div>
        <label className="block text-sm font-medium text-primary">Date</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {datesInWindow.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedDate(d)}
              className={`min-h-[44px] rounded-lg border px-3 py-2 text-sm ${
                selectedDate === d
                  ? "border-border-crimson bg-crimsonSubtle text-brand-crimsonDeep"
                  : "border-border-default bg-surface text-secondary hover:border-border-crimson"
              }`}
            >
              {d === initialDate ? "Today" : d}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded border border-semantic-danger bg-semantic-dangerBg p-3 text-sm text-semantic-danger">
          {error}
        </div>
      )}
      {saveMessage && (
        <div className="rounded border border-semantic-success bg-semantic-successBg p-3 text-sm text-semantic-success">
          {saveMessage}
        </div>
      )}

      {loading ? (
        <p className="text-secondary">Loading...</p>
      ) : (
        <>
          {sortedDimensions.map((dim) => (
            <div key={dim.id} className="rounded-lg border border-border-default bg-surface p-4">
              <p className="font-medium text-primary">
                {dim.emoji} {dim.name}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {SCALE_LEVELS.map((scale) => (
                  <button
                    key={scale}
                    type="button"
                    onClick={() =>
                      setValues((prev) => ({ ...prev, [dim.id]: scale }))
                    }
                    className={`min-h-[44px] rounded-lg border px-4 py-2 text-sm ${
                      (values[dim.id] ?? 2) === scale
                        ? "border-border-crimson bg-crimsonSubtle text-brand-crimsonDeep"
                        : "border-border-default bg-surface text-secondary hover:border-border-crimson"
                    }`}
                  >
                    {getLabel(scale, visibleLabels)}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div>
            <label htmlFor="reflection" className="block text-sm font-medium text-primary">
              Optional: Any learning to carry forward?
            </label>
            <textarea
              id="reflection"
              value={reflectionNote}
              onChange={(e) => setReflectionNote(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary focus:border-border-crimson focus:outline-none"
              placeholder="Reflect on your day (optional)"
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
        </>
      )}
    </div>
  );
}
