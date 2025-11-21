/**
 * Validation Schemas Test Suite
 * Tests Zod validation schemas
 */

import { describe, it, expect } from '@jest/globals';
import { schemas } from '../validation/schemas';

describe('Validation Schemas', () => {
  describe('Email Schema', () => {
    it('should accept valid email', () => {
      const result = schemas.email.safeParse('test@example.com');
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = schemas.email.safeParse('invalid-email');
      expect(result.success).toBe(false);
    });

    it('should reject email that is too long', () => {
      const longEmail = 'a'.repeat(256) + '@example.com';
      const result = schemas.email.safeParse(longEmail);
      expect(result.success).toBe(false);
    });
  });

  describe('Password Schema', () => {
    it('should accept strong password', () => {
      const result = schemas.password.safeParse('Test123Pass');
      expect(result.success).toBe(true);
    });

    it('should reject password without uppercase', () => {
      const result = schemas.password.safeParse('test123pass');
      expect(result.success).toBe(false);
    });

    it('should reject password without number', () => {
      const result = schemas.password.safeParse('TestPassword');
      expect(result.success).toBe(false);
    });

    it('should reject password that is too short', () => {
      const result = schemas.password.safeParse('Test12');
      expect(result.success).toBe(false);
    });
  });

  describe('Register Schema', () => {
    it('should accept valid registration data', () => {
      const result = schemas.register.safeParse({
        email: 'test@example.com',
        username: 'testuser',
        password: 'Test123Pass',
        fullName: 'Test User',
      });
      expect(result.success).toBe(true);
    });

    it('should reject registration with invalid email', () => {
      const result = schemas.register.safeParse({
        email: 'invalid-email',
        username: 'testuser',
        password: 'Test123Pass',
      });
      expect(result.success).toBe(false);
    });

    it('should reject registration with weak password', () => {
      const result = schemas.register.safeParse({
        email: 'test@example.com',
        username: 'testuser',
        password: 'weak',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Update Categories Schema', () => {
    it('should accept valid category IDs', () => {
      const result = schemas.updateCategories.safeParse({
        categoryIds: [
          '550e8400-e29b-41d4-a716-446655440000',
          '550e8400-e29b-41d4-a716-446655440001',
        ],
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty category array', () => {
      const result = schemas.updateCategories.safeParse({
        categoryIds: [],
      });
      expect(result.success).toBe(false);
    });

    it('should reject too many categories', () => {
      const categoryIds = Array(51).fill('550e8400-e29b-41d4-a716-446655440000');
      const result = schemas.updateCategories.safeParse({ categoryIds });
      expect(result.success).toBe(false);
    });
  });
});
