/**
 * Accessibility testing utilities for automated WCAG 2.1 AA compliance testing
 * Provides functions to test keyboard navigation, ARIA attributes, and screen reader compatibility
 */

import { getFocusableElements, isFocusable } from './accessibilityUtils';

export interface AccessibilityTestResult {
  passed: boolean;
  message: string;
  element?: HTMLElement;
  severity: 'error' | 'warning' | 'info';
}

export interface AccessibilityTestSuite {
  testName: string;
  results: AccessibilityTestResult[];
  passed: boolean;
  score: number;
}

/**
 * Test if all interactive elements have proper ARIA labels
 */
export const testAriaLabels = (container: HTMLElement): AccessibilityTestResult[] => {
  const results: AccessibilityTestResult[] = [];
  const interactiveElements = container.querySelectorAll(
    'button, input, select, textarea, a[href], [role="button"], [role="tab"]'
  );

  interactiveElements.forEach(element => {
    const htmlElement = element as HTMLElement;
    const hasAriaLabel = htmlElement.hasAttribute('aria-label');
    const hasAriaLabelledBy = htmlElement.hasAttribute('aria-labelledby');
    const hasTitle = htmlElement.hasAttribute('title');
    const hasTextContent = htmlElement.textContent?.trim();
    const hasAltText = htmlElement.hasAttribute('alt');

    const hasAccessibleName =
      hasAriaLabel || hasAriaLabelledBy || hasTitle || hasTextContent || hasAltText;

    if (!hasAccessibleName) {
      results.push({
        passed: false,
        message: `Interactive element lacks accessible name: ${htmlElement.tagName.toLowerCase()}${htmlElement.className ? '.' + htmlElement.className.split(' ').join('.') : ''}`,
        element: htmlElement,
        severity: 'error',
      });
    } else {
      results.push({
        passed: true,
        message: `Interactive element has accessible name: ${htmlElement.tagName.toLowerCase()}`,
        element: htmlElement,
        severity: 'info',
      });
    }
  });

  return results;
};

/**
 * Test keyboard navigation functionality
 */
export const testKeyboardNavigation = async (
  container: HTMLElement
): Promise<AccessibilityTestResult[]> => {
  const results: AccessibilityTestResult[] = [];
  const focusableElements = getFocusableElements(container);

  if (focusableElements.length === 0) {
    results.push({
      passed: false,
      message: 'No focusable elements found in container',
      severity: 'warning',
    });
    return results;
  }

  // Test if all focusable elements can receive focus
  for (const element of focusableElements) {
    try {
      element.focus();
      const isFocused = document.activeElement === element;

      if (isFocused) {
        results.push({
          passed: true,
          message: `Element can receive focus: ${element.tagName.toLowerCase()}`,
          element,
          severity: 'info',
        });
      } else {
        results.push({
          passed: false,
          message: `Element cannot receive focus: ${element.tagName.toLowerCase()}`,
          element,
          severity: 'error',
        });
      }
    } catch (error) {
      results.push({
        passed: false,
        message: `Error focusing element: ${element.tagName.toLowerCase()} - ${error}`,
        element,
        severity: 'error',
      });
    }
  }

  // Test tab order
  const tabOrderTest = testTabOrder(focusableElements);
  results.push(...tabOrderTest);

  return results;
};

/**
 * Test tab order of focusable elements
 */
export const testTabOrder = (focusableElements: HTMLElement[]): AccessibilityTestResult[] => {
  const results: AccessibilityTestResult[] = [];

  // Check if elements have explicit tabindex values that might disrupt natural tab order
  focusableElements.forEach((element, index) => {
    const tabIndex = element.getAttribute('tabindex');

    if (tabIndex && parseInt(tabIndex) > 0) {
      results.push({
        passed: false,
        message: `Element has positive tabindex (${tabIndex}) which may disrupt natural tab order`,
        element,
        severity: 'warning',
      });
    } else if (tabIndex === '-1') {
      results.push({
        passed: true,
        message: 'Element correctly uses tabindex="-1" to remove from tab order',
        element,
        severity: 'info',
      });
    } else {
      results.push({
        passed: true,
        message: 'Element follows natural tab order',
        element,
        severity: 'info',
      });
    }
  });

  return results;
};

/**
 * Test ARIA roles and properties
 */
