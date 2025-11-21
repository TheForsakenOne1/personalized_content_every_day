/**
 * Jest Test Setup
 * Runs before all tests
 */

import { prisma } from '../utils/prisma';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';

// Global test timeout
jest.setTimeout(10000);

// Clean up after all tests
afterAll(async () => {
  await prisma.$disconnect();
});
