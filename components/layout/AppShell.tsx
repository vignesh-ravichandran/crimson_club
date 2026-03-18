"use client";

/**
 * App shell: header with logo, primary journey selector, user menu (profile, sign-out).
 * Nav: Home, Journeys, Review, Profile. Per docs/lld/frontend-design.md §7, §10.
 */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { UserResponse } from "@/lib/types/api";
import type { JourneySummary } from "@/lib/types/api";

interface AppShellProps {
  user: UserResponse;
  journeys: JourneySummary[];
  primaryJourneyId: string | null;
  children: React.ReactNode;
}

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/journeys", label: "Journeys" },
  { href: "/review", label: "Review" },
  { href: "/read-through", label: "Read through" },
  { href: "/profile", label: "Profile" },
] as const;

export function AppShell({ user, journeys, primaryJourneyId, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);

  const primaryJourney = primaryJourneyId
    ? journeys.find((j) => j.id === primaryJourneyId)
    : null;

  async function handleSignOut() {
    await fetch("/api/auth/sign-out", { method: "POST", credentials: "include" });
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <header className="sticky top-0 z-10 border-b border-border-default bg-surface">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/" className="font-semibold text-brand-crimson">
            Crimson Club
          </Link>
          <div className="flex items-center gap-2">
            {/* Primary journey selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSelectorOpen((o) => !o)}
                className="flex items-center gap-1 rounded border border-border-default bg-surface px-3 py-2 text-sm text-primary hover:border-border-crimson min-h-[44px]"
                aria-expanded={selectorOpen}
                aria-haspopup="listbox"
                aria-label="Primary journey"
              >
                {primaryJourney ? (
                  <span>{primaryJourney.emoji} {primaryJourney.name}</span>
                ) : (
                  <span className="text-secondary">Select journey</span>
                )}
              </button>
              {selectorOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    aria-hidden
                    onClick={() => setSelectorOpen(false)}
                  />
                  <ul
                    role="listbox"
                    className="absolute right-0 top-full z-20 mt-1 max-h-60 w-56 overflow-auto rounded border border-border-default bg-surface py-1 shadow"
                  >
                    {journeys.length === 0 ? (
                      <li className="px-3 py-2 text-sm text-secondary">
                        No journeys yet
                      </li>
                    ) : (
                      journeys.map((j) => (
                        <li key={j.id}>
                          <Link
                            href={`/journeys/${j.id}`}
                            className="block px-3 py-2 text-sm text-primary hover:bg-crimsonSubtle"
                            onClick={() => setSelectorOpen(false)}
                          >
                            {j.emoji} {j.name}
                          </Link>
                        </li>
                      ))
                    )}
                  </ul>
                </>
              )}
            </div>
            {/* User menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((o) => !o)}
                className="rounded border border-border-default bg-surface px-3 py-2 text-sm text-primary min-h-[44px]"
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                aria-label="User menu"
              >
                {user.publicDisplayName}
              </button>
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    aria-hidden
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-20 mt-1 w-48 rounded border border-border-default bg-surface py-1 shadow"
                  >
                    <Link
                      href="/profile"
                      role="menuitem"
                      className="block px-3 py-2 text-sm text-primary hover:bg-crimsonSubtle"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleSignOut();
                      }}
                      className="block w-full px-3 py-2 text-left text-sm text-primary hover:bg-crimsonSubtle"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Bottom nav */}
        <nav className="flex border-t border-border-default" aria-label="Main">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 py-3 text-center text-sm font-medium min-h-[44px] flex items-center justify-center ${
                  isActive
                    ? "text-brand-crimson border-b-2 border-brand-crimson"
                    : "text-tertiary hover:text-primary"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
