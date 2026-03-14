"use client";

/**
 * Sign-in page. POST /api/auth/sign-in; on 200 redirect to app; on 401 show error.
 * Contract: docs/lld/api-contracts.md §3.3; design: docs/lld/frontend-design.md, ux-blueprint §4.1.
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ApiError } from "@/lib/types/api";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.push("/");
        router.refresh();
        return;
      }
      if (res.status === 401) {
        setError((data as ApiError).error ?? "Invalid email or password");
        return;
      }
      setError((data as ApiError).error ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold text-primary">Sign in</h1>
      <p className="mt-1 text-secondary text-sm">Crimson Club</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="signin-email" className="block text-sm font-medium text-primary">
            Email
          </label>
          <input
            id="signin-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary focus:border-border-crimson focus:outline-none"
            required
          />
        </div>
        <div>
          <label htmlFor="signin-password" className="block text-sm font-medium text-primary">
            Password
          </label>
          <input
            id="signin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-secondary">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-medium text-brand-crimson hover:underline">
          Create account
        </Link>
      </p>
    </div>
  );
}
