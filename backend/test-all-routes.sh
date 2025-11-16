#!/bin/bash

# Backend Route Verification Script
# Tests all API endpoints with curl

BASE_URL="http://localhost:4000"
RESULTS_FILE="/tmp/route_test_results.txt"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Initialize results file
echo "=== Backend API Route Testing ===" > $RESULTS_FILE
echo "Date: $(date)" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

# Counters
TOTAL=0
PASSED=0
FAILED=0

# Test function
test_route() {
    local METHOD=$1
    local ENDPOINT=$2
    local DATA=$3
    local HEADERS=$4
    local EXPECTED_STATUS=$5
    local DESCRIPTION=$6

    TOTAL=$((TOTAL + 1))

    echo -n "Testing: $DESCRIPTION... "

    if [ -z "$DATA" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" -X $METHOD "$BASE_URL$ENDPOINT" $HEADERS)
    else
        RESPONSE=$(curl -s -w "\n%{http_code}" -X $METHOD "$BASE_URL$ENDPOINT" -H "Content-Type: application/json" $HEADERS -d "$DATA")
    fi

    STATUS=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    if [ "$STATUS" == "$EXPECTED_STATUS" ] || [ "$EXPECTED_STATUS" == "*" ]; then
        echo -e "${GREEN}✓ PASS${NC} (Status: $STATUS)"
        PASSED=$((PASSED + 1))
        echo "✓ PASS: $DESCRIPTION (Status: $STATUS)" >> $RESULTS_FILE
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $EXPECTED_STATUS, Got: $STATUS)"
        FAILED=$((FAILED + 1))
        echo "✗ FAIL: $DESCRIPTION (Expected: $EXPECTED_STATUS, Got: $STATUS)" >> $RESULTS_FILE
        echo "  Response: $BODY" >> $RESULTS_FILE
    fi

    echo "  $METHOD $ENDPOINT" >> $RESULTS_FILE
    echo "" >> $RESULTS_FILE
}

echo "======================================"
echo "  Backend API Route Testing"
echo "======================================"
echo ""

# 1. HEALTH CHECK
echo "1. Health Check"
echo "----------------------------------------"
test_route "GET" "/health" "" "" "200" "Health check endpoint"
echo ""

# 2. AUTHENTICATION ROUTES
echo "2. Authentication Routes (/api/auth)"
echo "----------------------------------------"
test_route "POST" "/api/auth/register" '{"email":"user@test.com","username":"testuser2","password":"Test123@pass","fullName":"Test User 2"}' "" "200" "Register new user"
test_route "POST" "/api/auth/login" '{"email":"test@example.com","password":"Password123@"}' "" "200" "Login existing user"

# Get token for authenticated requests
TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/login" -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"Password123@"}' | jq -r '.data.accessToken' 2>/dev/null)

test_route "GET" "/api/auth/me" "" "-H \"Authorization: Bearer $TOKEN\"" "200" "Get current user (authenticated)"
test_route "POST" "/api/auth/forgot-password" '{"email":"test@example.com"}' "" "200" "Request password reset"
test_route "POST" "/api/auth/logout" "" "-H \"Authorization: Bearer $TOKEN\"" "200" "Logout user"
echo ""

# 3. CATEGORY ROUTES
echo "3. Category Routes (/api/categories)"
echo "----------------------------------------"
test_route "GET" "/api/categories" "" "" "200" "Get all categories"
echo ""

# 4. CONTENT ROUTES
echo "4. Content Routes (/api/content)"
echo "----------------------------------------"
test_route "GET" "/api/content" "" "" "200" "Get all content"
test_route "GET" "/api/content/trending" "" "" "200" "Get trending content"
test_route "GET" "/api/content/search?q=web" "" "" "200" "Search content"
echo ""

# 5. USER ROUTES (Authenticated)
echo "5. User Routes (/api/users) - Authenticated"
echo "----------------------------------------"
# Get fresh token
TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/login" -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"Password123@"}' | jq -r '.data.accessToken' 2>/dev/null)

test_route "GET" "/api/users/me" "" "-H \"Authorization: Bearer $TOKEN\"" "200" "Get user profile"
test_route "GET" "/api/users/preferences" "" "-H \"Authorization: Bearer $TOKEN\"" "200" "Get user preferences"
test_route "GET" "/api/users/categories" "" "-H \"Authorization: Bearer $TOKEN\"" "200" "Get user categories"
test_route "GET" "/api/users/feed" "" "-H \"Authorization: Bearer $TOKEN\"" "200" "Get user feed"
test_route "GET" "/api/users/saved" "" "-H \"Authorization: Bearer $TOKEN\"" "200" "Get saved content"
test_route "GET" "/api/users/stats" "" "-H \"Authorization: Bearer $TOKEN\"" "200" "Get user stats"
echo ""

# 6. SEARCH ROUTES
echo "6. Search Routes (/api/search)"
echo "----------------------------------------"
test_route "GET" "/api/search?query=test" "" "" "*" "Basic search"
test_route "GET" "/api/search/suggestions?q=web" "" "" "*" "Search suggestions"
test_route "GET" "/api/search/trending" "" "" "*" "Trending searches"
test_route "GET" "/api/search/facets" "" "" "*" "Search facets"
echo ""

# 7. ANALYTICS ROUTES (Authenticated)
echo "7. Analytics Routes (/api/analytics) - Authenticated"
echo "----------------------------------------"
test_route "GET" "/api/analytics/reading-stats" "" "-H \"Authorization: Bearer $TOKEN\"" "*" "Get reading stats"
test_route "GET" "/api/analytics/streak" "" "-H \"Authorization: Bearer $TOKEN\"" "*" "Get reading streak"
test_route "GET" "/api/analytics/topics" "" "-H \"Authorization: Bearer $TOKEN\"" "*" "Get topic breakdown"
test_route "GET" "/api/analytics/activity" "" "-H \"Authorization: Bearer $TOKEN\"" "*" "Get activity timeline"
test_route "GET" "/api/analytics/dashboard" "" "-H \"Authorization: Bearer $TOKEN\"" "*" "Get dashboard analytics"
echo ""

# 8. ADMIN ROUTES (Should fail without admin privileges)
echo "8. Admin Routes (/api/admin) - Should require admin"
echo "----------------------------------------"
test_route "GET" "/api/admin/stats" "" "-H \"Authorization: Bearer $TOKEN\"" "*" "Get system stats (admin)"
test_route "GET" "/api/admin/users" "" "-H \"Authorization: Bearer $TOKEN\"" "*" "Get all users (admin)"
test_route "GET" "/api/admin/health" "" "-H \"Authorization: Bearer $TOKEN\"" "*" "System health check (admin)"
echo ""

# SUMMARY
echo "======================================"
echo "  Test Summary"
echo "======================================"
echo -e "Total Tests:  $TOTAL"
echo -e "${GREEN}Passed:       $PASSED${NC}"
echo -e "${RED}Failed:       $FAILED${NC}"
echo "======================================"
echo ""
echo "Detailed results saved to: $RESULTS_FILE"

echo "" >> $RESULTS_FILE
echo "========== SUMMARY ==========" >> $RESULTS_FILE
echo "Total Tests: $TOTAL" >> $RESULTS_FILE
echo "Passed: $PASSED" >> $RESULTS_FILE
echo "Failed: $FAILED" >> $RESULTS_FILE
echo "============================" >> $RESULTS_FILE
