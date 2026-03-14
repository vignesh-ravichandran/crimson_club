#!/usr/bin/env bash
# Manual test for Goals, Weekly reviews, Lessons APIs. Run with dev server on PORT (default 3002).
set -e
PORT="${PORT:-3002}"
BASE="http://localhost:$PORT"
JAR="/tmp/cc-test-cookies.txt"
rm -f "$JAR"

echo "1. Sign in..."
curl -s -c "$JAR" -X POST "$BASE/api/auth/sign-in" \
  -H "Content-Type: application/json" \
  -d '{"email":"goals-test@example.com","password":"password1234"}' | head -c 200
echo ""

echo "2. Create journey..."
JOURNEY_JSON='{"name":"Test Journey","emoji":"🎯","visibility":"public","startDate":"2025-03-01","dimensions":[{"name":"Focus","emoji":"🎯","weight":50,"isMandatory":true},{"name":"Health","emoji":"❤️","weight":50,"isMandatory":false}],"visibleLabels":{"labelMissed":"Missed","labelLow":"Low","labelMedium":"Medium","labelHigh":"High","labelExcellent":"Excellent"}}'
CREATED=$(curl -s -b "$JAR" -c "$JAR" -X POST "$BASE/api/journeys" -H "Content-Type: application/json" -d "$JOURNEY_JSON")
echo "$CREATED"
JID=$(echo "$CREATED" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')
echo "Journey ID: $JID"

# Current week: Monday 2025-03-10, Sunday 2025-03-16
echo "3. POST goal (current week)..."
curl -s -b "$JAR" -c "$JAR" -X POST "$BASE/api/journeys/$JID/goals" \
  -H "Content-Type: application/json" \
  -d '{"goalType":"weekly","periodStart":"2025-03-10","periodEnd":"2025-03-16","goalStatement":"Ship the feature"}' | head -c 200
echo ""

echo "4. GET goal..."
curl -s -b "$JAR" "$BASE/api/journeys/$JID/goals?goalType=weekly&periodStart=2025-03-10" | head -c 400
echo ""

echo "5. Get goal id for PATCH..."
GOAL_RESP=$(curl -s -b "$JAR" "$BASE/api/journeys/$JID/goals?goalType=weekly&periodStart=2025-03-10")
GID=$(echo "$GOAL_RESP" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')
echo "Goal ID: $GID"

echo "6. PATCH goal outcome to 4..."
curl -s -b "$JAR" -X PATCH "$BASE/api/journeys/$JID/goals/$GID" \
  -H "Content-Type: application/json" \
  -d '{"outcome":4}' | head -c 400
echo ""

echo "7. PUT weekly review..."
curl -s -b "$JAR" -X PUT "$BASE/api/journeys/$JID/weekly-reviews" \
  -H "Content-Type: application/json" \
  -d '{"weekStart":"2025-03-10","done":true,"notes":"Good week"}' | head -c 400
echo ""

echo "8. GET weekly review by weekStart..."
curl -s -b "$JAR" "$BASE/api/journeys/$JID/weekly-reviews?weekStart=2025-03-10" | head -c 400
echo ""

echo "9. GET weekly-reviews list..."
curl -s -b "$JAR" "$BASE/api/journeys/$JID/weekly-reviews/list?limit=5" | head -c 400
echo ""

echo "10. POST lesson..."
curl -s -b "$JAR" -X POST "$BASE/api/journeys/$JID/lessons" \
  -H "Content-Type: application/json" \
  -d '{"text":"Always ship on Monday","sourceDate":"2025-03-10","sourceType":"weekly_review"}' | head -c 200
echo ""

echo "11. GET lessons..."
curl -s -b "$JAR" "$BASE/api/journeys/$JID/lessons" | head -c 500
echo ""

echo "12. GET lessons with sourceType filter..."
curl -s -b "$JAR" "$BASE/api/journeys/$JID/lessons?sourceType=weekly_review" | head -c 500
echo ""

echo "13. Create old goal (period ended >7 days ago) and PATCH outcome -> expect 400..."
# Period 2025-02-03 to 2025-02-09 (week of Feb 3); >7 days ago
curl -s -b "$JAR" -c "$JAR" -X POST "$BASE/api/journeys/$JID/goals" \
  -H "Content-Type: application/json" \
  -d '{"goalType":"weekly","periodStart":"2025-02-03","periodEnd":"2025-02-09"}' > /tmp/old-goal.json
OLD_GID=$(sed -n 's/.*"id":"\([^"]*\)".*/\1/p' /tmp/old-goal.json)
echo "Old goal ID: $OLD_GID"
PATCH_OLD=$(curl -s -b "$JAR" -X PATCH "$BASE/api/journeys/$JID/goals/$OLD_GID" \
  -H "Content-Type: application/json" \
  -d '{"outcome":3}')
echo "PATCH old goal response (expect 400): $PATCH_OLD"
if echo "$PATCH_OLD" | grep -q '"error"'; then
  echo "OK: PATCH after 7-day window correctly rejected"
else
  echo "FAIL: Expected 400 for PATCH after 7-day window"
  exit 1
fi

echo "Done."
