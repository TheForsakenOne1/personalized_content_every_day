# Testing Guide - Phase 3 Week 11

**Goal**: Achieve 80% code coverage with comprehensive testing
**Framework**: Jest + Supertest (API testing)
**Strategy**: Unit tests + Integration tests + E2E tests

---

## Testing Stack

### Installation

```bash
npm install --save-dev \
  jest \
  @types/jest \
  ts-jest \
  supertest \
  @types/supertest \
  @faker-js/faker \
  prisma-mock

# Coverage reporting
npm install --save-dev @jest/globals
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
```

---

## Test Structure

```
tests/
├── unit/
│   ├── services/
│   │   ├── auth.service.test.ts
│   │   ├── user.service.test.ts
│   │   ├── content.service.test.ts
│   │   ├── analytics.service.test.ts
│   │   └── search/
│   │       ├── search-history.test.ts
│   │       ├── search-suggestions.test.ts
│   │       └── enhanced-search.test.ts
│   ├── utils/
│   │   ├── password.test.ts
│   │   └── retry.test.ts
│   └── middleware/
│       ├── auth.test.ts
│       └── isAdmin.test.ts
├── integration/
│   ├── auth.routes.test.ts
│   ├── user.routes.test.ts
│   ├── content.routes.test.ts
│   ├── search.routes.test.ts
│   ├── analytics.routes.test.ts
│   └── admin.routes.test.ts
├── e2e/
│   ├── user-journey.test.ts
│   ├── content-discovery.test.ts
│   └── admin-workflows.test.ts
├── load/
│   ├── feed-endpoint.js (k6)
│   └── search-endpoint.js (k6)
├── fixtures/
│   ├── users.ts
│   ├── content.ts
│   └── categories.ts
└── setup.ts
```

---

## Unit Test Examples

### Service Test

```typescript
// tests/unit/services/analytics.service.test.ts
import { analyticsService } from '../../../src/services/analytics/analytics.service';
import { prismaMock } from '../../mocks/prisma';

describe('AnalyticsService', () => {
  describe('getReadingStats', () => {
    it('should calculate reading stats correctly', async () => {
      // Mock data
      prismaMock.userContentInteraction.findMany.mockResolvedValue([
        {
          id: '1',
          userId: 'user-1',
          contentId: 'content-1',
          status: 'read',
          timeSpent: 300, // 5 minutes in seconds
          readAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          readProgress: 1.0,
          rating: null,
          isSaved: false,
          notes: null,
        },
        {
          id: '2',
          userId: 'user-1',
          contentId: 'content-2',
          status: 'read',
          timeSpent: 600, // 10 minutes
          readAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          readProgress: 1.0,
          rating: null,
          isSaved: false,
          notes: null,
        },
      ]);

      const stats = await analyticsService.getReadingStats('user-1');

      expect(stats).toEqual({
        totalReadingTimeMinutes: 15, // 300 + 600 seconds = 15 minutes
        averageReadingTimeMinutes: 7.5,
        totalContentRead: 2,
        contentReadThisWeek: 2,
        contentReadThisMonth: 2,
      });
    });

    it('should handle users with no reading history', async () => {
      prismaMock.userContentInteraction.findMany.mockResolvedValue([]);

      const stats = await analyticsService.getReadingStats('user-1');

      expect(stats).toEqual({
        totalReadingTimeMinutes: 0,
        averageReadingTimeMinutes: 0,
        totalContentRead: 0,
        contentReadThisWeek: 0,
        contentReadThisMonth: 0,
      });
    });
  });

  describe('getReadingStreak', () => {
    it('should calculate current streak correctly', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      prismaMock.userContentInteraction.findMany.mockResolvedValue([
        { readAt: today },
        { readAt: yesterday },
        { readAt: twoDaysAgo },
      ]);

      const streak = await analyticsService.getReadingStreak('user-1');

      expect(streak.currentStreak).toBe(3);
      expect(streak.streakActive).toBe(true);
    });
  });
});
```

### Utility Test

