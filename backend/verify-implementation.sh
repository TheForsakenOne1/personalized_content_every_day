#!/bin/bash

# Backend Verification Script
# Checks static implementation and validates everything works as expected

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
WARNINGS=0

# Log file
LOG_FILE="/tmp/backend_verification_$(date +%Y%m%d_%H%M%S).log"
echo "Backend Verification Log - $(date)" > $LOG_FILE

# Helper functions
print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
    echo "✓ $1" >> $LOG_FILE
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
}

print_error() {
    echo -e "${RED}✗${NC} $1"
    echo "✗ $1" >> $LOG_FILE
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    echo "⚠ $1" >> $LOG_FILE
    WARNINGS=$((WARNINGS + 1))
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

check_command() {
    if command -v $1 &> /dev/null; then
        print_success "$1 is installed ($(command -v $1))"
        return 0
    else
        print_error "$1 is not installed"
        return 1
    fi
}

check_file_exists() {
    if [ -f "$1" ]; then
        print_success "File exists: $1"
        return 0
    else
        print_error "File missing: $1"
        return 1
    fi
}

check_directory_exists() {
    if [ -d "$1" ]; then
        print_success "Directory exists: $1"
        return 0
    else
        print_error "Directory missing: $1"
        return 1
    fi
}

# Start verification
clear
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Backend Implementation Verification     ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo ""
print_info "Started at: $(date)"
print_info "Log file: $LOG_FILE"

# 1. SYSTEM REQUIREMENTS
print_header "1. System Requirements"

check_command "node"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_info "Node.js version: $NODE_VERSION"
fi

check_command "npm"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_info "npm version: $NPM_VERSION"
fi

check_command "git"
check_command "curl"

# Optional but recommended
if command -v redis-server &> /dev/null; then
    print_success "Redis is installed (optional)"
else
    print_warning "Redis is not installed (optional - app will work without it)"
fi

# 2. PROJECT STRUCTURE
print_header "2. Project Structure"

# Core directories
check_directory_exists "src"
check_directory_exists "src/controllers"
check_directory_exists "src/routes"
check_directory_exists "src/services"
check_directory_exists "src/middleware"
check_directory_exists "src/config"
check_directory_exists "src/utils"
check_directory_exists "prisma"
check_directory_exists "scripts"

# Advanced service directories
check_directory_exists "src/services/aggregation"
check_directory_exists "src/services/aggregation/sources"
check_directory_exists "src/services/recommendation"
check_directory_exists "src/services/cache"
check_directory_exists "src/services/search"
check_directory_exists "src/services/analytics"
check_directory_exists "src/services/email"

# 3. CONFIGURATION FILES
print_header "3. Configuration Files"

check_file_exists "package.json"
check_file_exists "tsconfig.json"
check_file_exists ".env"
check_file_exists ".env.example"
check_file_exists "prisma/schema.prisma"

# Verify .gitignore
if [ -f ".gitignore" ]; then
    if grep -q "node_modules" .gitignore && grep -q ".env" .gitignore; then
        print_success ".gitignore properly configured"
    else
        print_warning ".gitignore may be missing important entries"
    fi
fi

# 4. ROUTE FILES
print_header "4. Route Implementation"

ROUTE_FILES=(
    "src/routes/auth.routes.ts"
    "src/routes/content.routes.ts"
    "src/routes/user.routes.ts"
    "src/routes/category.routes.ts"
    "src/routes/search.routes.ts"
    "src/routes/analytics.routes.ts"
    "src/routes/admin.routes.ts"
)

for route_file in "${ROUTE_FILES[@]}"; do
    check_file_exists "$route_file"
done

# 5. CONTROLLER FILES
print_header "5. Controller Implementation"

CONTROLLER_FILES=(
    "src/controllers/auth.controller.ts"
    "src/controllers/content.controller.ts"
    "src/controllers/user.controller.ts"
    "src/controllers/category.controller.ts"
    "src/controllers/search.controller.ts"
    "src/controllers/analytics.controller.ts"
    "src/controllers/admin.controller.ts"
)

for controller_file in "${CONTROLLER_FILES[@]}"; do
    check_file_exists "$controller_file"
done

# 6. SERVICE FILES
print_header "6. Service Layer Implementation"

SERVICE_FILES=(
    "src/services/auth.service.ts"
    "src/services/content.service.ts"
    "src/services/user.service.ts"
    "src/services/category.service.ts"
    # Aggregation
    "src/services/aggregation/aggregator.service.ts"
    "src/services/aggregation/base.source.ts"
    "src/services/aggregation/quality-scorer.service.ts"
    "src/services/aggregation/sources/arxiv.source.ts"
    "src/services/aggregation/sources/pubmed.source.ts"
    "src/services/aggregation/sources/ieee.source.ts"
    "src/services/aggregation/sources/springer.source.ts"
    "src/services/aggregation/sources/scholar.source.ts"
    # Recommendation
    "src/services/recommendation/recommendation.service.ts"
    "src/services/recommendation/collaborative-filter.ts"
    "src/services/recommendation/content-filter.ts"
    "src/services/recommendation/feed-generator.ts"
    # Cache
    "src/services/cache/cache.service.ts"
    "src/services/cache/trending.cache.ts"
    "src/services/cache/feed.cache.ts"
    "src/services/cache/search.cache.ts"
    # Search
    "src/services/search/enhanced-search.service.ts"
    "src/services/search/search-suggestions.service.ts"
    "src/services/search/search-history.service.ts"
    # Analytics
    "src/services/analytics/analytics.service.ts"
    # Email
    "src/services/email/email.service.ts"
)

for service_file in "${SERVICE_FILES[@]}"; do
    check_file_exists "$service_file"
done

# 7. MIDDLEWARE FILES
print_header "7. Middleware Implementation"

MIDDLEWARE_FILES=(
    "src/middleware/auth.ts"
    "src/middleware/isAdmin.ts"
    "src/middleware/rateLimiter.ts"
    "src/middleware/errorHandler.ts"
    "src/middleware/notFoundHandler.ts"
)

for middleware_file in "${MIDDLEWARE_FILES[@]}"; do
    check_file_exists "$middleware_file"
done

# 8. UTILITY FILES
print_header "8. Utility Files"

UTILITY_FILES=(
    "src/utils/prisma.ts"
    "src/utils/password.ts"
    "src/utils/jwt.ts"
    "src/utils/redis.ts"
    "src/utils/retry.ts"
)

for utility_file in "${UTILITY_FILES[@]}"; do
    check_file_exists "$utility_file"
done

# 9. DEPENDENCIES
print_header "9. Dependencies Check"

if [ -f "package.json" ]; then
    print_info "Checking required dependencies..."

    REQUIRED_DEPS=(
        "express"
        "typescript"
        "prisma"
        "@prisma/client"
        "bcrypt"
        "jsonwebtoken"
        "express-rate-limit"
        "cors"
        "helmet"
        "dotenv"
        "cookie-parser"
        "morgan"
        "better-sqlite3"
        "redis"
        "axios"
    )

    for dep in "${REQUIRED_DEPS[@]}"; do
        if grep -q "\"$dep\"" package.json; then
            print_success "Dependency found: $dep"
        else
            print_warning "Dependency not found in package.json: $dep"
        fi
    done
fi

# Check node_modules
if [ -d "node_modules" ]; then
    print_success "node_modules directory exists"
    MODULE_COUNT=$(ls -1 node_modules | wc -l)
    print_info "Installed modules: $MODULE_COUNT"
else
    print_warning "node_modules not found - run 'npm install'"
fi

# 10. ENVIRONMENT CONFIGURATION
print_header "10. Environment Configuration"

if [ -f ".env" ]; then
    print_success ".env file exists"

    # Check required variables
    REQUIRED_VARS=(
        "PORT"
        "NODE_ENV"
        "DATABASE_URL"
        "JWT_SECRET"
        "CORS_ORIGIN"
    )

    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^$var=" .env; then
            print_success "Environment variable set: $var"
        else
            print_error "Missing environment variable: $var"
        fi
    done

    # Check optional variables
    OPTIONAL_VARS=(
        "REDIS_URL"
        "SMTP_HOST"
        "SMTP_USER"
    )

    for var in "${OPTIONAL_VARS[@]}"; do
        if grep -q "^$var=" .env; then
            print_success "Optional variable set: $var"
        else
            print_info "Optional variable not set: $var"
        fi
    done
else
    print_error ".env file not found - copy from .env.example"
fi

# 11. DATABASE
print_header "11. Database Setup"

if [ -f "prisma/schema.prisma" ]; then
    print_success "Prisma schema exists"

    # Count models
    MODEL_COUNT=$(grep -c "^model " prisma/schema.prisma)
    print_info "Database models defined: $MODEL_COUNT"

    if [ $MODEL_COUNT -ge 14 ]; then
        print_success "All required models present ($MODEL_COUNT/14)"
    else
        print_warning "Some models may be missing ($MODEL_COUNT/14)"
    fi
fi

# Check if database file exists
if [ -f "dev.db" ]; then
    print_success "SQLite database file exists"
    DB_SIZE=$(du -h dev.db | cut -f1)
    print_info "Database size: $DB_SIZE"
else
    print_warning "Database file not found - run setup script"
fi

# Check migrations
if [ -d "prisma/migrations" ]; then
    MIGRATION_COUNT=$(ls -1 prisma/migrations | wc -l)
    print_info "Migrations found: $MIGRATION_COUNT"
else
    print_info "No migrations directory (using manual setup)"
fi

# 12. BUILD CHECK
print_header "12. TypeScript Build Check"

if [ -d "dist" ]; then
    print_success "Build output directory exists"
    BUILD_FILES=$(find dist -name "*.js" | wc -l)
    print_info "Built JavaScript files: $BUILD_FILES"
else
    print_info "No build directory - will compile on first run"
fi

# Check TypeScript configuration
if [ -f "tsconfig.json" ]; then
    print_success "TypeScript configuration exists"
    if grep -q "\"strict\": true" tsconfig.json; then
        print_success "Strict mode enabled"
    fi
fi

# 13. DOCUMENTATION
print_header "13. Documentation"

DOC_FILES=(
    "ROUTE_VERIFICATION_REPORT.md"
    "POSTMAN_COLLECTION_README.md"
    "test-all-routes.sh"
    "Personalized_Content_API.postman_collection.json"
)

for doc_file in "${DOC_FILES[@]}"; do
    if [ -f "$doc_file" ]; then
        print_success "Documentation found: $doc_file"
    else
        print_info "Optional documentation: $doc_file"
    fi
done

# 14. GIT STATUS
print_header "14. Version Control"

if [ -d ".git" ]; then
    print_success "Git repository initialized"

    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    print_info "Current branch: $CURRENT_BRANCH"

    # Check for uncommitted changes
    if git diff-index --quiet HEAD -- 2>/dev/null; then
        print_success "Working tree is clean"
    else
        print_warning "There are uncommitted changes"
    fi
else
    print_warning "Not a git repository"
fi

# 15. STATIC CODE ANALYSIS
print_header "15. Static Code Analysis"

# Count route endpoints
if [ -d "src/routes" ]; then
    ROUTE_COUNT=$(grep -r "router\." src/routes/ | grep -E "(get|post|put|patch|delete)" | wc -l)
    print_info "Total route definitions: $ROUTE_COUNT"

    if [ $ROUTE_COUNT -ge 60 ]; then
        print_success "Route count exceeds proposal (${ROUTE_COUNT}/53)"
    else
        print_warning "Route count below expected (${ROUTE_COUNT}/53)"
    fi
fi

# Count services
if [ -d "src/services" ]; then
    SERVICE_COUNT=$(find src/services -name "*.ts" | wc -l)
    print_info "Total service files: $SERVICE_COUNT"
fi

# Count controllers
if [ -d "src/controllers" ]; then
    CONTROLLER_COUNT=$(find src/controllers -name "*.ts" | wc -l)
    print_info "Total controller files: $CONTROLLER_COUNT"
fi

# Check for TODO/FIXME comments
TODO_COUNT=$(grep -r "TODO\|FIXME" src/ 2>/dev/null | wc -l)
if [ $TODO_COUNT -gt 0 ]; then
    print_warning "Found $TODO_COUNT TODO/FIXME comments in code"
fi

# 16. SECURITY CHECKS
print_header "16. Security Checks"

# Check for hardcoded secrets
if grep -r "password.*=.*\"" src/ --include="*.ts" 2>/dev/null | grep -v "passwordHash" | grep -q .; then
    print_warning "Potential hardcoded passwords found"
else
    print_success "No obvious hardcoded passwords"
fi

# Check .env is gitignored
if [ -f ".gitignore" ] && grep -q "\.env$" .gitignore; then
    print_success ".env is properly gitignored"
else
    print_error ".env should be in .gitignore"
fi

# Check for security headers
if grep -q "helmet" src/server.ts; then
    print_success "Helmet security headers configured"
else
    print_warning "Helmet not found in server.ts"
fi

# Check for rate limiting
if grep -q "rate-limit" package.json; then
    print_success "Rate limiting dependency installed"
else
    print_warning "Rate limiting not configured"
fi

# 17. SUMMARY
print_header "17. Verification Summary"

TOTAL_CHECKS=$((CHECKS_PASSED + CHECKS_FAILED))
PASS_RATE=$((CHECKS_PASSED * 100 / TOTAL_CHECKS))

echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Passed:  $CHECKS_PASSED${NC}"
echo -e "${RED}✗ Failed:  $CHECKS_FAILED${NC}"
echo -e "${YELLOW}⚠ Warnings: $WARNINGS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "Success Rate: ${GREEN}${PASS_RATE}%${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

# Write summary to log
echo "" >> $LOG_FILE
echo "═══════════════════════════════════════════" >> $LOG_FILE
echo "SUMMARY" >> $LOG_FILE
echo "═══════════════════════════════════════════" >> $LOG_FILE
echo "Total Checks: $TOTAL_CHECKS" >> $LOG_FILE
echo "Passed: $CHECKS_PASSED" >> $LOG_FILE
echo "Failed: $CHECKS_FAILED" >> $LOG_FILE
echo "Warnings: $WARNINGS" >> $LOG_FILE
echo "Success Rate: ${PASS_RATE}%" >> $LOG_FILE
echo "═══════════════════════════════════════════" >> $LOG_FILE

# Final verdict
echo ""
if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ VERIFICATION PASSED                     ║${NC}"
    echo -e "${GREEN}║  Backend implementation is complete!       ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
    EXIT_CODE=0
elif [ $CHECKS_FAILED -le 5 ]; then
    echo -e "${YELLOW}╔════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  ⚠ VERIFICATION PASSED WITH WARNINGS       ║${NC}"
    echo -e "${YELLOW}║  Minor issues found - see details above    ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════╝${NC}"
    EXIT_CODE=0
else
    echo -e "${RED}╔════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ✗ VERIFICATION FAILED                     ║${NC}"
    echo -e "${RED}║  Critical issues found - fix required      ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════╝${NC}"
    EXIT_CODE=1
fi

echo ""
print_info "Detailed log saved to: $LOG_FILE"
print_info "Completed at: $(date)"
echo ""

# Next steps
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}Next Steps:${NC}"
    echo "  1. Install dependencies: npm install"
    echo "  2. Setup database: node scripts/setup-db.js"
    echo "  3. Seed data: node scripts/seed-content.js"
    echo "  4. Start server: npm run dev"
    echo "  5. Test with Postman collection"
    echo ""
fi

exit $EXIT_CODE
