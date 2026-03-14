"use client";

/**
 * Multi-step Create journey wizard: Basics → Dimensions (2–8, weights 100) → Visible labels → Optional invite (if private).
 * POST /api/journeys on submit; redirect to /journeys/[id] on 201.
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CreateJourneyBody } from "@/lib/types/api";

const DEFAULT_VISIBLE_LABELS = {
  labelMissed: "Missed",
  labelLow: "Showed up",
  labelMedium: "Progressed",
  labelHigh: "Built",
  labelExcellent: "Conquered",
};

type Step = 1 | 2 | 3 | 4;

interface DimensionDraft {
  name: string;
  emoji: string;
  weight: string;
  isMandatory: boolean;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function CreateJourneyWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Basics
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("📌");
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");

  // Step 2: Dimensions (min 2, max 8; weights sum 100)
  const [dimensions, setDimensions] = useState<DimensionDraft[]>([
    { name: "", emoji: "•", weight: "34", isMandatory: false },
    { name: "", emoji: "•", weight: "33", isMandatory: false },
    { name: "", emoji: "•", weight: "33", isMandatory: false },
  ]);

  // Step 3: Visible labels
  const [visibleLabels, setVisibleLabels] = useState(DEFAULT_VISIBLE_LABELS);

  // Step 4 (optional): Invite email
  const [inviteEmail, setInviteEmail] = useState("");

  function addDimension() {
    if (dimensions.length >= 8) return;
    setDimensions((d) => [...d, { name: "", emoji: "•", weight: "0", isMandatory: false }]);
  }

  function removeDimension(i: number) {
    if (dimensions.length <= 2) return;
    setDimensions((d) => d.filter((_, idx) => idx !== i));
  }

  function updateDimension(i: number, field: keyof DimensionDraft, value: string | boolean) {
    setDimensions((d) => {
      const next = [...d];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }

  const weightSum = dimensions.reduce((s, d) => s + (parseFloat(d.weight) || 0), 0);
  const weightValid = Math.abs(weightSum - 100) < 0.01;
  const dimCountValid = dimensions.length >= 2 && dimensions.length <= 8;
  const dimNamesFilled = dimensions.every((d) => d.name.trim().length > 0);

  function buildBody(): CreateJourneyBody | null {
    if (!name.trim()) return null;
    const dims = dimensions
      .filter((d) => d.name.trim())
      .map((d) => ({
        name: d.name.trim(),
        emoji: (d.emoji || "•").trim(),
        weight: parseFloat(d.weight) || 0,
        isMandatory: !!d.isMandatory,
      }));
    if (dims.length < 2 || dims.length > 8) return null;
    const sum = dims.reduce((s, d) => s + d.weight, 0);
    if (Math.abs(sum - 100) > 0.01) return null;
    return {
      name: name.trim(),
      description: description.trim() || undefined,
      emoji: (emoji || "📌").trim(),
      visibility,
      startDate: startDate || todayISO(),
      endDate: endDate.trim() || undefined,
      dimensions: dims,
      visibleLabels,
    };
  }

  async function handleSubmit() {
    const body = buildBody();
    if (!body) {
      setError("Please fix validation errors (name, 2–8 dimensions, weights sum 100).");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/journeys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to create journey");
        return;
      }
      const id = data.id as string | undefined;
      if (id && visibility === "private" && inviteEmail.trim()) {
        const inviteRes = await fetch(`/api/journeys/${id}/invite`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email: inviteEmail.trim() }),
        });
        if (!inviteRes.ok) {
          // Journey created; invite optional — still redirect
        }
      }
      if (id) router.push(`/journeys/${id}`);
      else router.push("/journeys");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <Link href="/journeys" className="text-sm text-brand-crimson hover:underline">
        ← Back to journeys
      </Link>
      <h1 className="text-xl font-semibold text-primary">Create journey</h1>

      {/* Step indicator */}
      <div className="flex gap-2 text-sm text-secondary">
        <span className={step >= 1 ? "text-brand-crimson font-medium" : ""}>1. Basics</span>
        <span>·</span>
        <span className={step >= 2 ? "text-brand-crimson font-medium" : ""}>2. Dimensions</span>
        <span>·</span>
        <span className={step >= 3 ? "text-brand-crimson font-medium" : ""}>3. Labels</span>
        {visibility === "private" && (
          <>
            <span>·</span>
            <span className={step >= 4 ? "text-brand-crimson font-medium" : ""}>4. Invite</span>
          </>
        )}
      </div>

      {error && (
        <div className="rounded border border-semantic-danger bg-semantic-dangerBg p-3 text-sm text-semantic-danger">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary focus:border-brand-crimson focus:outline-none"
              placeholder="e.g. Fitness 2025"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary focus:border-brand-crimson focus:outline-none"
              placeholder="What this journey is about"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary">Emoji</label>
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="mt-1 w-16 rounded border border-border-default bg-surface px-2 py-2 text-center text-2xl focus:border-brand-crimson focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary">Start date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary focus:border-brand-crimson focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary">End date (optional)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary focus:border-brand-crimson focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary">Visibility</label>
            <div className="mt-2 flex gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === "public"}
                  onChange={() => setVisibility("public")}
                  className="text-brand-crimson"
                />
                <span className="text-primary">Public</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === "private"}
                  onChange={() => setVisibility("private")}
                  className="text-brand-crimson"
                />
                <span className="text-primary">Private</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!name.trim()}
              className="rounded bg-brand-crimson px-4 py-2 text-sm font-medium text-onCrimson hover:bg-brand-crimsonActive disabled:opacity-50 min-h-[44px]"
            >
              Next: Dimensions
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-secondary">Add 2–8 dimensions. Weights must sum to 100.</p>
          {!dimCountValid && (
            <p className="text-sm text-semantic-danger">Need 2–8 dimensions.</p>
          )}
          {!weightValid && (
            <p className="text-sm text-semantic-danger">Weights must sum to 100 (current: {weightSum.toFixed(1)}).</p>
          )}
          {dimensions.map((d, i) => (
            <div
              key={i}
              className="rounded border border-border-default bg-surface p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-secondary">Dimension {i + 1}</span>
                {dimensions.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeDimension(i)}
                    className="text-sm text-semantic-danger hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-[1fr_auto_80px] gap-2 items-end">
                <div>
                  <label className="block text-xs text-secondary">Name</label>
                  <input
                    type="text"
                    value={d.name}
                    onChange={(e) => updateDimension(i, "name", e.target.value)}
                    className="mt-0.5 w-full rounded border border-border-default bg-surface px-2 py-1.5 text-primary focus:border-brand-crimson focus:outline-none"
                    placeholder="e.g. Movement"
                  />
                </div>
                <div>
                  <label className="block text-xs text-secondary">Emoji</label>
                  <input
                    type="text"
                    value={d.emoji}
                    onChange={(e) => updateDimension(i, "emoji", e.target.value)}
                    className="mt-0.5 w-12 rounded border border-border-default bg-surface px-1 py-1.5 text-center focus:border-brand-crimson focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-secondary">Weight</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={d.weight}
                    onChange={(e) => updateDimension(i, "weight", e.target.value)}
                    className="mt-0.5 w-full rounded border border-border-default bg-surface px-2 py-1.5 text-primary focus:border-brand-crimson focus:outline-none"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={d.isMandatory}
                  onChange={(e) => updateDimension(i, "isMandatory", e.target.checked)}
                  className="rounded text-brand-crimson"
                />
                <span className="text-sm text-secondary">Mandatory</span>
              </label>
            </div>
          ))}
          {dimensions.length < 8 && (
            <button
              type="button"
              onClick={addDimension}
              className="rounded border border-border-default bg-surface px-3 py-2 text-sm text-primary hover:border-brand-crimson"
            >
              + Add dimension
            </button>
          )}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded border border-border-default bg-surface px-4 py-2 text-sm font-medium text-primary hover:border-brand-crimson min-h-[44px]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={!dimCountValid || !weightValid || !dimNamesFilled}
              className="rounded bg-brand-crimson px-4 py-2 text-sm font-medium text-onCrimson hover:bg-brand-crimsonActive disabled:opacity-50 min-h-[44px]"
            >
              Next: Labels
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm text-secondary">
            Labels shown for dimension scores (e.g. in leaderboard). You can keep defaults.
          </p>
          {(["labelMissed", "labelLow", "labelMedium", "labelHigh", "labelExcellent"] as const).map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-primary">{key.replace("label", "")}</label>
              <input
                type="text"
                value={visibleLabels[key]}
                onChange={(e) => setVisibleLabels((l) => ({ ...l, [key]: e.target.value }))}
                className="mt-1 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary focus:border-brand-crimson focus:outline-none"
              />
            </div>
          ))}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded border border-border-default bg-surface px-4 py-2 text-sm font-medium text-primary hover:border-brand-crimson min-h-[44px]"
            >
              Back
            </button>
            {visibility === "private" ? (
              <button
                type="button"
                onClick={() => setStep(4)}
                className="rounded bg-brand-crimson px-4 py-2 text-sm font-medium text-onCrimson hover:bg-brand-crimsonActive min-h-[44px]"
              >
                Next: Invite (optional)
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded bg-brand-crimson px-4 py-2 text-sm font-medium text-onCrimson hover:bg-brand-crimsonActive disabled:opacity-50 min-h-[44px]"
              >
                {submitting ? "Creating…" : "Create journey"}
              </button>
            )}
          </div>
        </div>
      )}

      {step === 4 && visibility === "private" && (
        <div className="space-y-4">
          <p className="text-sm text-secondary">Optionally invite someone by email. You can also invite later from the journey page.</p>
          <div>
            <label className="block text-sm font-medium text-primary">Invite email (optional)</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="mt-1 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary focus:border-brand-crimson focus:outline-none"
              placeholder="friend@example.com"
            />
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded border border-border-default bg-surface px-4 py-2 text-sm font-medium text-primary hover:border-brand-crimson min-h-[44px]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded bg-brand-crimson px-4 py-2 text-sm font-medium text-onCrimson hover:bg-brand-crimsonActive disabled:opacity-50 min-h-[44px]"
            >
              {submitting ? "Creating…" : "Create journey"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