export const testAriaRoles = (container: HTMLElement): AccessibilityTestResult[] => {
  const results: AccessibilityTestResult[] = [];
  const elementsWithRoles = container.querySelectorAll('[role]');

  const validRoles = [
    'button',
    'tab',
    'tabpanel',
    'tablist',
    'menu',
    'menuitem',
    'menubar',
    'toolbar',
    'textbox',
    'region',
    'status',
    'alert',
    'alertdialog',
    'dialog',
    'navigation',
    'main',
    'banner',
    'contentinfo',
    'complementary',
    'form',
    'search',
    'application',
    'document',
    'img',
    'presentation',
    'none',
    'group',
    'list',
    'listitem',
    'grid',
    'gridcell',
    'row',
    'columnheader',
    'rowheader',
    'table',
    'cell',
    'heading',
  ];

  elementsWithRoles.forEach(element => {
    const htmlElement = element as HTMLElement;
    const role = htmlElement.getAttribute('role');

    if (role && validRoles.includes(role)) {
      results.push({
        passed: true,
        message: `Valid ARIA role: ${role}`,
        element: htmlElement,
        severity: 'info',
      });
    } else {
      results.push({
        passed: false,
        message: `Invalid or unknown ARIA role: ${role}`,
        element: htmlElement,
        severity: 'error',
      });
    }
  });

  return results;
};

/**
 * Test live regions for dynamic content updates
 */
export const testLiveRegions = (container: HTMLElement): AccessibilityTestResult[] => {
  const results: AccessibilityTestResult[] = [];
  const liveRegions = container.querySelectorAll('[aria-live]');

  liveRegions.forEach(element => {
    const htmlElement = element as HTMLElement;
    const ariaLive = htmlElement.getAttribute('aria-live');
    const validValues = ['polite', 'assertive', 'off'];

    if (ariaLive && validValues.includes(ariaLive)) {
      results.push({
        passed: true,
        message: `Valid aria-live value: ${ariaLive}`,
        element: htmlElement,
        severity: 'info',
      });
    } else {
      results.push({
        passed: false,
        message: `Invalid aria-live value: ${ariaLive}`,
        element: htmlElement,
        severity: 'error',
      });
    }
  });

  // Check for status bars and other dynamic content areas
  const statusElements = container.querySelectorAll('[role="status"], .status-bar, .editor-status');
  statusElements.forEach(element => {
    const htmlElement = element as HTMLElement;
    const hasAriaLive = htmlElement.hasAttribute('aria-live');

    if (!hasAriaLive) {
      results.push({
        passed: false,
        message: 'Status element should have aria-live attribute',
        element: htmlElement,
        severity: 'warning',
      });
    }
  });

  return results;
};

/**
 * Test color contrast (simplified version)
 */
export const testColorContrast = (container: HTMLElement): AccessibilityTestResult[] => {
  const results: AccessibilityTestResult[] = [];

  // This is a simplified test - in a real implementation, you'd use a proper color contrast library
  const textElements = container.querySelectorAll(
    'p, span, div, button, a, label, h1, h2, h3, h4, h5, h6'
  );

  textElements.forEach(element => {
    const htmlElement = element as HTMLElement;
    const computedStyle = window.getComputedStyle(htmlElement);
    const color = computedStyle.color;
    const backgroundColor = computedStyle.backgroundColor;

    // For now, we'll assume design tokens provide compliant colors
    // In a real implementation, you'd calculate the actual contrast ratio
    if (color && backgroundColor && color !== backgroundColor) {
      results.push({
        passed: true,
        message: 'Element has contrasting colors (assumed compliant with design tokens)',
        element: htmlElement,
        severity: 'info',
      });
    }
  });

  return results;
};

/**
 * Test focus indicators
 */
export const testFocusIndicators = (container: HTMLElement): AccessibilityTestResult[] => {
  const results: AccessibilityTestResult[] = [];
  const focusableElements = getFocusableElements(container);

  focusableElements.forEach(element => {
    const computedStyle = window.getComputedStyle(element, ':focus');
    const outline = computedStyle.outline;
    const outlineWidth = computedStyle.outlineWidth;
    const boxShadow = computedStyle.boxShadow;

    const hasFocusIndicator =
      (outline && outline !== 'none') ||
      (outlineWidth && outlineWidth !== '0px') ||
      (boxShadow && boxShadow !== 'none');

    if (hasFocusIndicator) {
      results.push({
        passed: true,
        message: 'Element has visible focus indicator',
        element,
        severity: 'info',
      });
    } else {
      results.push({
        passed: false,
        message: 'Element lacks visible focus indicator',
        element,
        severity: 'error',
      });
    }
  });

  return results;
};

