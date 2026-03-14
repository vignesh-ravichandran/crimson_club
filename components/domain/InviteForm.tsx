"use client";

/**
 * Create invite: email input, POST /api/journeys/[id]/invite; show inviteUrl and copy button.
 */
import { useState } from "react";

interface InviteFormProps {
  journeyId: string;
  journeyName: string;
}

export function InviteForm({ journeyId, journeyName }: InviteFormProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit() {
    if (!email.trim()) {
      setError("Enter an email address");
      return;
    }
    setError(null);
    setInviteUrl(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/journeys/${journeyId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to create invite");
        return;
      }
      setInviteUrl(data.inviteUrl ?? null);
    } finally {
      setSubmitting(false);
    }
  }

  async function copyLink() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="invite-email" className="block text-sm font-medium text-primary">
          Email address
        </label>
        <input
          id="invite-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary focus:border-brand-crimson focus:outline-none"
          placeholder="friend@example.com"
        />
      </div>
      {error && (
        <div className="rounded border border-semantic-danger bg-semantic-dangerBg p-3 text-sm text-semantic-danger">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="rounded bg-brand-crimson px-4 py-2 text-sm font-medium text-onCrimson hover:bg-brand-crimsonActive disabled:opacity-50 min-h-[44px]"
      >
        {submitting ? "Creating…" : "Create invite"}
      </button>

      {inviteUrl && (
        <div className="rounded-lg border border-border-default bg-surface p-4 space-y-2">
          <p className="text-sm font-medium text-primary">Invite link</p>
          <p className="text-sm text-secondary break-all">{inviteUrl}</p>
          <button
            type="button"
            onClick={copyLink}
            className="rounded border border-border-default bg-surface px-3 py-2 text-sm font-medium text-primary hover:border-brand-crimson min-h-[44px]"
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}
