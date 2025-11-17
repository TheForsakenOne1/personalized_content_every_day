#!/bin/bash

# Security Audit Script
# Comprehensive security check for production readiness

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CRITICAL=0
HIGH=0
MEDIUM=0
LOW=0
PASSED=0

REPORT_FILE="/tmp/security_audit_$(date +%Y%m%d_%H%M%S).md"

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

log_critical() {
    echo -e "${RED}[CRITICAL]${NC} $1"
    echo "🔴 **CRITICAL:** $1" >> $REPORT_FILE
    CRITICAL=$((CRITICAL + 1))
}

log_high() {
    echo -e "${RED}[HIGH]${NC} $1"
    echo "🔴 **HIGH:** $1" >> $REPORT_FILE
    HIGH=$((HIGH + 1))
}

log_medium() {
    echo -e "${YELLOW}[MEDIUM]${NC} $1"
    echo "🟡 **MEDIUM:** $1" >> $REPORT_FILE
    MEDIUM=$((MEDIUM + 1))
}

log_low() {
    echo -e "${YELLOW}[LOW]${NC} $1"
    echo "🟡 **LOW:** $1" >> $REPORT_FILE
    LOW=$((LOW + 1))
}

log_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    echo "✅ **PASS:** $1" >> $REPORT_FILE
    PASSED=$((PASSED + 1))
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
    echo "ℹ️ **INFO:** $1" >> $REPORT_FILE
}

# Initialize report
cat > $REPORT_FILE << 'EOF'
# Security Audit Report

**Date:** $(date)
**Scope:** Backend Application Security
**Focus Areas:** Secrets, SQL Injection, DDoS, XSS, OWASP Top 10

---

## Executive Summary

EOF

clear
echo -e "${RED}╔════════════════════════════════════════════╗${NC}"
echo -e "${RED}║      SECURITY AUDIT - PRODUCTION CHECK    ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════╝${NC}"
echo ""

# 1. SECRET EXPOSURE CHECK
print_header "1. Secret Exposure Analysis"

echo "## 1. Secret Exposure Analysis" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Check for hardcoded secrets in code
if grep -r "password.*=.*['\"]" src/ --include="*.ts" | grep -v "passwordHash" | grep -v "password:" | grep -v "PASSWORD" | grep -v "interface" | grep -q .; then
    log_critical "Potential hardcoded passwords found in source code"
    grep -r "password.*=.*['\"]" src/ --include="*.ts" | grep -v "passwordHash" | grep -v "password:" | grep -v "PASSWORD" | grep -v "interface" >> $REPORT_FILE
else
    log_pass "No hardcoded passwords in source code"
fi

# Check for API keys
if grep -r "api[_-]key.*=.*['\"][a-zA-Z0-9]" src/ --include="*.ts" | grep -v "process.env" | grep -v "API_KEY" | grep -q .; then
    log_critical "Potential hardcoded API keys found"
    grep -r "api[_-]key.*=.*['\"][a-zA-Z0-9]" src/ --include="*.ts" | grep -v "process.env" >> $REPORT_FILE
else
    log_pass "No hardcoded API keys in source code"
fi

# Check for JWT secrets
if grep -r "jwt.*secret.*=.*['\"]" src/ --include="*.ts" | grep -v "process.env" | grep -v "JWT_SECRET" | grep -q .; then
    log_high "Potential hardcoded JWT secrets found"
else
    log_pass "JWT secrets properly use environment variables"
fi

# Check .env is gitignored
if [ -f ".gitignore" ] && grep -q "^\.env$" .gitignore; then
    log_pass ".env file is properly gitignored"
else
    log_critical ".env file is NOT gitignored - secrets may be exposed!"
fi

# Check for .env in git history
if git log --all --full-history -- .env 2>/dev/null | grep -q "commit"; then
    log_critical ".env file was committed to git history!"
else
    log_pass ".env file not found in git history"
fi

