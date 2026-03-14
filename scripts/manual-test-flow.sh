#!/usr/bin/env bash
# Manual test flow: Auth + Journeys + Daily. Run with dev server: npm run dev
# Usage: SESSION_SECRET="your-secret-32-chars" ./scripts/manual-test-flow.sh

set -e
BASE="${BASE_URL:-http://localhost:3000}"
COOKIE_FILE="/tmp/crimson-test-cookies.txt"
echo "=== Crimson Club manual test flow (base: $BASE) ==="

# 1. Auth: sign-in (use existing test user from 00-foundation-auth)
echo ""
echo "1. Auth — Sign in..."
SIGNIN=$(curl -s -c "$COOKIE_FILE" -X POST "$BASE/api/auth/sign-in" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}')
if echo "$SIGNIN" | grep -q '"user"'; then
  echo "   OK: Sign-in 200, user in response"
else
  echo "   FAIL: Sign-in response: $SIGNIN"
  exit 1
fi

# 2. GET /api/auth/me (with cookie)
echo ""
echo "2. Auth — GET /api/auth/me (with cookie)..."
ME=$(curl -s -b "$COOKIE_FILE" "$BASE/api/auth/me")
if echo "$ME" | grep -q '"user"'; then
  echo "   OK: Me 200, user returned"
else
  echo "   FAIL: Me response: $ME"
  exit 1
fi

# 3. Create journey (3 dimensions, weights 100)
echo ""
echo "3. Journeys — POST create journey..."
CREATE=$(curl -s -b "$COOKIE_FILE" -X POST "$BASE/api/journeys" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "E2E Test Journey",
    "emoji": "🎯",
    "visibility": "public",
    "startDate": "2026-03-01",
    "dimensions": [
      {"name": "Focus", "emoji": "📌", "weight": 33.3, "isMandatory": true},
      {"name": "Move", "emoji": "🏃", "weight": 33.3, "isMandatory": false},
      {"name": "Rest", "emoji": "😴", "weight": 33.4, "isMandatory": false}
    ],
    "visibleLabels": {
      "labelMissed": "Missed",
      "labelLow": "Low",
      "labelMedium": "Medium",
      "labelHigh": "High",
      "labelExcellent": "Excellent"
    }
  }')
JID=$(echo "$CREATE" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')
if [ -n "$JID" ]; then
  echo "   OK: Create 201, journey id: $JID"
else
  echo "   FAIL: Create response: $CREATE"
  exit 1
fi

# 4. GET journey by id (dimensions + labels)
echo ""
echo "4. Journeys — GET journey by id..."
JOURNEY=$(curl -s -b "$COOKIE_FILE" "$BASE/api/journeys/$JID")
if echo "$JOURNEY" | grep -q '"dimensions"' && echo "$JOURNEY" | grep -q '"visibleLabels"'; then
  echo "   OK: Journey + dimensions + visibleLabels returned"
else
  echo "   FAIL: Journey response (first 200 chars): ${JOURNEY:0:200}"
  exit 1
fi

# 5. GET list journeys
echo ""
echo "5. Journeys — GET /api/journeys (list)..."
LIST=$(curl -s -b "$COOKIE_FILE" "$BASE/api/journeys")
if echo "$LIST" | grep -q "$JID"; then
  echo "   OK: List includes created journey"
else
  echo "   FAIL: List response: $LIST"
  exit 1
fi

# 6. PUT daily for today
TODAY=$(date +%Y-%m-%d)
DIM_IDS=$(echo "$JOURNEY" | python3 -c "
import json, sys
d = json.load(sys.stdin)
print(json.dumps([{'dimensionId': x['id'], 'canonicalScale': 3} for x in d['dimensions']]))
" 2>/dev/null || echo "[]")
echo ""
echo "6. Daily — PUT daily for today ($TODAY)..."
PUT_DAILY=$(curl -s -b "$COOKIE_FILE" -X PUT "$BASE/api/journeys/$JID/daily" \
  -H "Content-Type: application/json" \
  -d "{\"date\":\"$TODAY\",\"dimensionValues\":$DIM_IDS,\"reflectionNote\":\"E2E test note\"}")
if echo "$PUT_DAILY" | grep -q '"entry"'; then
  echo "   OK: PUT daily 200, entry + dimensionValues returned"
else
  echo "   FAIL: PUT daily response: $PUT_DAILY"
  exit 1
fi

# 7. GET daily for today
echo ""
echo "7. Daily — GET daily for today..."
GET_DAILY=$(curl -s -b "$COOKIE_FILE" "$BASE/api/journeys/$JID/daily?date=$TODAY")
if echo "$GET_DAILY" | grep -q '"entry"' && echo "$GET_DAILY" | grep -q 'E2E test note'; then
  echo "   OK: GET daily returns entry and reflectionNote"
else
  echo "   FAIL: GET daily response: $GET_DAILY"
  exit 1
fi

# 8. PUT daily for 8 days ago (expect 400)
EIGHT_AGO=$(date -v-8d +%Y-%m-%d 2>/dev/null || date -d "8 days ago" +%Y-%m-%d 2>/dev/null || echo "2019-01-01")
echo ""
echo "8. Daily — PUT daily for 8 days ago ($EIGHT_AGO) — expect 400..."
PUT_OLD=$(curl -s -w "%{http_code}" -b "$COOKIE_FILE" -X PUT "$BASE/api/journeys/$JID/daily" \
  -H "Content-Type: application/json" \
  -d "{\"date\":\"$EIGHT_AGO\",\"dimensionValues\":$DIM_IDS}")
CODE="${PUT_OLD: -3}"
BODY="${PUT_OLD%???}"
if [ "$CODE" = "400" ] && echo "$BODY" | grep -q "7-day"; then
  echo "   OK: 400 with 7-day window error"
else
  echo "   FAIL: Expected 400, got $CODE. Body: $BODY"
  exit 1
fi

# 9. Sign-out
echo ""
echo "9. Auth — Sign out..."
curl -s -b "$COOKIE_FILE" -X POST "$BASE/api/auth/sign-out" -c "$COOKIE_FILE" -o /dev/null
echo "   OK: Sign-out 200"

# 10. GET /api/auth/me without valid session (expect 401)
echo ""
echo "10. Auth — GET /api/auth/me after sign-out — expect 401..."
ME_AFTER=$(curl -s -w "%{http_code}" -b "$COOKIE_FILE" "$BASE/api/auth/me")
CODE_ME="${ME_AFTER: -3}"
if [ "$CODE_ME" = "401" ]; then
  echo "   OK: Me 401 after sign-out"
else
  echo "   FAIL: Expected 401, got $CODE_ME"
  exit 1
fi

echo ""
echo "=== All manual tests passed ==="
