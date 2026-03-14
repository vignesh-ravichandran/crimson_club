#!/usr/bin/env bash
# Phase 9 E2E: full API flow (sign up → create journey → set primary → log today → weekly review → lesson → leaderboard).
# Run with dev server up: npm run dev (note port, e.g. 3006). Usage: BASE_URL=http://localhost:3006 ./scripts/e2e-api-flow.sh

set -e
BASE_URL="${BASE_URL:-http://localhost:3006}"
COOKIES=$(mktemp)
trap "rm -f $COOKIES" EXIT

echo "E2E API flow (BASE_URL=$BASE_URL)"
echo "---"

# 1. Sign up (get session cookie)
EMAIL="e2e-$(date +%s)@example.com"
echo "1. Sign up ($EMAIL)"
SIGNUP=$(curl -s -c "$COOKIES" -b "$COOKIES" -X POST "$BASE_URL/api/auth/sign-up" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"password123\",\"publicDisplayName\":\"E2E User\"}")
if echo "$SIGNUP" | grep -q '"user"'; then
  echo "   OK: user created"
else
  echo "   FAIL: $SIGNUP"
  exit 1
fi

# 2. Create journey (wizard body: 3 dims 34+33+33)
echo "2. Create journey"
JOURNEY_BODY='{"name":"E2E Journey","emoji":"🧪","visibility":"public","startDate":"2025-03-14","dimensions":[{"name":"A","emoji":"•","weight":34,"isMandatory":false},{"name":"B","emoji":"•","weight":33,"isMandatory":false},{"name":"C","emoji":"•","weight":33,"isMandatory":false}],"visibleLabels":{"labelMissed":"Missed","labelLow":"Low","labelMedium":"Medium","labelHigh":"High","labelExcellent":"Excellent"}}'
JOURNEY_RES=$(curl -s -b "$COOKIES" -X POST "$BASE_URL/api/journeys" \
  -H "Content-Type: application/json" \
  -d "$JOURNEY_BODY")
JOURNEY_ID=$(echo "$JOURNEY_RES" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$JOURNEY_ID" ]; then
  echo "   FAIL: $JOURNEY_RES"
  exit 1
fi
echo "   OK: journey $JOURNEY_ID"

# 3. Set primary journey
echo "3. Set primary journey"
PATCH_PRIMARY=$(curl -s -w "\n%{http_code}" -b "$COOKIES" -X PATCH "$BASE_URL/api/users/me/primary-journey" \
  -H "Content-Type: application/json" \
  -d "{\"journeyId\":\"$JOURNEY_ID\"}")
HTTP_CODE=$(echo "$PATCH_PRIMARY" | tail -1)
if [ "$HTTP_CODE" = "200" ]; then
  echo "   OK"
else
  echo "   FAIL (HTTP $HTTP_CODE): $(echo "$PATCH_PRIMARY" | sed '$d')"
  exit 1
fi

# 4. Log today (PUT daily) — use server's "today" (user TZ) and dimension IDs from GET journey
echo "4. Log today"
HOME_JSON=$(curl -s -b "$COOKIES" "$BASE_URL/api/home")
TODAY=$(node -e "try{var h=JSON.parse(process.argv[1]); console.log((h.primaryTodayState&&h.primaryTodayState.date)||'2025-03-14');}catch(e){console.log('2025-03-14');}" "$HOME_JSON" 2>/dev/null) || TODAY=$(date +%Y-%m-%d)
JOURNEY_DETAIL=$(curl -s -b "$COOKIES" "$BASE_URL/api/journeys/$JOURNEY_ID")
DIM_IDS_JSON=$(node -e "
try {
  var d=JSON.parse(process.argv[1]);
  var dims=d.dimensions||[];
  var out=dims.map(function(x){ return {dimensionId:x.id,canonicalScale:4}; });
  console.log(JSON.stringify(out));
} catch(e) { process.exit(1); }
" "$JOURNEY_DETAIL" 2>/dev/null) || true
if [ -n "$DIM_IDS_JSON" ] && [ "$DIM_IDS_JSON" != "[]" ]; then
  PUT_DAILY=$(curl -s -w "\n%{http_code}" -b "$COOKIES" -X PUT "$BASE_URL/api/journeys/$JOURNEY_ID/daily" \
    -H "Content-Type: application/json" \
    -d "{\"date\":\"$TODAY\",\"dimensionValues\":$DIM_IDS_JSON}")
  CODE=$(echo "$PUT_DAILY" | tail -1)
  BODY=$(echo "$PUT_DAILY" | sed '$d')
  if [ "$CODE" = "200" ]; then
    echo "   OK"
  else
    echo "   FAIL (HTTP $CODE): $BODY"
    exit 1
  fi
else
  echo "   SKIP (could not parse dimensions)"
fi

# 5. Weekly review (PUT weekly-reviews)
echo "5. Weekly review"
# weekStart = Monday of current week (ISO week: Mon-Sun)
if date -v-mon +%Y-%m-%d 2>/dev/null | grep -q '^[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}$'; then
  WEEK_START=$(date -v-mon +%Y-%m-%d)
elif date -d "monday this week" +%Y-%m-%d 2>/dev/null | grep -q '^[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}$'; then
  WEEK_START=$(date -d "monday this week" +%Y-%m-%d)
else
  WEEK_START="2025-03-10"
fi
PUT_REVIEW=$(curl -s -w "\n%{http_code}" -b "$COOKIES" -X PUT "$BASE_URL/api/journeys/$JOURNEY_ID/weekly-reviews" \
  -H "Content-Type: application/json" \
  -d "{\"weekStart\":\"$WEEK_START\",\"done\":true,\"notes\":\"E2E review\"}")
CODE=$(echo "$PUT_REVIEW" | tail -1)
if [ "$CODE" = "200" ]; then
  echo "   OK"
else
  echo "   FAIL (HTTP $CODE): $(echo "$PUT_REVIEW" | sed '$d')"
  exit 1
fi

# 6. Add lesson
echo "6. Add lesson"
POST_LESSON=$(curl -s -w "\n%{http_code}" -b "$COOKIES" -X POST "$BASE_URL/api/journeys/$JOURNEY_ID/lessons" \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"E2E lesson learned\",\"sourceDate\":\"$TODAY\",\"sourceType\":\"weekly_review\"}")
CODE=$(echo "$POST_LESSON" | tail -1)
if [ "$CODE" = "201" ]; then
  echo "   OK"
else
  echo "   FAIL (HTTP $CODE): $(echo "$POST_LESSON" | sed '$d')"
  exit 1
fi

# 7. Leaderboard
echo "7. Leaderboard"
LEADERBOARD=$(curl -s -b "$COOKIES" "$BASE_URL/api/journeys/$JOURNEY_ID/leaderboard?period=weekly&periodStart=$WEEK_START")
if echo "$LEADERBOARD" | grep -q '"rankings"'; then
  echo "   OK: $(echo "$LEADERBOARD" | grep -o '"rankings":\[.*\]' | head -c 80)..."
else
  echo "   FAIL or empty: $LEADERBOARD"
fi

echo "---"
echo "E2E API flow completed. Journey: $BASE_URL/journeys/$JOURNEY_ID"
