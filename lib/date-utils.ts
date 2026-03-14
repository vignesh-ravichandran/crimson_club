/**
 * Date helpers. All dates ISO YYYY-MM-DD. 7-day edit window uses user timezone.
 */

/**
 * Today's date in the given IANA timezone (e.g. America/New_York) as YYYY-MM-DD.
 */
export function todayInTimezone(timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date()).replace(/-/g, "-");
}

/**
 * Parse YYYY-MM-DD to Date at start of day in the given timezone (for comparison).
 * Returns the date string if valid, or null.
 */
export function parseISODate(dateStr: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return null;
  const y = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const d = parseInt(match[3], 10);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return { y, m, d };
}

/**
 * Check if date (YYYY-MM-DD) is within the 7-day edit window relative to today in user TZ.
 * Allowed: today and up to 7 days in the past (inclusive). So allowed range: [today-7, today].
 */
export function isWithin7DayWindow(
  dateStr: string,
  timezone: string
): boolean {
  const today = todayInTimezone(timezone);
  const parsed = parseISODate(dateStr);
  const parsedToday = parseISODate(today);
  if (!parsed || !parsedToday) return false;
  const dateOrd =
    parsed.y * 10000 + parsed.m * 100 + parsed.d;
  const todayOrd =
    parsedToday.y * 10000 + parsedToday.m * 100 + parsedToday.d;
  const diff = todayOrd - dateOrd;
  return diff >= 0 && diff <= 7;
}

/**
 * Add n days to a YYYY-MM-DD date string. Does not use timezone; calendar math only.
 */
export function addDays(dateStr: string, n: number): string | null {
  const parsed = parseISODate(dateStr);
  if (!parsed) return null;
  const d = new Date(parsed.y, parsed.m - 1, parsed.d);
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Current week period (Monday–Sunday) in user timezone. Returns periodStart (Monday) and periodEnd (Sunday).
 */
export function getCurrentWeekPeriod(timezone: string): { periodStart: string; periodEnd: string } {
  const today = todayInTimezone(timezone);
  const periodStart = weekStartForDate(today, timezone);
  const periodEnd = addDays(periodStart, 6) ?? periodStart;
  return { periodStart, periodEnd };
}

/**
 * Current month period (first–last day) in user timezone.
 */
export function getCurrentMonthPeriod(timezone: string): { periodStart: string; periodEnd: string } {
  const today = todayInTimezone(timezone);
  const parsed = parseISODate(today);
  if (!parsed) return { periodStart: today, periodEnd: today };
  const periodStart = `${parsed.y}-${String(parsed.m).padStart(2, "0")}-01`;
  const lastDay = new Date(parsed.y, parsed.m, 0);
  const periodEnd = `${parsed.y}-${String(parsed.m).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;
  return { periodStart, periodEnd };
}

/**
 * Whether the user is still allowed to edit goal outcome (PATCH).
 * Editable for 7 days after periodEnd (in user TZ). So if periodEnd is 2025-03-09,
 * editing is allowed until end of 2025-03-16 (inclusive) in user TZ.
 */
export function isWithinOutcomeEditWindow(
  periodEnd: string,
  timezone: string
): boolean {
  const today = todayInTimezone(timezone);
  const lastEditDay = addDays(periodEnd, 7);
  if (!lastEditDay) return false;
  const parsedToday = parseISODate(today);
  const parsedLast = parseISODate(lastEditDay);
  if (!parsedToday || !parsedLast) return false;
  const todayOrd =
    parsedToday.y * 10000 + parsedToday.m * 100 + parsedToday.d;
  const lastOrd =
    parsedLast.y * 10000 + parsedLast.m * 100 + parsedLast.d;
  return todayOrd <= lastOrd;
}

/**
 * Canonical scale (0–5) to score factor. docs/db/data-model.md §1.
 */
const SCORE_FACTORS: Record<number, number> = {
  0: 0, 1: -0.5, 2: 0.25, 3: 0.5, 4: 0.75, 5: 1,
};
export function scoreFactorForCanonicalScale(scale: number): number {
  return SCORE_FACTORS[scale] ?? 0;
}

/**
 * Monday of the week containing date (YYYY-MM-DD) in the given timezone.
 * Uses noon UTC on that date to avoid DST edges, then formats in TZ to get weekday.
 */
export function weekStartForDate(dateStr: string, timezone: string): string {
  const parsed = parseISODate(dateStr);
  if (!parsed) return dateStr;
  const d = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d, 12, 0, 0));
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(d);
  const dayName = parts.find((p) => p.type === "weekday")?.value ?? "";
  const y = parseInt(parts.find((p) => p.type === "year")?.value ?? "0", 10);
  const m = parseInt(parts.find((p) => p.type === "month")?.value ?? "1", 10);
  const day = parseInt(parts.find((p) => p.type === "day")?.value ?? "1", 10);
  const weekdayOffset: Record<string, number> = {
    Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6,
  };
  const offset = weekdayOffset[dayName] ?? 0;
  const monday = new Date(Date.UTC(y, m - 1, day - offset));
  const yy = monday.getUTCFullYear();
  const mm = String(monday.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(monday.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/**
 * Period range [start, end] (inclusive) for leaderboard.
 * periodStart for weekly = Monday (YYYY-MM-DD); we return [periodStart, periodStart+6].
 * periodStart for monthly = first day of month; we return [periodStart, lastDayOfMonth].
 */
export function periodRange(
  period: "weekly" | "monthly",
  periodStart: string,
  _timezone: string
): { start: string; end: string } {
  const p = parseISODate(periodStart);
  if (!p) return { start: periodStart, end: periodStart };
  if (period === "weekly") {
    const start = periodStart;
    const startDate = new Date(Date.UTC(p.y, p.m - 1, p.d));
    startDate.setUTCDate(startDate.getUTCDate() + 6);
    const end = `${startDate.getUTCFullYear()}-${String(startDate.getUTCMonth() + 1).padStart(2, "0")}-${String(startDate.getUTCDate()).padStart(2, "0")}`;
    return { start, end };
  }
  const lastDay = new Date(Date.UTC(p.y, p.m, 0));
  const end = `${lastDay.getUTCFullYear()}-${String(lastDay.getUTCMonth() + 1).padStart(2, "0")}-${String(lastDay.getUTCDate()).padStart(2, "0")}`;
  return { start: periodStart, end };
}

/**
 * Compare two ISO date strings (YYYY-MM-DD). Returns -1 if a < b, 0 if equal, 1 if a > b.
 */
export function compareISODate(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}
