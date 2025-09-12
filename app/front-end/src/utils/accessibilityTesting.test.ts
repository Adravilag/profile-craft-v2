/**
 * Tests for accessibility testing utilities
 * Covers automated WCAG 2.1 AA compliance testing functions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  testAriaLabels,
  testKeyboardNavigation,
  testAriaRoles,
  testLiveRegions,
  testColorContrast,
  testFocusIndicators,
  testHeadingStructure,
  runAccessibilityTestSuite,
  generateAccessibilityReport,
} from './accessibilityTesting';
import * as accessibilityUtils from './accessibilityUtils';

// Mock the accessibility utils
vi.mock('./accessibilityUtils', () => ({
  getFocusableElements: vi.fn(() => []),
  isFocusable: vi.fn(() => true),
}));

describe('accessibilityTesting', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.clearAllMocks();
  });

  describe('testAriaLabels', () => {
    it('should pass when interactive elements have accessible names', () => {
      container.innerHTML = `
        <button aria-label="Save document">Save</button>
        <input type="text" aria-label="Enter your name" />
        <a href="#" title="Go to homepage">Home</a>
        <button>Click me</button>
      `;

      const results = testAriaLabels(container);

      expect(results).toHaveLength(4);
      expect(results.filter(r => r.passed)).toHaveLength(4);
      expect(results.filter(r => r.severity === 'error')).toHaveLength(0);
    });

    it('should fail when interactive elements lack accessible names', () => {
      container.innerHTML = `
        <button></button>
        <input type="text" />
        <a href="#"></a>
      `;

      const results = testAriaLabels(container);

      expect(results).toHaveLength(3);
      expect(results.filter(r => !r.passed)).toHaveLength(3);
      expect(results.filter(r => r.severity === 'error')).toHaveLength(3);
    });

    it('should handle elements with aria-labelledby', () => {
      container.innerHTML = `
        <label id="name-label">Name</label>
        <input type="text" aria-labelledby="name-label" />
      `;

      const results = testAriaLabels(container);

      expect(results).toHaveLength(1);
      expect(results[0].passed).toBe(true);
    });
  });

  describe('testKeyboardNavigation', () => {
    it('should test focusable elements', async () => {
      const button = document.createElement('button');
      button.textContent = 'Test Button';
      button.focus = vi.fn();
      container.appendChild(button);

      vi.mocked(accessibilityUtils.getFocusableElements).mockReturnValue([button]);

      // Mock document.activeElement
      Object.defineProperty(document, 'activeElement', {
        get: () => button,
        configurable: true,
      });

      const results = await testKeyboardNavigation(container);

      expect(accessibilityUtils.getFocusableElements).toHaveBeenCalledWith(container);
      expect(button.focus).toHaveBeenCalled();
      expect(results.some(r => r.passed && r.message.includes('can receive focus'))).toBe(true);
    });

    it('should handle containers with no focusable elements', async () => {
      vi.mocked(accessibilityUtils.getFocusableElements).mockReturnValue([]);

      const results = await testKeyboardNavigation(container);

      expect(results).toHaveLength(1);
      expect(results[0].passed).toBe(false);
      expect(results[0].message).toBe('No focusable elements found in container');
    });

    it('should test tab order', async () => {
      container.innerHTML = `
        <button tabindex="1">First</button>
        <button tabindex="-1">Hidden</button>
        <button>Normal</button>
      `;

      const buttons = Array.from(container.querySelectorAll('button')) as HTMLElement[];
      buttons.forEach(btn => {
        btn.focus = vi.fn();
      });

      vi.mocked(accessibilityUtils.getFocusableElements).mockReturnValue(buttons);

      const results = await testKeyboardNavigation(container);

      const tabOrderResults = results.filter(r => r.message.includes('tabindex'));
      expect(tabOrderResults.some(r => !r.passed && r.message.includes('positive tabindex'))).toBe(
        true
      );
      expect(tabOrderResults.some(r => r.passed && r.message.includes('tabindex="-1"'))).toBe(true);
    });
  });

  describe('testAriaRoles', () => {
    it('should validate ARIA roles', () => {
      container.innerHTML = `
        <div role="button">Custom Button</div>
        <div role="invalid-role">Invalid</div>
        <div role="tab">Tab</div>
      `;

      const results = testAriaRoles(container);

      expect(results).toHaveLength(3);
      expect(results.filter(r => r.passed)).toHaveLength(2);
      expect(results.filter(r => !r.passed)).toHaveLength(1);
      expect(results.find(r => !r.passed)?.message).toContain('invalid-role');
    });

    it('should handle elements without roles', () => {
      container.innerHTML = `<div>No role</div>`;

      const results = testAriaRoles(container);

      expect(results).toHaveLength(0);
    });
  });

  describe('testLiveRegions', () => {
    it('should validate aria-live attributes', () => {
      container.innerHTML = `
        <div aria-live="polite">Status updates</div>
        <div aria-live="assertive">Urgent updates</div>
        <div aria-live="invalid">Invalid value</div>
        <div role="status">Status without aria-live</div>
      `;

      const results = testLiveRegions(container);

      expect(results.filter(r => r.passed && r.message.includes('Valid aria-live'))).toHaveLength(
        2
      );
      expect(
        results.filter(r => !r.passed && r.message.includes('Invalid aria-live'))
      ).toHaveLength(1);
      expect(
        results.filter(r => !r.passed && r.message.includes('should have aria-live'))
      ).toHaveLength(1);
    });
  });

  describe('testColorContrast', () => {
    it('should test color contrast (simplified)', () => {
      container.innerHTML = `
        <p style="color: black; background-color: white;">Good contrast</p>
        <span style="color: red; background-color: blue;">Different colors</span>
      `;

      const results = testColorContrast(container);

      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.passed)).toBe(true);
    });
  });

  describe('testFocusIndicators', () => {
    it('should test focus indicators', () => {
      const button = document.createElement('button');
      container.appendChild(button);

      vi.mocked(accessibilityUtils.getFocusableElements).mockReturnValue([button]);

      // Mock getComputedStyle to return focus styles
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = vi.fn().mockReturnValue({
        outline: '2px solid blue',
        outlineWidth: '2px',
        boxShadow: 'none',
      });

      const results = testFocusIndicators(container);

      expect(results).toHaveLength(1);
      expect(results[0].passed).toBe(true);
      expect(results[0].message).toBe('Element has visible focus indicator');

      // Restore original function
      window.getComputedStyle = originalGetComputedStyle;
    });

    it('should fail when elements lack focus indicators', () => {
      const button = document.createElement('button');
      container.appendChild(button);

      vi.mocked(accessibilityUtils.getFocusableElements).mockReturnValue([button]);

      // Mock getComputedStyle to return no focus styles
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = vi.fn().mockReturnValue({
        outline: 'none',
        outlineWidth: '0px',
        boxShadow: 'none',
      });

      const results = testFocusIndicators(container);

      expect(results).toHaveLength(1);
      expect(results[0].passed).toBe(false);
      expect(results[0].message).toBe('Element lacks visible focus indicator');

      // Restore original function
      window.getComputedStyle = originalGetComputedStyle;
    });
  });

  describe('testHeadingStructure', () => {
    it('should validate proper heading structure', () => {
      container.innerHTML = `
        <h1>Main Title</h1>
        <h2>Section</h2>
        <h3>Subsection</h3>
        <h2>Another Section</h2>
      `;

      const results = testHeadingStructure(container);

      expect(results.filter(r => r.passed)).toHaveLength(4);
      expect(results.filter(r => !r.passed)).toHaveLength(0);
    });

    it('should detect heading level skipping', () => {
      container.innerHTML = `
        <h1>Main Title</h1>
        <h4>Skipped levels</h4>
      `;

      const results = testHeadingStructure(container);

      expect(results.filter(r => !r.passed && r.message.includes('level skipped'))).toHaveLength(1);
    });

    it('should warn about starting with non-h1', () => {
      container.innerHTML = `
        <h2>Should be h1</h2>
        <h3>Subsection</h3>
      `;

      const results = testHeadingStructure(container);

      expect(
        results.filter(r => !r.passed && r.message.includes('First heading should be h1'))
      ).toHaveLength(1);
    });

    it('should handle containers with no headings', () => {
      container.innerHTML = `<p>No headings here</p>`;

      const results = testHeadingStructure(container);

      expect(results).toHaveLength(1);
      expect(results[0].passed).toBe(true);
      expect(results[0].message).toBe('No headings found - not applicable');
    });
  });

  describe('runAccessibilityTestSuite', () => {
    it('should run comprehensive test suite', async () => {
      container.innerHTML = `
        <h1>Test Page</h1>
        <button aria-label="Test button">Click me</button>
        <div role="status" aria-live="polite">Status</div>
      `;

      const button = container.querySelector('button') as HTMLElement;
      button.focus = vi.fn();
      vi.mocked(accessibilityUtils.getFocusableElements).mockReturnValue([button]);

      // Mock document.activeElement
      Object.defineProperty(document, 'activeElement', {
        get: () => button,
        configurable: true,
      });

      // Mock getComputedStyle for focus indicators
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = vi.fn().mockReturnValue({
        outline: '2px solid blue',
        outlineWidth: '2px',
        boxShadow: 'none',
        color: 'black',
        backgroundColor: 'white',
      });

      const testSuite = await runAccessibilityTestSuite(container);

      expect(testSuite.testName).toBe('ProjectEditor Accessibility Test Suite');
      expect(testSuite.results.length).toBeGreaterThan(0);
      expect(testSuite.score).toBeGreaterThan(0);
      expect(typeof testSuite.passed).toBe('boolean');

      // Restore original function
      window.getComputedStyle = originalGetComputedStyle;
    });
  });

  describe('generateAccessibilityReport', () => {
    it('should generate a comprehensive report', () => {
      const mockTestSuite = {
        testName: 'Test Suite',
        results: [
          { passed: true, message: 'Test passed', severity: 'info' as const },
          { passed: false, message: 'Test failed', severity: 'error' as const },
          { passed: false, message: 'Test warning', severity: 'warning' as const },
        ],
        passed: false,
        score: 67,
      };

      const report = generateAccessibilityReport(mockTestSuite);

      expect(report).toContain('# Test Suite');
      expect(report).toContain('**Overall Status:** ❌ FAILED');
      expect(report).toContain('**Score:** 67%');
      expect(report).toContain('## ❌ Errors (1)');
      expect(report).toContain('## ⚠️ Warnings (1)');
      expect(report).toContain('## ✅ Passed Tests (1)');
      expect(report).toContain('Test failed');
      expect(report).toContain('Test warning');
      expect(report).toContain('Test passed');
    });

    it('should generate report for passing test suite', () => {
      const mockTestSuite = {
        testName: 'Passing Suite',
        results: [{ passed: true, message: 'All good', severity: 'info' as const }],
        passed: true,
        score: 100,
      };

      const report = generateAccessibilityReport(mockTestSuite);

      expect(report).toContain('**Overall Status:** ✅ PASSED');
      expect(report).toContain('**Score:** 100%');
      expect(report).not.toContain('## ❌ Errors');
      expect(report).not.toContain('## ⚠️ Warnings');
    });
  });
});
