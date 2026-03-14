/**
 * API request/response types. Aligned with docs/lld/api-contracts.md.
 */

export interface ApiError {
  error: string;
  code?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  publicDisplayName: string;
  primaryJourneyId: string | null;
  timezone: string;
}

export interface SignUpBody {
  email: string;
  password: string;
  publicDisplayName: string;
}

export interface SignInBody {
  email: string;
  password: string;
}

export interface AuthSuccessResponse {
  user: UserResponse;
}

// Journeys — api-contracts §4.2
export interface JourneySummary {
  id: string;
  name: string;
  emoji: string;
  visibility: string;
  startDate: string;
  endDate?: string | null;
  isPrimary?: boolean;
  todayState?: unknown;
  participantCount?: number;
}

export interface DimensionResponse {
  id: string;
  journeyId: string;
  position: number;
  name: string;
  description?: string | null;
  emoji: string;
  weight: number;
  isMandatory: number;
  whyMatters?: string | null;
  whatGoodLooksLike?: string | null;
  howHelpsJourney?: string | null;
  strengthGuidance?: string | null;
}

export interface JourneyVisibleLabelsResponse {
  labelMissed: string;
  labelLow: string;
  labelMedium: string;
  labelHigh: string;
  labelExcellent: string;
}

export interface JourneyResponse {
  id: string;
  creatorId: string;
  name: string;
  description?: string | null;
  emoji: string;
  visibility: string;
  startDate: string;
  endDate?: string | null;
  whyExists?: string | null;
  successVision?: string | null;
  whatMattersMost?: string | null;
  whatShouldNotDistract?: string | null;
  strengthsToPlayTo?: string | null;
}

export interface CreateJourneyBody {
  name: string;
  description?: string;
  emoji: string;
  visibility: "public" | "private";
  startDate: string;
  endDate?: string;
  whyExists?: string;
  successVision?: string;
  whatMattersMost?: string;
  whatShouldNotDistract?: string;
  strengthsToPlayTo?: string;
  dimensions: {
    name: string;
    description?: string;
    emoji: string;
    weight: number;
    isMandatory: boolean;
    whyMatters?: string;
    whatGoodLooksLike?: string;
    howHelpsJourney?: string;
    strengthGuidance?: string;
  }[];
  visibleLabels: {
    labelMissed: string;
    labelLow: string;
    labelMedium: string;
    labelHigh: string;
    labelExcellent: string;
  };
}

// Daily — api-contracts §4.3
export interface DailyEntryResponse {
  id: string;
  userId: string;
  journeyId: string;
  date: string;
  reflectionNote?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DimensionValueResponse {
  dimensionId: string;
  canonicalScale: number;
}

export interface PutDailyBody {
  date: string;
  dimensionValues: { dimensionId: string; canonicalScale: number }[];
  reflectionNote?: string;
}

// Leaderboard — api-contracts §4.7
export interface LeaderboardRanking {
  rank: number;
  userId: string;
  displayName: string;
  scorePercentage: number;
  rawScore?: number;
  trend?: "up" | "down" | "same";
}

export interface LeaderboardResponse {
  rankings: LeaderboardRanking[];
}

// Home — api-contracts §4.8
export interface PrimaryTodayState {
  date: string;
  entry: DailyEntryResponse | null;
  dimensionValues: DimensionValueResponse[];
}

export interface PendingWeeklyReview {
  journeyId: string;
  weekStart: string;
}

export interface HomeResponse {
  primaryJourney: JourneySummary | null;
  primaryTodayState: PrimaryTodayState | null;
  otherJourneys: JourneySummary[];
  pendingBackfillCount: number;
  pendingWeeklyReviews: PendingWeeklyReview[];
}

// Invite — api-contracts §4.2 (journeys invite)
export interface PostInviteBody {
  email: string;
}

export interface InviteResponse {
  token: string;
  inviteUrl: string;
}

// Goals — api-contracts §4.4
export interface GoalResponse {
  id: string;
  userId: string;
  journeyId: string;
  goalType: string;
  periodStart: string;
  periodEnd: string;
  goalStatement?: string | null;
  outcome?: number | null;
  outcomeUpdatedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostGoalBody {
  goalType: "weekly" | "monthly";
  periodStart: string;
  periodEnd: string;
  goalStatement?: string;
}

export interface PatchGoalBody {
  outcome: number; // 0–5
}

// Weekly reviews — api-contracts §4.5
export interface WeeklyReviewResponse {
  id: string;
  userId: string;
  journeyId: string;
  weekStart: string;
  done: boolean;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PutWeeklyReviewBody {
  weekStart: string;
  done: boolean;
  notes?: string;
}

// Lessons — api-contracts §4.6
export interface LessonResponse {
  id: string;
  userId: string;
  journeyId: string;
  text: string;
  sourceDate: string;
  sourceType: string;
  dimensionId?: string | null;
  createdAt: Date;
}

export interface PostLessonBody {
  text: string;
  sourceDate: string;
  sourceType: "daily_reflection" | "weekly_review";
  dimensionId?: string;
}