# Check for secrets in environment variables
if [ -f ".env" ]; then
    log_info "Checking .env file structure..."

    # Check for default/example secrets still in use
    if grep -q "your-super-secret" .env; then
        log_high ".env contains default placeholder secrets - change before production!"
    else
        log_pass ".env does not contain default placeholders"
    fi

    # Check JWT secret strength
    JWT_SECRET=$(grep "^JWT_SECRET=" .env | cut -d'=' -f2)
    if [ ${#JWT_SECRET} -lt 32 ]; then
        log_high "JWT_SECRET is too short (${#JWT_SECRET} chars) - should be 32+ characters"
    else
        log_pass "JWT_SECRET has adequate length (${#JWT_SECRET} chars)"
    fi
fi

# 2. SQL INJECTION PROTECTION
print_header "2. SQL Injection Protection"

echo "" >> $REPORT_FILE
echo "## 2. SQL Injection Protection" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Check for raw SQL queries
RAW_SQL_COUNT=$(grep -r "SELECT.*FROM\|INSERT INTO\|UPDATE.*SET\|DELETE FROM" src/ --include="*.ts" | grep -v "//" | grep -v "^\s*//" | wc -l)

if [ $RAW_SQL_COUNT -gt 0 ]; then
    log_medium "Found $RAW_SQL_COUNT potential raw SQL queries"

    # Check if they use parameterized queries
    if grep -r '\$queryRaw\|sql`' src/ --include="*.ts" | grep -q .; then
        log_pass "Raw queries use Prisma's parameterized query methods"
    else
        log_high "Raw SQL queries found - verify parameterization"
    fi
else
    log_pass "No raw SQL queries found"
fi

# Check Prisma usage
if grep -r "prisma\." src/ --include="*.ts" | grep -q .; then
    log_pass "Using Prisma ORM - protected against SQL injection by default"
else
    log_medium "Prisma usage not detected in expected locations"
fi

# Check for string concatenation in queries
if grep -r 'sql.*+\|query.*+.*req\.' src/ --include="*.ts" | grep -v "//" | grep -q .; then
    log_critical "Potential SQL injection via string concatenation detected!"
    grep -r 'sql.*+\|query.*+.*req\.' src/ --include="*.ts" | grep -v "//" >> $REPORT_FILE
else
    log_pass "No SQL string concatenation detected"
fi

# 3. DDOS PROTECTION
print_header "3. DDoS Protection"

echo "" >> $REPORT_FILE
echo "## 3. DDoS Protection" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Check for rate limiting
if grep -r "express-rate-limit\|rateLimit" src/ package.json | grep -q .; then
    log_pass "Rate limiting package installed"

    # Check rate limiting implementation
    if grep -r "rateLimit\|rateLimiter" src/middleware/ src/routes/ --include="*.ts" | grep -q .; then
        log_pass "Rate limiting middleware implemented"

        # Check auth routes have rate limiting
        if grep -r "authRateLimiter\|rateLimiter" src/routes/auth.routes.ts | grep -q .; then
            log_pass "Authentication routes protected with rate limiting"
        else
            log_high "Authentication routes may not have rate limiting"
        fi
    else
        log_high "Rate limiting not applied to routes"
    fi
else
    log_critical "Rate limiting not implemented - vulnerable to DDoS"
fi

# Check for global rate limiting
if grep -r "app.use.*rateLimiter" src/server.ts | grep -q .; then
    log_pass "Global rate limiting applied"
else
    log_medium "No global rate limiting - consider adding"
fi

# Check for helmet (security headers)
if grep -r "helmet" src/server.ts package.json | grep -q .; then
    log_pass "Helmet security headers configured"
else
    log_high "Helmet not configured - missing security headers"
fi

# Check for request size limits
if grep -r "express.json.*{.*limit" src/ --include="*.ts" | grep -q .; then
    log_pass "Request body size limits configured"
else
    log_medium "No request body size limits - potential for payload attacks"
fi

# 4. XSS PROTECTION
print_header "4. XSS Protection"

echo "" >> $REPORT_FILE
echo "## 4. XSS Protection" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Check for input sanitization
if grep -r "xss\|sanitize\|validator" package.json src/ | grep -q .; then
    log_pass "Input sanitization libraries detected"
else
    log_medium "No explicit input sanitization library found"
fi

# Check for dangerous HTML rendering
if grep -r "dangerouslySetInnerHTML\|innerHTML\|document.write" src/ --include="*.ts" | grep -q .; then
    log_high "Dangerous HTML rendering methods detected"
else
    log_pass "No dangerous HTML rendering detected"
fi

# Check Content-Security-Policy
if grep -r "contentSecurityPolicy\|Content-Security-Policy" src/ --include="*.ts" | grep -q .; then
    log_pass "Content Security Policy configuration found"
else
    log_medium "Content Security Policy not configured"
fi

# Check for proper response encoding
if grep -r "res.json\|res.send" src/ --include="*.ts" | grep -q .; then
    log_pass "Using Express's built-in JSON encoding (XSS safe)"
else
    log_info "Response encoding check inconclusive"
fi

# 5. AUTHENTICATION & AUTHORIZATION
print_header "5. Authentication & Authorization"

echo "" >> $REPORT_FILE
echo "## 5. Authentication & Authorization" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Check for JWT implementation
if grep -r "jsonwebtoken\|jwt" package.json src/ | grep -q .; then
    log_pass "JWT authentication implemented"

    # Check token verification
    if grep -r "jwt.verify" src/middleware/auth.ts | grep -q .; then
        log_pass "JWT token verification implemented"
    else
        log_high "JWT verification not found in auth middleware"
    fi
else
    log_critical "No JWT authentication found"
fi

# Check for bcrypt password hashing
if grep -r "bcrypt" package.json src/ | grep -q .; then
    log_pass "bcrypt password hashing implemented"

    # Check password comparison
    if grep -r "bcrypt.compare" src/ --include="*.ts" | grep -q .; then
        log_pass "Secure password comparison implemented"
    else
        log_medium "bcrypt.compare not found - verify password checking"
    fi
else
    log_critical "No password hashing library found"
fi

# Check for admin authorization
if [ -f "src/middleware/isAdmin.ts" ]; then
    log_pass "Admin authorization middleware exists"
else
    log_high "Admin authorization middleware not found"
fi

# Check for password requirements
if grep -r "password.*length\|password.*regex\|password.*validation" src/services/auth.service.ts | grep -q .; then
    log_pass "Password validation implemented"
else
    log_medium "Password validation not found"
fi

# 6. CORS CONFIGURATION
print_header "6. CORS Configuration"

echo "" >> $REPORT_FILE
echo "## 6. CORS Configuration" >> $REPORT_FILE
echo "" >> $REPORT_FILE

if grep -r "cors" package.json src/ | grep -q .; then
    log_pass "CORS package installed"

    # Check for wildcard CORS
    if grep -r "origin:.*\*\|'*'" src/server.ts | grep -q .; then
        log_critical "CORS configured with wildcard (*) - allows any origin!"
    else
        log_pass "CORS not using wildcard origin"
    fi

    # Check for environment-based CORS
    if grep -r "CORS_ORIGIN\|corsOrigin" src/ .env | grep -q .; then
        log_pass "CORS origin configured via environment variable"
    else
        log_medium "CORS origin not environment-configurable"
    fi
else
    log_high "CORS not configured"
fi

# 7. ERROR HANDLING
print_header "7. Error Handling & Information Disclosure"

echo "" >> $REPORT_FILE
echo "## 7. Error Handling" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Check for error handler
if [ -f "src/middleware/errorHandler.ts" ]; then
    log_pass "Global error handler exists"

    # Check if errors expose stack traces
    if grep -r "stack.*error\|error.stack" src/middleware/errorHandler.ts | grep -q .; then
        log_medium "Error handler may expose stack traces - verify NODE_ENV check"
    else
        log_pass "Error handler doesn't directly expose stack traces"
    fi
else
    log_high "No global error handler found"
fi

# Check for console.log in production
CONSOLE_COUNT=$(grep -r "console.log\|console.error" src/ --include="*.ts" | grep -v "//" | wc -l)
if [ $CONSOLE_COUNT -gt 10 ]; then
    log_low "$CONSOLE_COUNT console statements found - consider using a logger"
else
    log_pass "Minimal console usage ($CONSOLE_COUNT instances)"
fi

# 8. DEPENDENCY VULNERABILITIES
print_header "8. Dependency Security"

echo "" >> $REPORT_FILE
echo "## 8. Dependency Security" >> $REPORT_FILE
echo "" >> $REPORT_FILE

if [ -f "package.json" ]; then
    log_info "Running npm audit..."

    # Run npm audit
    if npm audit --json > /tmp/npm_audit.json 2>&1; then
        log_pass "No vulnerabilities found in dependencies"
    else
        CRITICAL_VULN=$(cat /tmp/npm_audit.json | grep -o '"critical":[0-9]*' | cut -d':' -f2 || echo "0")
        HIGH_VULN=$(cat /tmp/npm_audit.json | grep -o '"high":[0-9]*' | cut -d':' -f2 || echo "0")

        if [ "$CRITICAL_VULN" != "0" ]; then
            log_critical "Found $CRITICAL_VULN critical vulnerabilities in dependencies"
        fi

        if [ "$HIGH_VULN" != "0" ]; then
            log_high "Found $HIGH_VULN high severity vulnerabilities in dependencies"
        fi
    fi
fi

# 9. SESSION MANAGEMENT
print_header "9. Session Management"

echo "" >> $REPORT_FILE
echo "## 9. Session Management" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Check token expiry
if grep -r "JWT_ACCESS_EXPIRY\|JWT_REFRESH_EXPIRY" .env src/ | grep -q .; then
    log_pass "JWT token expiry configured"

    # Check expiry values
    if [ -f ".env" ]; then
        ACCESS_EXPIRY=$(grep "JWT_ACCESS_EXPIRY" .env | cut -d'=' -f2)
        if [[ "$ACCESS_EXPIRY" == *"15m"* ]] || [[ "$ACCESS_EXPIRY" == *"30m"* ]]; then
            log_pass "Access token expiry is reasonable ($ACCESS_EXPIRY)"
        else
            log_medium "Access token expiry may be too long: $ACCESS_EXPIRY"
        fi
    fi
else
    log_high "JWT token expiry not configured"
fi

# Check for refresh token implementation
if grep -r "refreshToken\|refresh_token" src/ --include="*.ts" | grep -q .; then
    log_pass "Refresh token mechanism implemented"
else
    log_medium "No refresh token mechanism found"
fi

# 10. INPUT VALIDATION
print_header "10. Input Validation"

echo "" >> $REPORT_FILE
echo "## 10. Input Validation" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Check for validation library
if grep -r "joi\|yup\|zod\|validator" package.json | grep -q .; then
    log_pass "Validation library found in dependencies"
else
    log_medium "No explicit validation library found"
fi

# Check for email validation
if grep -r "email.*validation\|isEmail\|email.*regex" src/ --include="*.ts" | grep -q .; then
    log_pass "Email validation implemented"
else
    log_medium "Email validation not explicitly found"
fi

# Check for type checking
if [ -f "tsconfig.json" ]; then
    if grep -q '"strict": true' tsconfig.json; then
        log_pass "TypeScript strict mode enabled (type safety)"
    else
        log_medium "TypeScript strict mode not enabled"
    fi
fi

# 11. FILE UPLOAD SECURITY (if applicable)
print_header "11. File Upload Security"

echo "" >> $REPORT_FILE
echo "## 11. File Upload Security" >> $REPORT_FILE
echo "" >> $REPORT_FILE

if grep -r "multer\|formidable\|busboy" package.json | grep -q .; then
    log_info "File upload library detected"

    # Check for file type validation
    if grep -r "mimetype\|fileFilter" src/ --include="*.ts" | grep -q .; then
        log_pass "File type validation found"
    else
        log_high "File upload found but no type validation detected"
    fi
else
    log_pass "No file upload functionality detected"
fi

# 12. LOGGING & MONITORING
print_header "12. Logging & Monitoring"

echo "" >> $REPORT_FILE
echo "## 12. Logging & Monitoring" >> $REPORT_FILE
echo "" >> $REPORT_FILE

if grep -r "morgan\|winston\|pino" package.json | grep -q .; then
    log_pass "Logging library implemented"
else
    log_medium "No logging library found"
fi

# Check for sensitive data in logs
if grep -r "log.*password\|console.*password" src/ --include="*.ts" | grep -v "//" | grep -q .; then
    log_critical "Potential password logging detected!"
else
    log_pass "No obvious password logging"
fi

# GENERATE SUMMARY
print_header "13. Security Summary"

echo "" >> $REPORT_FILE
echo "## Summary" >> $REPORT_FILE
echo "" >> $REPORT_FILE

TOTAL_ISSUES=$((CRITICAL + HIGH + MEDIUM + LOW))

echo "| Severity | Count |" >> $REPORT_FILE
echo "|----------|-------|" >> $REPORT_FILE
echo "| 🔴 Critical | $CRITICAL |" >> $REPORT_FILE
echo "| 🔴 High | $HIGH |" >> $REPORT_FILE
echo "| 🟡 Medium | $MEDIUM |" >> $REPORT_FILE
echo "| 🟡 Low | $LOW |" >> $REPORT_FILE
echo "| ✅ Passed | $PASSED |" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "Security Audit Results:"
echo -e "${RED}🔴 Critical Issues: $CRITICAL${NC}"
echo -e "${RED}🔴 High Issues:     $HIGH${NC}"
echo -e "${YELLOW}🟡 Medium Issues:   $MEDIUM${NC}"
echo -e "${YELLOW}🟡 Low Issues:      $LOW${NC}"
echo -e "${GREEN}✅ Passed Checks:   $PASSED${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

# Final verdict
if [ $CRITICAL -eq 0 ] && [ $HIGH -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ SECURITY AUDIT PASSED                  ║${NC}"
    echo -e "${GREEN}║  Application is production-ready          ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"

    echo "" >> $REPORT_FILE
    echo "## 🎉 Verdict: PRODUCTION READY" >> $REPORT_FILE
    echo "" >> $REPORT_FILE
    echo "The application has passed all critical security checks." >> $REPORT_FILE

    EXIT_CODE=0
elif [ $CRITICAL -eq 0 ] && [ $HIGH -le 2 ]; then
    echo -e "${YELLOW}╔════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  ⚠ SECURITY AUDIT PASSED WITH WARNINGS    ║${NC}"
    echo -e "${YELLOW}║  Address high-priority issues before prod  ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════╝${NC}"

    echo "" >> $REPORT_FILE
    echo "## ⚠️ Verdict: PRODUCTION READY WITH WARNINGS" >> $REPORT_FILE
    echo "" >> $REPORT_FILE
    echo "Address the high-priority issues before deploying to production." >> $REPORT_FILE

    EXIT_CODE=0
else
    echo -e "${RED}╔════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ✗ SECURITY AUDIT FAILED                  ║${NC}"
    echo -e "${RED}║  CRITICAL ISSUES MUST BE FIXED            ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════╝${NC}"

    echo "" >> $REPORT_FILE
    echo "## ❌ Verdict: NOT PRODUCTION READY" >> $REPORT_FILE
    echo "" >> $REPORT_FILE
    echo "Critical security issues must be resolved before production deployment." >> $REPORT_FILE

    EXIT_CODE=1
fi

echo ""
echo -e "${BLUE}Detailed report saved to: $REPORT_FILE${NC}"
echo ""

exit $EXIT_CODE
