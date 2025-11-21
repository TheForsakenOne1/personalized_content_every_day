/**
 * Sanitization Utilities Test Suite
 * Tests XSS protection functions
 */

import { describe, it, expect } from '@jest/globals';
import {
  escapeHtml,
  stripHtmlTags,
  sanitizeInput,
  sanitizeUrl,
  containsXSSPattern,
} from '../utils/sanitize';

describe('Sanitization Utilities', () => {
  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      const input = '<script>alert("XSS")</script>';
      const output = escapeHtml(input);
      expect(output).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
    });

    it('should handle ampersands', () => {
      const input = 'Tom & Jerry';
      const output = escapeHtml(input);
      expect(output).toBe('Tom &amp; Jerry');
    });
  });

  describe('stripHtmlTags', () => {
    it('should remove all HTML tags', () => {
      const input = '<p>Hello <strong>World</strong></p>';
      const output = stripHtmlTags(input);
      expect(output).toBe('Hello World');
    });

    it('should remove script tags', () => {
      const input = 'Text<script>alert(1)</script>More';
      const output = stripHtmlTags(input);
      expect(output).toBe('Textalert(1)More');
    });
  });

  describe('sanitizeInput', () => {
    it('should strip tags and escape HTML', () => {
      const input = '<b>Bold</b> & <i>Italic</i>';
      const output = sanitizeInput(input);
      expect(output).not.toContain('<');
      expect(output).not.toContain('>');
    });

    it('should normalize whitespace', () => {
      const input = 'Too    many     spaces';
      const output = sanitizeInput(input);
      expect(output).toBe('Too many spaces');
    });
  });

  describe('sanitizeUrl', () => {
    it('should allow HTTPS URLs', () => {
      const url = 'https://example.com/path';
      const output = sanitizeUrl(url);
      expect(output).toBe(url);
    });

    it('should allow HTTP URLs', () => {
      const url = 'http://example.com';
      const output = sanitizeUrl(url);
      expect(output).toBe(url);
    });

    it('should block javascript: protocol', () => {
      const url = 'javascript:alert(1)';
      const output = sanitizeUrl(url);
      expect(output).toBeNull();
    });

    it('should block data: protocol', () => {
      const url = 'data:text/html,<script>alert(1)</script>';
      const output = sanitizeUrl(url);
      expect(output).toBeNull();
    });

    it('should block vbscript: protocol', () => {
      const url = 'vbscript:alert(1)';
      const output = sanitizeUrl(url);
      expect(output).toBeNull();
    });
  });

  describe('containsXSSPattern', () => {
    it('should detect script tags', () => {
      const input = '<script>alert(1)</script>';
      expect(containsXSSPattern(input)).toBe(true);
    });

    it('should detect javascript: protocol', () => {
      const input = 'javascript:alert(1)';
      expect(containsXSSPattern(input)).toBe(true);
    });

    it('should detect event handlers', () => {
      const input = '<img onerror="alert(1)">';
      expect(containsXSSPattern(input)).toBe(true);
    });

    it('should not flag safe content', () => {
      const input = 'This is safe content';
      expect(containsXSSPattern(input)).toBe(false);
    });
  });
});
