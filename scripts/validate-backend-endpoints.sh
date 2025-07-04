#!/bin/bash

# CanAI Backend Endpoint Validation Script
# Tests all live endpoints and outputs a summary table

BASE_URL="https://canai-router.onrender.com"
DUMMY_TOKEN="REPLACE_WITH_REAL_TOKEN"
DUMMY_UUID="00000000-0000-4000-8000-000000000000"
DUMMY_USER_ID="test-user-id"
DUMMY_SESSION_ID="cs_test_dummy_session_id"

# Helper to print section headers
echo_section() {
  echo -e "\n===================="
  echo "$1"
  echo "===================="
}

# Helper to print warning if dummy values are not replaced
warn_if_dummy() {
  if [[ "$DUMMY_TOKEN" == "REPLACE_WITH_REAL_TOKEN" ]]; then
    echo "[WARNING] Replace DUMMY_TOKEN with a real Bearer token for auth endpoints."
  fi
  if [[ "$DUMMY_UUID" == "00000000-0000-4000-8000-000000000000" ]]; then
    echo "[WARNING] Replace DUMMY_UUID with a real UUID for /analyze-emotion."
  fi
  if [[ "$DUMMY_USER_ID" == "test-user-id" ]]; then
    echo "[WARNING] Replace DUMMY_USER_ID with a real user_id for /stripe-session."
  fi
  if [[ "$DUMMY_SESSION_ID" == "cs_test_dummy_session_id" ]]; then
    echo "[WARNING] Replace DUMMY_SESSION_ID with a real Stripe session_id for /refund."
  fi
}

warn_if_dummy

# 1. Health Check
echo_section "GET /health"
HEALTH_RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/health")
HEALTH_BODY=$(echo "$HEALTH_RESP" | head -n -1)
HEALTH_CODE=$(echo "$HEALTH_RESP" | tail -n1)
echo "Status: $HEALTH_CODE"
echo "$HEALTH_BODY" | jq . 2>/dev/null || echo "$HEALTH_BODY"

# 2. Emotional Analysis Status
echo_section "GET /analyze-emotion/status"
EMO_STATUS_RESP=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $DUMMY_TOKEN" "$BASE_URL/analyze-emotion/status")
EMO_STATUS_BODY=$(echo "$EMO_STATUS_RESP" | head -n -1)
EMO_STATUS_CODE=$(echo "$EMO_STATUS_RESP" | tail -n1)
echo "Status: $EMO_STATUS_CODE"
echo "$EMO_STATUS_BODY" | jq . 2>/dev/null || echo "$EMO_STATUS_BODY"

# 3. Emotional Analysis (POST)
echo_section "POST /analyze-emotion"
EMO_ANALYZE_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/analyze-emotion" \
  -H "Authorization: Bearer $DUMMY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"I am excited about this project!","comparisonId":"'$DUMMY_UUID'"}')
EMO_ANALYZE_BODY=$(echo "$EMO_ANALYZE_RESP" | head -n -1)
EMO_ANALYZE_CODE=$(echo "$EMO_ANALYZE_RESP" | tail -n1)
echo "Status: $EMO_ANALYZE_CODE"
echo "$EMO_ANALYZE_BODY" | jq . 2>/dev/null || echo "$EMO_ANALYZE_BODY"

# 4. Stripe Session (POST)
echo_section "POST /stripe-session"
STRIPE_SESSION_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/stripe-session" \
  -H "Content-Type: application/json" \
  -d '{"productTrack":"business-plan-builder","user_id":"'$DUMMY_USER_ID'"}')
STRIPE_SESSION_BODY=$(echo "$STRIPE_SESSION_RESP" | head -n -1)
STRIPE_SESSION_CODE=$(echo "$STRIPE_SESSION_RESP" | tail -n1)
echo "Status: $STRIPE_SESSION_CODE"
echo "$STRIPE_SESSION_BODY" | jq . 2>/dev/null || echo "$STRIPE_SESSION_BODY"

# 5. Refund (POST)
echo_section "POST /refund"
REFUND_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/refund" \
  -H "Content-Type: application/json" \
  -d '{"session_id":"'$DUMMY_SESSION_ID'","reason":"requested_by_customer"}')
REFUND_BODY=$(echo "$REFUND_RESP" | head -n -1)
REFUND_CODE=$(echo "$REFUND_RESP" | tail -n1)
echo "Status: $REFUND_CODE"
echo "$REFUND_BODY" | jq . 2>/dev/null || echo "$REFUND_BODY"

# Summary Table
echo_section "Summary Table"
printf "%-30s %-10s\n" "Endpoint" "Status"
printf "%-30s %-10s\n" "--------" "------"
printf "%-30s %-10s\n" "/health" "$HEALTH_CODE"
printf "%-30s %-10s\n" "/analyze-emotion/status" "$EMO_STATUS_CODE"
printf "%-30s %-10s\n" "/analyze-emotion (POST)" "$EMO_ANALYZE_CODE"
printf "%-30s %-10s\n" "/stripe-session (POST)" "$STRIPE_SESSION_CODE"
printf "%-30s %-10s\n" "/refund (POST)" "$REFUND_CODE"

echo -e "\n[INFO] Replace dummy values with real tokens/IDs for full validation."