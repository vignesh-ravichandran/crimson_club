"use client";

/**
 * Insights charts: daily trend (line), radar, calendar heatmaps (whole journey + per dimension), leaderboard.
 * Uses Recharts; colours from colour-palette (brand.crimson, crimsonSubtle).
 */
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import { CalendarHeatmap } from "./CalendarHeatmap";

const CHART_CRIMSON = "#B4233C";
const CHART_CRIMSON_FILL = "rgba(184, 35, 60, 0.2)";
const DIMENSION_COLORS = [
  "#B4233C",
  "#8B1C2E",
  "#6B1522",
  "#9B3D4A",
  "#7A2430",
  "#5C1B24",
  "#4A1620",
  "#3D1219",
];
const GAP_FILL = "#E7E1DA";

interface DailyScore {
  date: string;
  scorePercentage: number;
}

interface DimensionScore {
  dimensionId: string;
  name: string;
  emoji: string;
  averageScale: number;
  scorePercentage: number;
}

interface StackedBarSegment {
  dimensionId: string;
  name: string;
  emoji: string;
  contribution: number;
}

interface StackedBarRow {
  date: string;
  shortDate: string;
  totalScore: number;
  segments: StackedBarSegment[];
}

interface InsightsData {
  dailyScores: DailyScore[];
  dimensionScores: DimensionScore[];
  heatmapDailyScores: DailyScore[];
  dailyDimensionScores: Record<string, DailyScore[]>;
  stackedBarData: StackedBarRow[];
}

interface LeaderboardRanking {
  rank: number;
  userId: string;
  displayName: string;
  scorePercentage: number;
}

interface InsightsChartsProps {
  journeyId: string;
  journeyName: string;
}

