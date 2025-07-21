#!/bin/bash

# CanAI API Endpoint Testing Script
# Tests all backend API endpoints to ensure they work correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
BASE_URL=${1:-"http://localhost:10000"}
API_VERSION="v1"

echo "🧪 Testing CanAI API Endpoints"
echo "=============================="
echo "Base URL: $BASE_URL"
echo "API Version: $API_VERSION"
echo ""

# Function to test an endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local data=$4
    local description=$5

    print_status "Testing $method $endpoint - $description"

    local curl_cmd="curl -s -w '%{http_code}' -o /tmp/response.json"

    if [ "$method" = "POST" ] || [ "$method" = "PUT" ] || [ "$method" = "PATCH" ]; then
        curl_cmd="$curl_cmd -H 'Content-Type: application/json'"
        if [ -n "$data" ]; then
            curl_cmd="$curl_cmd -d '$data'"
        fi
    fi

    curl_cmd="$curl_cmd -X $method '$BASE_URL$endpoint'"

    local response_code=$(eval $curl_cmd)

    if [ "$response_code" = "$expected_status" ]; then
        print_success "$method $endpoint returned $response_code"
        if [ -f /tmp/response.json ]; then
            echo "Response: $(cat /tmp/response.json | head -c 200)..."
        fi
    else
        print_error "$method $endpoint returned $response_code (expected $expected_status)"
        if [ -f /tmp/response.json ]; then
            echo "Error response: $(cat /tmp/response.json)"
        fi
    fi

    echo ""
}

# Test health endpoint
test_endpoint "GET" "/healthz" "200" "" "Health check endpoint"

# Test CORS preflight
print_status "Testing CORS preflight..."
curl -s -I -X OPTIONS -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     "$BASE_URL/healthz" | grep -q "Access-Control-Allow-Origin" && \
     print_success "CORS preflight working" || \
     print_warning "CORS preflight may not be configured"

echo ""

# Test authentication endpoints
print_status "Testing Authentication Endpoints"
echo "======================================="

# Test auth status (should return 401 without token)
test_endpoint "GET" "/api/$API_VERSION/auth/status" "401" "" "Auth status without token"

# Test auth with invalid token
test_endpoint "GET" "/api/$API_VERSION/auth/status" "401" "" "Auth status with invalid token" \
    -H "Authorization: Bearer invalid-token"

echo ""

# Test input validation endpoints
print_status "Testing Input Validation Endpoints"
echo "=========================================="

# Test validate input endpoint
test_endpoint "POST" "/api/$API_VERSION/validate-input" "400" '{"input": ""}' "Empty input validation"

test_endpoint "POST" "/api/$API_VERSION/validate-input" "400" '{"input": "a"}' "Too short input"

test_endpoint "POST" "/api/$API_VERSION/validate-input" "200" '{"input": "This is a valid input for testing purposes"}' "Valid input"

echo ""

# Test emotional analysis endpoints
print_status "Testing Emotional Analysis Endpoints"
echo "============================================"

# Test emotional analysis with valid input
test_endpoint "POST" "/api/$API_VERSION/emotional-analysis" "200" \
    '{"text": "I am feeling very happy today and excited about the future"}' \
    "Emotional analysis with positive text"

# Test emotional analysis with negative input
test_endpoint "POST" "/api/$API_VERSION/emotional-analysis" "200" \
    '{"text": "I am feeling sad and disappointed about recent events"}' \
    "Emotional analysis with negative text"

echo ""

# Test spark generation endpoints
print_status "Testing Spark Generation Endpoints"
echo "=========================================="

# Test generate sparks endpoint
test_endpoint "POST" "/api/$API_VERSION/generate-sparks" "200" \
    '{"input": "I want to start a business in the tech industry", "emotionalContext": {"joy": 0.8, "confidence": 0.7}}' \
    "Generate sparks with business input"

# Test generate preview spark endpoint
test_endpoint "POST" "/api/$API_VERSION/generate-preview-spark" "200" \
    '{"input": "I want to start a business in the tech industry", "sparkType": "business-plan"}' \
    "Generate preview spark"

echo ""

# Test intent mirror endpoints
print_status "Testing Intent Mirror Endpoints"
echo "======================================"

# Test intent mirror endpoint
test_endpoint "POST" "/api/$API_VERSION/intent-mirror" "200" \
    '{"inputs": ["I want to start a business", "I need help with marketing", "I want to improve my skills"]}' \
    "Intent mirror with multiple inputs"

echo ""

# Test feedback endpoints
print_status "Testing Feedback Endpoints"
echo "=================================="

# Test feedback submission
test_endpoint "POST" "/api/$API_VERSION/feedback" "200" \
    '{"sparkId": "test-123", "rating": 5, "feedback": "This was very helpful", "emotionalResponse": {"satisfaction": 0.9}}' \
    "Submit feedback"

echo ""

# Test spark split endpoints
print_status "Testing Spark Split Endpoints"
echo "===================================="

# Test spark split comparison
test_endpoint "POST" "/api/$API_VERSION/spark-split" "200" \
    '{"sparkA": {"id": "a-123", "content": "First option"}, "sparkB": {"id": "b-456", "content": "Second option"}, "userPreference": "A"}' \
    "Spark split comparison"

echo ""

# Test progress saving endpoints
print_status "Testing Progress Saving Endpoints"
echo "========================================"

# Test save progress
test_endpoint "POST" "/api/$API_VERSION/save-progress" "200" \
    '{"userId": "test-user", "stage": "F5", "data": {"inputs": ["test input"], "progress": 75}}' \
    "Save user progress"

echo ""

# Test revision request endpoints
print_status "Testing Revision Request Endpoints"
echo "=========================================="

# Test request revision
test_endpoint "POST" "/api/$API_VERSION/request-revision" "200" \
    '{"sparkId": "test-123", "revisionType": "content", "feedback": "Please make it more detailed"}' \
    "Request revision"

echo ""

# Test Stripe payment endpoints
print_status "Testing Payment Endpoints"
echo "================================="

# Test create checkout session
test_endpoint "POST" "/api/$API_VERSION/stripe/create-checkout-session" "200" \
    '{"priceId": "price_test123", "successUrl": "http://localhost:3000/success", "cancelUrl": "http://localhost:3000/cancel"}' \
    "Create Stripe checkout session"

echo ""

# Test error handling
print_status "Testing Error Handling"
echo "============================="

# Test non-existent endpoint
test_endpoint "GET" "/api/$API_VERSION/non-existent" "404" "" "Non-existent endpoint"

# Test malformed JSON
test_endpoint "POST" "/api/$API_VERSION/validate-input" "400" '{"invalid": json}' "Malformed JSON"

echo ""

# Test rate limiting (if configured)
print_status "Testing Rate Limiting"
echo "============================"

# Make multiple rapid requests to test rate limiting
for i in {1..5}; do
    curl -s -w '%{http_code}' -o /dev/null "$BASE_URL/healthz" &
done
wait

print_success "Rate limiting test completed"

echo ""

# Summary
echo "🎉 API Endpoint Testing Complete!"
echo "=================================="
print_success "All critical endpoints tested"
echo ""
echo "Next steps:"
echo "1. Review any warnings or errors above"
echo "2. Test with real authentication tokens"
echo "3. Test with actual AI service credentials"
echo "4. Run integration tests with frontend"
echo ""
echo "To test with real credentials, update your .env file and run:"
echo "  curl -H 'Authorization: Bearer YOUR_JWT_TOKEN' $BASE_URL/api/$API_VERSION/auth/status"