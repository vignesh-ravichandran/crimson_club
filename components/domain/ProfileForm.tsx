"use client";

/**
 * Profile form: edit publicDisplayName and primaryJourneyId; PATCH on save.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserResponse, JourneySummary } from "@/lib/types/api";

interface ProfileFormProps {
  user: UserResponse;
  journeys: JourneySummary[];
}

export function ProfileForm({ user, journeys }: ProfileFormProps) {
  const router = useRouter();
  const [publicDisplayName, setPublicDisplayName] = useState(user.publicDisplayName);
  const [primaryJourneyId, setPrimaryJourneyId] = useState(
    user.primaryJourneyId ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    setMessage(null);
    setSaving(true);
    try {
      if (publicDisplayName.trim() !== user.publicDisplayName) {
        const res = await fetch("/api/users/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            publicDisplayName: publicDisplayName.trim(),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error ?? "Failed to update display name");
          return;
        }
      }
      if (primaryJourneyId !== (user.primaryJourneyId ?? "")) {
        const res = await fetch("/api/users/me/primary-journey", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ journeyId: primaryJourneyId || null }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error ?? "Failed to set primary journey");
          return;
        }
      }
      setMessage("Saved.");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const displayNameDirty = publicDisplayName.trim() !== user.publicDisplayName;
  const primaryDirty = primaryJourneyId !== (user.primaryJourneyId ?? "");
  const dirty = displayNameDirty || primaryDirty;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-primary">Email</label>
        <p className="mt-1 text-secondary">{user.email}</p>
      </div>

      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-primary">
          Display name
        </label>
        <p className="text-xs text-secondary">Shown on leaderboards.</p>
        <input
          id="displayName"
          type="text"
          value={publicDisplayName}
          onChange={(e) => setPublicDisplayName(e.target.value)}
          className="mt-2 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary focus:border-brand-crimson focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="primaryJourney" className="block text-sm font-medium text-primary">
          Primary journey
        </label>
        <p className="text-xs text-secondary">Shown on Home.</p>
        <select
          id="primaryJourney"
          value={primaryJourneyId}
          onChange={(e) => setPrimaryJourneyId(e.target.value)}
          className="mt-2 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary focus:border-brand-crimson focus:outline-none"
        >
          <option value="">None</option>
          {journeys.map((j) => (
            <option key={j.id} value={j.id}>
              {j.emoji} {j.name}
            </option>
          ))}
        </select>
      </div>

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

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !dirty}
        className="rounded bg-brand-crimson px-4 py-2 text-sm font-medium text-onCrimson hover:bg-brand-crimsonActive disabled:opacity-50 min-h-[44px]"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