```typescript
// tests/unit/utils/password.test.ts
import { hashPassword, comparePassword } from '../../../src/utils/password';

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash password correctly', async () => {
      const password = 'Test123!@#';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'Test123!@#';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Due to salt
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const password = 'Test123!@#';
      const hash = await hashPassword(password);

      const isValid = await comparePassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'Test123!@#';
      const hash = await hashPassword(password);

      const isValid = await comparePassword('WrongPassword', hash);

      expect(isValid).toBe(false);
    });
  });
});
```

---

## Integration Test Examples

### API Route Test

```typescript
// tests/integration/auth.routes.test.ts
import request from 'supertest';
import app from '../../../src/server';
import { prismaMock } from '../../mocks/prisma';

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Test123!@#',
        fullName: 'Test User',
      };

      prismaMock.user.create.mockResolvedValue({
        id: 'user-1',
        email: userData.email,
        username: userData.username,
        fullName: userData.fullName,
        passwordHash: 'hashed',
        avatarUrl: null,
        emailVerified: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: 'test@example.com',
        username: 'existing',
        passwordHash: 'hash',
        fullName: null,
        avatarUrl: null,
        emailVerified: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'newuser',
          password: 'Test123!@#',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should validate input', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          username: 'te', // Too short
          password: '123', // Too weak
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const hashedPassword = await hashPassword('Test123!@#');

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: hashedPassword,
        fullName: 'Test User',
        avatarUrl: null,
        emailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123!@#',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });
  });
});
```

---

## E2E Test Examples

```typescript
// tests/e2e/user-journey.test.ts
import request from 'supertest';
import app from '../../src/server';

describe('Complete User Journey', () => {
  let accessToken: string;
  let userId: string;

  it('should complete full user journey', async () => {
    // 1. Register
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'journey@example.com',
        username: 'journeyuser',
        password: 'Test123!@#',
        fullName: 'Journey User',
      });

    expect(registerResponse.status).toBe(201);
    accessToken = registerResponse.body.data.accessToken;
    userId = registerResponse.body.data.user.id;

    // 2. Update preferences
    const prefsResponse = await request(app)
      .patch('/api/users/preferences')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        contentFrequency: 'daily',
        preferredContentTypes: ['paper', 'article'],
        theme: 'dark',
      });

    expect(prefsResponse.status).toBe(200);

    // 3. Subscribe to categories
    const categoriesResponse = await request(app)
      .put('/api/users/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        categoryIds: ['cat-1', 'cat-2'],
        priorities: [8, 6],
      });

    expect(categoriesResponse.status).toBe(200);

    // 4. Get personalized feed
    const feedResponse = await request(app)
      .get('/api/users/feed')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(feedResponse.status).toBe(200);
    expect(Array.isArray(feedResponse.body.data)).toBe(true);

    // 5. Search content
    const searchResponse = await request(app)
      .post('/api/search')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ query: 'machine learning' });

    expect(searchResponse.status).toBe(200);

    // 6. Get analytics
    const analyticsResponse = await request(app)
      .get('/api/analytics/dashboard')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(analyticsResponse.status).toBe(200);
    expect(analyticsResponse.body.data.readingStats).toBeDefined();
  });
});
```

---

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test -- auth.service.test.ts
```

### Run with Coverage
```bash
npm test -- --coverage
```

### Watch Mode (Development)
```bash
npm test -- --watch
```

### Run Only Unit Tests
```bash
npm test -- tests/unit
```

### Run Only Integration Tests
```bash
npm test -- tests/integration
```

---

## Coverage Goals

| Category | Target | Actual |
|----------|--------|--------|
| Statements | 80% | TBD |
| Branches | 80% | TBD |
| Functions | 80% | TBD |
| Lines | 80% | TBD |

### Coverage Reports

```bash
# Generate HTML report
npm test -- --coverage --coverageReporters=html

# View report
open coverage/index.html
```

---

## Continuous Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

**Created By**: Claude Code Agent
**Date**: November 16, 2025
**Phase**: 3 Week 11 - Testing & Quality