export function InsightsCharts({ journeyId, journeyName }: InsightsChartsProps) {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [rankings, setRankings] = useState<LeaderboardRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [insightsRes, leaderboardRes] = await Promise.all([
          fetch(`/api/journeys/${journeyId}/insights`, { credentials: "include" }),
          fetch(
            `/api/journeys/${journeyId}/leaderboard?period=weekly&periodStart=${getWeekStart()}`,
            { credentials: "include" }
          ),
        ]);
        if (cancelled) return;
        if (!insightsRes.ok) {
          setError("Failed to load insights");
          return;
        }
        const insightsData = await insightsRes.json();
        setInsights({
          dailyScores: insightsData.dailyScores ?? [],
          dimensionScores: insightsData.dimensionScores ?? [],
          heatmapDailyScores: insightsData.heatmapDailyScores ?? [],
          dailyDimensionScores: insightsData.dailyDimensionScores ?? {},
          stackedBarData: insightsData.stackedBarData ?? [],
        });
        if (leaderboardRes.ok) {
          const lb = await leaderboardRes.json();
          setRankings(lb.rankings ?? []);
        }
      } catch {
        if (!cancelled) setError("Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [journeyId]);

  if (loading) {
    return (
      <div className="text-secondary">Loading insights…</div>
    );
  }
  if (error) {
    return (
      <div className="rounded border border-semantic-danger bg-semantic-dangerBg p-3 text-sm text-semantic-danger">
        {error}
      </div>
    );
  }

  const dailyData = (insights?.dailyScores ?? []).map((d) => ({
    ...d,
    shortDate: d.date.slice(5),
  }));
  const radarData = (insights?.dimensionScores ?? []).map((d) => ({
    subject: `${d.emoji} ${d.name}`,
    score: d.scorePercentage,
    fullMark: 100,
  }));

  const stackedBarRows = (insights?.stackedBarData ?? []).map((row) => ({
    shortDate: row.shortDate,
    ...Object.fromEntries(row.segments.map((s) => [s.dimensionId, s.contribution])),
  }));
  const gapChartData = (insights?.dimensionScores ?? []).map((d) => ({
    name: `${d.emoji} ${d.name}`,
    achieved: d.scorePercentage,
    gap: Math.max(0, 100 - d.scorePercentage),
  }));

  return (
    <div className="space-y-6">
      {/* Daily score trend */}
      <section className="rounded-lg border border-border-default bg-surface p-4">
        <h2 className="text-sm font-medium text-primary">Daily score (last 14 days)</h2>
        <p className="text-xs text-secondary mt-0.5">Your score % per day.</p>
        {dailyData.length === 0 ? (
          <p className="mt-4 text-secondary text-sm">No daily entries yet. Log days to see your trend.</p>
        ) : (
          <div className="h-64 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E1DA" />
                <XAxis dataKey="shortDate" tick={{ fontSize: 11, fill: "#5F5A55" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#5F5A55" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #E7E1DA" }}
                  formatter={(value) => [typeof value === "number" ? `${value}%` : "—", "Score"]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="scorePercentage"
                  stroke={CHART_CRIMSON}
                  strokeWidth={2}
                  dot={{ fill: CHART_CRIMSON, r: 3 }}
                  name="Score %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Weighted contribution stacked bar (last 14 days) */}
      <section className="rounded-lg border border-border-default bg-surface p-4">
        <h2 className="text-sm font-medium text-primary">Weighted contribution (last 14 days)</h2>
        <p className="text-xs text-secondary mt-0.5">How each dimension contributes to your daily score (weight × performance).</p>
        {stackedBarRows.length === 0 || (insights?.dimensionScores ?? []).length === 0 ? (
          <p className="mt-4 text-secondary text-sm">No daily entries yet. Log days to see contribution by dimension.</p>
        ) : (
          <div className="h-64 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stackedBarRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E1DA" />
                <XAxis dataKey="shortDate" tick={{ fontSize: 11, fill: "#5F5A55" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#5F5A55" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #E7E1DA" }}
                  formatter={(value) => [typeof value === "number" ? `${Number(value).toFixed(1)}` : "—", ""]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                {(insights?.dimensionScores ?? []).map((dim, i) => (
                  <Bar
                    key={dim.dimensionId}
                    dataKey={dim.dimensionId}
                    stackId="contrib"
                    name={`${dim.emoji} ${dim.name}`}
                    fill={DIMENSION_COLORS[i % DIMENSION_COLORS.length]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Weighted gap chart */}
      <section className="rounded-lg border border-border-default bg-surface p-4">
        <h2 className="text-sm font-medium text-primary">Weighted gap</h2>
        <p className="text-xs text-secondary mt-0.5">Achieved vs gap to 100% per dimension (average over period).</p>
        {gapChartData.length === 0 ? (
          <p className="mt-4 text-secondary text-sm">No dimension data yet.</p>
        ) : (
          <div className="h-72 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={gapChartData}
                layout="vertical"
                margin={{ top: 8, right: 24, left: 80, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E1DA" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#5F5A55" }} unit="%" />
                <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 11, fill: "#171717" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #E7E1DA" }}
                  formatter={(value) => [typeof value === "number" ? `${Number(value).toFixed(1)}%` : "—", ""]}
                />
                <Legend />
                <Bar dataKey="achieved" name="Achieved" stackId="gap" fill={CHART_CRIMSON} />
                <Bar dataKey="gap" name="Gap to 100%" stackId="gap" fill={GAP_FILL} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Calendar heatmap — whole journey */}
      <CalendarHeatmap
        title="Calendar heatmap (whole journey)"
        subtitle="Last 12 weeks. Score % per day."
        data={insights?.heatmapDailyScores ?? []}
        emptyMessage="No daily entries in this period."
      />

      {/* Calendar heatmaps — per dimension */}
      {(insights?.dimensionScores ?? []).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-primary">Calendar heatmap by dimension</h2>
          <p className="text-xs text-secondary -mt-2">Score % per dimension per day (last 12 weeks).</p>
          {(insights?.dimensionScores ?? []).map((dim) => (
            <CalendarHeatmap
              key={dim.dimensionId}
              title={`${dim.emoji} ${dim.name}`}
              subtitle={`Dimension score 0–100%`}
              data={insights?.dailyDimensionScores?.[dim.dimensionId] ?? []}
              emptyMessage={`No ${dim.name} entries in this period.`}
            />
          ))}
        </div>
      )}

      {/* Dimension radar */}
      <section className="rounded-lg border border-border-default bg-surface p-4">
        <h2 className="text-sm font-medium text-primary">Dimension balance</h2>
        <p className="text-xs text-secondary mt-0.5">Average score per dimension (0–100).</p>
        {radarData.length === 0 ? (
          <p className="mt-4 text-secondary text-sm">No dimension data yet.</p>
        ) : (
          <div className="h-72 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#E7E1DA" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#171717" }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: "#5F5A55" }} />
                <Radar
                  name="Score %"
                  dataKey="score"
                  stroke={CHART_CRIMSON}
                  fill={CHART_CRIMSON_FILL}
                  strokeWidth={2}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Leaderboard section */}
      <section className="rounded-lg border border-border-default bg-surface p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-primary">Leaderboard (this week)</h2>
          <Link
            href={`/journeys/${journeyId}/leaderboard`}
            className="text-sm text-brand-crimson hover:underline"
          >
            View full →
          </Link>
        </div>
        {rankings.length === 0 ? (
          <p className="mt-2 text-secondary text-sm">No rankings yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {rankings.slice(0, 5).map((r) => (
              <li
                key={r.userId}
                className="flex items-center justify-between rounded border border-border-default bg-subtle px-3 py-2"
              >
                <span className="font-medium text-tertiary">#{r.rank}</span>
                <span className="flex-1 truncate px-2 text-primary">{r.displayName}</span>
                <span className="text-brand-crimson font-medium">{r.scorePercentage.toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().slice(0, 10);
}
