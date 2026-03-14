"use client";

/**
 * Sign-up page. POST /api/auth/sign-up; on 201 redirect to app; on 4xx show api-contracts error body.
 * Contract: docs/lld/api-contracts.md §3.3; design: docs/lld/frontend-design.md, ux-blueprint §4.1.
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ApiError } from "@/lib/types/api";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [publicDisplayName, setPublicDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, publicDisplayName }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 201) {
        router.push("/");
        router.refresh();
        return;
      }
      setError((data as ApiError).error ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold text-primary">Create account</h1>
      <p className="mt-1 text-secondary text-sm">Crimson Club — your display name is used on leaderboards.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-primary">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary focus:border-border-crimson focus:outline-none"
            required
          />
        </div>
        <div>
          <label htmlFor="signup-password" className="block text-sm font-medium text-primary">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary focus:border-border-crimson focus:outline-none"
            required
            minLength={8}
          />
          <p className="mt-1 text-xs text-secondary">At least 8 characters</p>
        </div>
        <div>
          <label htmlFor="signup-display-name" className="block text-sm font-medium text-primary">
            Public display name
          </label>
          <input
            id="signup-display-name"
            type="text"
            autoComplete="name"
            value={publicDisplayName}
            onChange={(e) => setPublicDisplayName(e.target.value)}
            className="mt-1 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary focus:border-border-crimson focus:outline-none"
            required
          />
        </div>
        {error && (
          <p className="text-sm text-semantic-danger" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-brand-crimson px-4 py-3 font-medium text-onCrimson hover:bg-brand-crimsonActive disabled:opacity-60 min-h-[44px]"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-secondary">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-brand-crimson hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