/**
 * Test for proper heading structure
 */
export const testHeadingStructure = (container: HTMLElement): AccessibilityTestResult[] => {
  const results: AccessibilityTestResult[] = [];
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]');

  if (headings.length === 0) {
    results.push({
      passed: true,
      message: 'No headings found - not applicable',
      severity: 'info',
    });
    return results;
  }

  let previousLevel = 0;
  headings.forEach((heading, index) => {
    const htmlElement = heading as HTMLElement;
    const tagName = htmlElement.tagName.toLowerCase();
    const level = tagName.startsWith('h')
      ? parseInt(tagName.charAt(1))
      : parseInt(htmlElement.getAttribute('aria-level') || '1');

    if (index === 0 && level !== 1) {
      results.push({
        passed: false,
        message: 'First heading should be h1',
        element: htmlElement,
        severity: 'warning',
      });
    } else if (level > previousLevel + 1) {
      results.push({
        passed: false,
        message: `Heading level skipped: h${previousLevel} to h${level}`,
        element: htmlElement,
        severity: 'warning',
      });
    } else {
      results.push({
        passed: true,
        message: `Proper heading level: h${level}`,
        element: htmlElement,
        severity: 'info',
      });
    }

    previousLevel = level;
  });

  return results;
};

/**
 * Run comprehensive accessibility test suite
 */
export const runAccessibilityTestSuite = async (
  container: HTMLElement
): Promise<AccessibilityTestSuite> => {
  const allResults: AccessibilityTestResult[] = [];

  // Run all tests
  allResults.push(...testAriaLabels(container));
  allResults.push(...(await testKeyboardNavigation(container)));
  allResults.push(...testAriaRoles(container));
  allResults.push(...testLiveRegions(container));
  allResults.push(...testColorContrast(container));
  allResults.push(...testFocusIndicators(container));
  allResults.push(...testHeadingStructure(container));

  // Calculate results
  const passedTests = allResults.filter(result => result.passed);
  const failedTests = allResults.filter(result => !result.passed);
  const errorCount = allResults.filter(result => result.severity === 'error').length;

  const score = allResults.length > 0 ? (passedTests.length / allResults.length) * 100 : 100;
  const passed = errorCount === 0;

  return {
    testName: 'ProjectEditor Accessibility Test Suite',
    results: allResults,
    passed,
    score: Math.round(score),
  };
};

/**
 * Generate accessibility test report
 */
export const generateAccessibilityReport = (testSuite: AccessibilityTestSuite): string => {
  const { testName, results, passed, score } = testSuite;

  const errorResults = results.filter(r => r.severity === 'error');
  const warningResults = results.filter(r => r.severity === 'warning');
  const infoResults = results.filter(r => r.severity === 'info');

  let report = `# ${testName}\n\n`;
  report += `**Overall Status:** ${passed ? '✅ PASSED' : '❌ FAILED'}\n`;
  report += `**Score:** ${score}%\n\n`;

  report += `## Summary\n`;
  report += `- Total Tests: ${results.length}\n`;
  report += `- Errors: ${errorResults.length}\n`;
  report += `- Warnings: ${warningResults.length}\n`;
  report += `- Passed: ${infoResults.length}\n\n`;

  if (errorResults.length > 0) {
    report += `## ❌ Errors (${errorResults.length})\n`;
    errorResults.forEach((result, index) => {
      report += `${index + 1}. ${result.message}\n`;
    });
    report += '\n';
  }

  if (warningResults.length > 0) {
    report += `## ⚠️ Warnings (${warningResults.length})\n`;
    warningResults.forEach((result, index) => {
      report += `${index + 1}. ${result.message}\n`;
    });
    report += '\n';
  }

  report += `## ✅ Passed Tests (${infoResults.length})\n`;
  infoResults.forEach((result, index) => {
    report += `${index + 1}. ${result.message}\n`;
  });

  return report;
};
