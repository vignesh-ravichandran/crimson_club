"use client";

/**
 * Calendar heatmap: grid of days (Mon–Sun columns, weeks as rows).
 * Values are score % (whole journey: daily total −100…100; per dimension: factor×100, −50…100).
 * Negative values (missed mandatory penalty) use a distinct fill.
 */
function getWeekday(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return (date.getDay() + 6) % 7;
}

function addDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + n);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function intensityToBg(value: number): string {
  if (value < 0) return "bg-semantic-danger/45";
  if (value === 0) return "bg-subtle";
  if (value <= 25) return "bg-brand-crimson/25";
  if (value <= 50) return "bg-brand-crimson/50";
  if (value <= 75) return "bg-brand-crimson/75";
  return "bg-brand-crimson";
}

export interface CalendarHeatmapProps {
  title: string;
  subtitle?: string;
  data: { date: string; scorePercentage: number }[];
  emptyMessage?: string;
}

export function CalendarHeatmap({ title, subtitle, data, emptyMessage }: CalendarHeatmapProps) {
  const dataByDate = Object.fromEntries(data.map((d) => [d.date, d.scorePercentage]));
  const dates = data.length > 0 ? [data[0].date, data[data.length - 1].date] : [];
  const startDate = dates[0] ?? "";
  const endDate = dates[1] ?? "";
  const numDays = data.length;
  const numWeeks = Math.ceil(numDays / 7) || 1;
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  const gridCols = 7;
  const gridRows = numWeeks;
  const grid: { date: string; value: number }[][] = Array.from({ length: gridRows }, () =>
    Array.from({ length: gridCols }, () => ({ date: "", value: 0 }))
  );
  for (let i = 0; i < numDays; i++) {
    const date = addDays(startDate, i);
    const col = getWeekday(date);
    const row = Math.floor(i / 7);
    if (row < gridRows && col < gridCols) {
      grid[row][col] = { date, value: dataByDate[date] ?? 0 };
    }
  }

  if (numDays === 0) {
    return (
      <section className="rounded-lg border border-border-default bg-surface p-4">
        <h2 className="text-sm font-medium text-primary">{title}</h2>
        {subtitle && <p className="text-xs text-secondary mt-0.5">{subtitle}</p>}
        <p className="mt-4 text-secondary text-sm">{emptyMessage ?? "No data for this period."}</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-border-default bg-surface p-4">
      <h2 className="text-sm font-medium text-primary">{title}</h2>
      {subtitle && <p className="text-xs text-secondary mt-0.5">{subtitle}</p>}
      <div className="mt-3 overflow-x-auto">
        <div className="inline-block min-w-0">
          <div
            className="grid gap-0.5 text-center text-[10px] text-tertiary"
            style={{
              gridTemplateColumns: `repeat(${gridCols}, 14px)`,
              gridTemplateRows: `auto repeat(${gridRows}, 14px)`,
            }}
          >
            {dayLabels.map((l, i) => (
              <span key={i} className="flex h-3.5 items-center justify-center">
                {l}
              </span>
            ))}
            {grid.flatMap((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  className={`h-3.5 w-3.5 rounded-sm ${intensityToBg(cell.value)}`}
                  title={cell.date ? `${cell.date}: ${cell.value.toFixed(0)}%` : undefined}
                />
              ))
            )}
          </div>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-end gap-2 text-[10px] text-tertiary">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-3 rounded-sm bg-semantic-danger/45" title="Penalty" /> Penalty
        </span>
        <span>·</span>
        <span>Less</span>
        <span className="flex gap-0.5">
          {[0, 25, 50, 75, 100].map((v) => (
            <span key={v} className={`h-2.5 w-3 rounded-sm ${intensityToBg(v)}`} />
          ))}
        </span>
        <span>More</span>
      </div>
    </section>
  );
}
