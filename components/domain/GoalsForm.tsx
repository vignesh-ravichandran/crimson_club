"use client";

/**
 * Goals form: create weekly/monthly goal (POST), set outcome 0–5 (PATCH). 7-day edit rule.
 */
import { useState } from "react";
import type { GoalResponse } from "@/lib/types/api";

const OUTCOME_LABELS: Record<number, string> = {
  0: "Missed (optional)",
  1: "Missed (mandatory)",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Excellent",
};

interface GoalsFormProps {
  journeyId: string;
  weeklyGoal: GoalResponse | null;
  monthlyGoal: GoalResponse | null;
  weekPeriod: { periodStart: string; periodEnd: string };
  monthPeriod: { periodStart: string; periodEnd: string };
  canEditWeeklyOutcome: boolean;
  canEditMonthlyOutcome: boolean;
  timezone: string;
}

function formatPeriodLabel(periodStart: string): string {
  const [y, m, d] = periodStart.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function GoalsForm({
  journeyId,
  weeklyGoal,
  monthlyGoal,
  weekPeriod,
  monthPeriod,
  canEditWeeklyOutcome,
  canEditMonthlyOutcome,
}: GoalsFormProps) {
  const [weeklyStatement, setWeeklyStatement] = useState(
    weeklyGoal?.goalStatement ?? ""
  );
  const [monthlyStatement, setMonthlyStatement] = useState(
    monthlyGoal?.goalStatement ?? ""
  );
  const [weeklyOutcome, setWeeklyOutcome] = useState(
    weeklyGoal?.outcome ?? null
  );
  const [monthlyOutcome, setMonthlyOutcome] = useState(
    monthlyGoal?.outcome ?? null
  );
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function createGoal(
    goalType: "weekly" | "monthly",
    periodStart: string,
    periodEnd: string,
    goalStatement: string
  ) {
    setLoading(goalType);
    setError(null);
    try {
      const res = await fetch(`/api/journeys/${journeyId}/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          goalType,
          periodStart,
          periodEnd,
          goalStatement: goalStatement.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to create goal");
        return;
      }
      setMessage("Goal created. Reload to set outcome.");
      window.location.reload();
    } finally {
      setLoading(null);
    }
  }

  async function patchOutcome(
    goalId: string,
    outcome: number,
    canEdit: boolean,
    type: "weekly" | "monthly"
  ) {
    if (!canEdit) return;
    setError(null);
    try {
      const res = await fetch(
        `/api/journeys/${journeyId}/goals/${goalId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ outcome }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to update outcome");
        return;
      }
      setMessage("Outcome saved.");
      const updated = data.goal?.outcome ?? outcome;
      if (type === "weekly") setWeeklyOutcome(updated);
      else setMonthlyOutcome(updated);
    } catch {
      setError("Request failed");
    }
  }

  return (
    <div className="space-y-8">
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

      {/* Weekly goal */}
      <section className="rounded-lg border border-border-default bg-surface p-4">
        <h2 className="text-sm font-medium text-tertiary">
          Week of {formatPeriodLabel(weekPeriod.periodStart)}
        </h2>
        {weeklyGoal ? (
          <>
            {weeklyGoal.goalStatement && (
              <p className="mt-2 text-primary">{weeklyGoal.goalStatement}</p>
            )}
            <div className="mt-4">
              <label className="block text-sm font-medium text-primary">
                Outcome (0–5)
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {([0, 1, 2, 3, 4, 5] as const).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() =>
                      canEditWeeklyOutcome &&
                      patchOutcome(weeklyGoal.id, n, canEditWeeklyOutcome, "weekly")
                    }
                    disabled={!canEditWeeklyOutcome}
                    className={`min-h-[44px] rounded-lg border px-3 py-2 text-sm ${
                      (weeklyOutcome ?? weeklyGoal.outcome) === n
                        ? "border-border-crimson bg-crimsonSubtle text-brand-crimsonDeep"
                        : "border-border-default bg-surface text-secondary"
                    } disabled:opacity-50`}
                    title={OUTCOME_LABELS[n]}
                  >
                    {n}: {OUTCOME_LABELS[n]}
                  </button>
                ))}
              </div>
              {!canEditWeeklyOutcome && (
                <p className="mt-2 text-xs text-secondary">
                  Outcome can only be edited within 7 days after the week ends.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="mt-3">
            <label className="block text-sm font-medium text-primary">
              Goal statement (optional)
            </label>
            <input
              type="text"
              value={weeklyStatement}
              onChange={(e) => setWeeklyStatement(e.target.value)}
              className="mt-2 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary focus:border-border-crimson focus:outline-none"
              placeholder="What do you want to achieve this week?"
            />
            <button
              type="button"
              onClick={() =>
                createGoal(
                  "weekly",
                  weekPeriod.periodStart,
                  weekPeriod.periodEnd,
                  weeklyStatement
                )
              }
              disabled={loading === "weekly"}
              className="mt-3 rounded bg-brand-crimson px-4 py-2 text-sm font-medium text-onCrimson hover:bg-brand-crimsonActive disabled:opacity-50"
            >
              {loading === "weekly" ? "Creating..." : "Create weekly goal"}
            </button>
          </div>
        )}
      </section>

      {/* Monthly goal */}
      <section className="rounded-lg border border-border-default bg-surface p-4">
        <h2 className="text-sm font-medium text-tertiary">
          Month of {formatPeriodLabel(monthPeriod.periodStart)}
        </h2>
        {monthlyGoal ? (
          <>
            {monthlyGoal.goalStatement && (
              <p className="mt-2 text-primary">{monthlyGoal.goalStatement}</p>
            )}
            <div className="mt-4">
              <label className="block text-sm font-medium text-primary">
                Outcome (0–5)
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {([0, 1, 2, 3, 4, 5] as const).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() =>
                      canEditMonthlyOutcome &&
                      patchOutcome(monthlyGoal.id, n, canEditMonthlyOutcome, "monthly")
                    }
                    disabled={!canEditMonthlyOutcome}
                    className={`min-h-[44px] rounded-lg border px-3 py-2 text-sm ${
                      (monthlyOutcome ?? monthlyGoal.outcome) === n
                        ? "border-border-crimson bg-crimsonSubtle text-brand-crimsonDeep"
                        : "border-border-default bg-surface text-secondary"
                    } disabled:opacity-50`}
                    title={OUTCOME_LABELS[n]}
                  >
                    {n}: {OUTCOME_LABELS[n]}
                  </button>
                ))}
              </div>
              {!canEditMonthlyOutcome && (
                <p className="mt-2 text-xs text-secondary">
                  Outcome can only be edited within 7 days after the month ends.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="mt-3">
            <label className="block text-sm font-medium text-primary">
              Goal statement (optional)
            </label>
            <input
              type="text"
              value={monthlyStatement}
              onChange={(e) => setMonthlyStatement(e.target.value)}
              className="mt-2 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary focus:border-border-crimson focus:outline-none"
              placeholder="What do you want to achieve this month?"
            />
            <button
              type="button"
              onClick={() =>
                createGoal(
                  "monthly",
                  monthPeriod.periodStart,
                  monthPeriod.periodEnd,
                  monthlyStatement
                )
              }
              disabled={loading === "monthly"}
              className="mt-3 rounded bg-brand-crimson px-4 py-2 text-sm font-medium text-onCrimson hover:bg-brand-crimsonActive disabled:opacity-50"
            >
              {loading === "monthly" ? "Creating..." : "Create monthly goal"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
