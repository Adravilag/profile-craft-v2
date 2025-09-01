/**
 * Accessibility Testing Utilities
 * Task 13: Add accessibility improvements
 */

export interface AccessibilityTestResult {
  passed: boolean;
  message: string;
  element?: HTMLElement;
  severity: 'error' | 'warning' | 'info';
}

export interface AccessibilityReport {
  totalTests: number;
  passed: number;
  failed: number;
  warnings: number;
  results: AccessibilityTestResult[];
}

/**
 * Accessibility Testing Suite
 */
export class AccessibilityTester {
  private results: AccessibilityTestResult[] = [];

  /**
   * Run all accessibility tests
   */
  public runAllTests(container: HTMLElement = document.body): AccessibilityReport {
    this.results = [];

    // Run all test categories
    this.testFocusManagement(container);
    this.testAriaLabels(container);
    this.testColorContrast(container);
    this.testKeyboardNavigation(container);
    this.testSemanticStructure(container);
    this.testFormAccessibility(container);
    this.testImageAccessibility(container);
    this.testHeadingStructure(container);

    return this.generateReport();
  }

  /**
   * Test focus management
   */
  private testFocusManagement(container: HTMLElement): void {
    const focusableElements = container.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    focusableElements.forEach((element, index) => {
      const el = element as HTMLElement;

      // Test if element is focusable
      const originalTabIndex = el.tabIndex;
      el.focus();

      if (document.activeElement !== el && originalTabIndex >= 0) {
        this.addResult({
          passed: false,
          message: `Element is not focusable: ${this.getElementDescription(el)}`,
          element: el,
          severity: 'error',
        });
      }

      // Test focus indicators
      const computedStyle = window.getComputedStyle(el, ':focus');
      const hasOutline = computedStyle.outline !== 'none' && computedStyle.outline !== '';
      const hasBoxShadow = computedStyle.boxShadow !== 'none';
      const hasCustomFocus =
        el.classList.contains('focus-visible') || el.hasAttribute('data-focus-visible');

      if (!hasOutline && !hasBoxShadow && !hasCustomFocus) {
        this.addResult({
          passed: false,
          message: `Element lacks visible focus indicator: ${this.getElementDescription(el)}`,
          element: el,
          severity: 'error',
        });
      }
    });

    this.addResult({
      passed: true,
      message: `Focus management tested for ${focusableElements.length} elements`,
      severity: 'info',
    });
  }

  /**
   * Test ARIA labels and descriptions
   */
  private testAriaLabels(container: HTMLElement): void {
    // Test buttons without accessible names
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      const accessibleName = this.getAccessibleName(button);
      if (!accessibleName) {
        this.addResult({
          passed: false,
          message: `Button lacks accessible name: ${this.getElementDescription(button)}`,
          element: button as HTMLElement,
          severity: 'error',
        });
      }
    });

    // Test form inputs without labels
    const inputs = container.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      const el = input as HTMLInputElement;
      const accessibleName = this.getAccessibleName(el);

      if (!accessibleName && el.type !== 'hidden' && el.type !== 'submit' && el.type !== 'button') {
        this.addResult({
          passed: false,
          message: `Form control lacks accessible name: ${this.getElementDescription(el)}`,
          element: el,
          severity: 'error',
        });
      }
    });

    // Test ARIA roles
    const elementsWithRoles = container.querySelectorAll('[role]');
    elementsWithRoles.forEach(element => {
      const role = element.getAttribute('role');
      const validRoles = [
        'alert',
        'alertdialog',
        'application',
        'project',
        'banner',
        'button',
        'cell',
        'checkbox',
        'columnheader',
        'combobox',
        'complementary',
        'contentinfo',
        'dialog',
        'document',
        'feed',
        'figure',
        'form',
        'grid',
        'gridcell',
        'group',
        'heading',
        'img',
        'link',
        'list',
        'listbox',
        'listitem',
        'main',
        'menu',
        'menubar',
        'menuitem',
        'navigation',
        'none',
        'option',
        'presentation',
        'progressbar',
        'radio',
        'radiogroup',
        'region',
        'row',
        'rowgroup',
        'rowheader',
        'scrollbar',
        'search',
        'searchbox',
        'separator',
        'slider',
        'spinbutton',
        'status',
        'switch',
        'tab',
        'table',
        'tablist',
        'tabpanel',
        'textbox',
        'timer',
        'toolbar',
        'tooltip',
        'tree',
        'treegrid',
        'treeitem',
      ];

      if (role && !validRoles.includes(role)) {
        this.addResult({
          passed: false,
          message: `Invalid ARIA role "${role}": ${this.getElementDescription(element as HTMLElement)}`,
          element: element as HTMLElement,
          severity: 'error',
        });
      }
    });

    this.addResult({
      passed: true,
      message: 'ARIA labels and roles tested',
      severity: 'info',
    });
  }

  /**
   * Test color contrast (simplified)
   */
  private testColorContrast(container: HTMLElement): void {
    const textElements = container.querySelectorAll(
      'p, span, div, h1, h2, h3, h4, h5, h6, a, button, label'
    );

    textElements.forEach(element => {
      const el = element as HTMLElement;
      const style = window.getComputedStyle(el);
      const color = style.color;
      const backgroundColor = style.backgroundColor;

      // Skip if no text content
      if (!el.textContent?.trim()) return;

      // Simple contrast check (this is a basic implementation)
      if (color === backgroundColor) {
        this.addResult({
          passed: false,
          message: `Text and background colors are identical: ${this.getElementDescription(el)}`,
          element: el,
          severity: 'error',
        });
      }

      // Check for transparent backgrounds that might cause contrast issues
      if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
        this.addResult({
          passed: false,
          message: `Element has transparent background, contrast may be insufficient: ${this.getElementDescription(el)}`,
          element: el,
          severity: 'warning',
        });
      }
    });

    this.addResult({
      passed: true,
      message: 'Color contrast tested (basic check)',
      severity: 'info',
    });
  }

  /**
   * Test keyboard navigation
   */
  private testKeyboardNavigation(container: HTMLElement): void {
    const interactiveElements = container.querySelectorAll(
      'a, button, input, select, textarea, [tabindex], [onclick], [onkeydown]'
    );

    interactiveElements.forEach(element => {
      const el = element as HTMLElement;

      // Check if element has keyboard event handlers
      const hasKeyboardHandler =
        el.onkeydown ||
        el.onkeyup ||
        el.onkeypress ||
        el.getAttribute('onkeydown') ||
        el.getAttribute('onkeyup') ||
        el.getAttribute('onkeypress');

      const hasClickHandler = el.onclick || el.getAttribute('onclick');

      // If element has click handler but no keyboard handler, it might not be keyboard accessible
      if (hasClickHandler && !hasKeyboardHandler && el.tagName !== 'BUTTON' && el.tagName !== 'A') {
        this.addResult({
          passed: false,
          message: `Interactive element may not be keyboard accessible: ${this.getElementDescription(el)}`,
          element: el,
          severity: 'warning',
        });
      }

      // Check tabindex values
      const tabIndex = el.tabIndex;
      if (tabIndex > 0) {
        this.addResult({
          passed: false,
          message: `Element uses positive tabindex (${tabIndex}), which can disrupt tab order: ${this.getElementDescription(el)}`,
          element: el,
          severity: 'warning',
        });
      }
    });

    this.addResult({
      passed: true,
      message: 'Keyboard navigation tested',
      severity: 'info',
    });
  }

  /**
   * Test semantic structure
   */
  private testSemanticStructure(container: HTMLElement): void {
    // Check for proper landmark usage
    const landmarks = container.querySelectorAll(
      'main, nav, aside, section, project, header, footer'
    );
    if (landmarks.length === 0) {
      this.addResult({
        passed: false,
        message: 'No semantic landmarks found (main, nav, aside, section, project, header, footer)',
        severity: 'warning',
      });
    }

    // Check for multiple main elements
    const mains = container.querySelectorAll('main');
    if (mains.length > 1) {
      this.addResult({
        passed: false,
        message: `Multiple main elements found (${mains.length}). Only one main element should be present.`,
        severity: 'error',
      });
    }

    // Check for list structure
    const listItems = container.querySelectorAll('li');
    listItems.forEach(li => {
      const parent = li.parentElement;
      if (parent && !['UL', 'OL', 'MENU'].includes(parent.tagName)) {
        this.addResult({
          passed: false,
          message: `List item not contained in proper list element: ${this.getElementDescription(li as HTMLElement)}`,
          element: li as HTMLElement,
          severity: 'error',
        });
      }
    });

    this.addResult({
      passed: true,
      message: 'Semantic structure tested',
      severity: 'info',
    });
  }

  /**
   * Test form accessibility
   */
  private testFormAccessibility(container: HTMLElement): void {
    const forms = container.querySelectorAll('form');

    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');

      inputs.forEach(input => {
        const el = input as HTMLInputElement;

        // Skip hidden inputs
        if (el.type === 'hidden') return;

        // Check for labels
        const hasLabel = this.hasLabel(el);
        if (!hasLabel) {
          this.addResult({
            passed: false,
            message: `Form control lacks proper label: ${this.getElementDescription(el)}`,
            element: el,
            severity: 'error',
          });
        }

        // Check required fields
        if (el.required && !el.getAttribute('aria-required')) {
          this.addResult({
            passed: false,
            message: `Required field should have aria-required attribute: ${this.getElementDescription(el)}`,
            element: el,
            severity: 'warning',
          });
        }

        // Check for fieldsets in radio groups
        if (el.type === 'radio') {
          const radioGroup = form.querySelectorAll(`input[name="${el.name}"]`);
          if (radioGroup.length > 1) {
            const fieldset = el.closest('fieldset');
            if (!fieldset) {
              this.addResult({
                passed: false,
                message: `Radio group should be contained in a fieldset: ${el.name}`,
                element: el,
                severity: 'warning',
              });
            }
          }
        }
      });
    });

    this.addResult({
      passed: true,
      message: 'Form accessibility tested',
      severity: 'info',
    });
  }

  /**
   * Test image accessibility
   */
  private testImageAccessibility(container: HTMLElement): void {
    const images = container.querySelectorAll('img');

    images.forEach(img => {
      const alt = img.getAttribute('alt');
      const role = img.getAttribute('role');

      // Check for alt attribute
      if (alt === null) {
        this.addResult({
          passed: false,
          message: `Image lacks alt attribute: ${this.getElementDescription(img)}`,
          element: img,
          severity: 'error',
        });
      }

      // Check for decorative images
      if (role === 'presentation' || role === 'none') {
        if (alt && alt.trim() !== '') {
          this.addResult({
            passed: false,
            message: `Decorative image should have empty alt text: ${this.getElementDescription(img)}`,
            element: img,
            severity: 'warning',
          });
        }
      }

      // Check for meaningful alt text
      if (alt && (alt.toLowerCase().includes('image') || alt.toLowerCase().includes('picture'))) {
        this.addResult({
          passed: false,
          message: `Alt text should not contain "image" or "picture": ${this.getElementDescription(img)}`,
          element: img,
          severity: 'warning',
        });
      }
    });

    this.addResult({
      passed: true,
      message: 'Image accessibility tested',
      severity: 'info',
    });
  }

  /**
   * Test heading structure
   */
  private testHeadingStructure(container: HTMLElement): void {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    let hasH1 = false;

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));

      if (level === 1) {
        hasH1 = true;
        if (index > 0) {
          this.addResult({
            passed: false,
            message: `Multiple H1 elements found. Consider using only one H1 per page.`,
            element: heading as HTMLElement,
            severity: 'warning',
          });
        }
      }

      // Check for skipped heading levels
      if (previousLevel > 0 && level > previousLevel + 1) {
        this.addResult({
          passed: false,
          message: `Heading level skipped from H${previousLevel} to H${level}: ${this.getElementDescription(heading as HTMLElement)}`,
          element: heading as HTMLElement,
          severity: 'warning',
        });
      }

      // Check for empty headings
      if (!heading.textContent?.trim()) {
        this.addResult({
          passed: false,
          message: `Empty heading element: ${this.getElementDescription(heading as HTMLElement)}`,
          element: heading as HTMLElement,
          severity: 'error',
        });
      }

      previousLevel = level;
    });

    if (headings.length > 0 && !hasH1) {
      this.addResult({
        passed: false,
        message: 'No H1 element found. Pages should have a main heading.',
        severity: 'warning',
      });
    }

    this.addResult({
      passed: true,
      message: 'Heading structure tested',
      severity: 'info',
    });
  }

  /**
   * Helper method to add test result
   */
  private addResult(result: AccessibilityTestResult): void {
    this.results.push(result);
  }

  /**
   * Generate accessibility report
   */
  private generateReport(): AccessibilityReport {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed && r.severity === 'error').length;
    const warnings = this.results.filter(r => !r.passed && r.severity === 'warning').length;

    return {
      totalTests: this.results.length,
      passed,
      failed,
      warnings,
      results: this.results,
    };
  }

  /**
   * Get accessible name for an element
   */
  private getAccessibleName(element: Element): string {
    const el = element as HTMLElement;

    // Check aria-label
    const ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel.trim();

    // Check aria-labelledby
    const ariaLabelledBy = el.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const labelElement = document.getElementById(ariaLabelledBy);
      if (labelElement) return labelElement.textContent?.trim() || '';
    }

    // Check associated label for form controls
    if (
      el instanceof HTMLInputElement ||
      el instanceof HTMLTextAreaElement ||
      el instanceof HTMLSelectElement
    ) {
      const label = document.querySelector(`label[for="${el.id}"]`);
      if (label) return label.textContent?.trim() || '';

      // Check for wrapping label
      const wrappingLabel = el.closest('label');
      if (wrappingLabel) return wrappingLabel.textContent?.trim() || '';
    }

    // Check title attribute
    const title = el.getAttribute('title');
    if (title) return title.trim();

    // Check text content for certain elements
    if (['BUTTON', 'A', 'SUMMARY'].includes(el.tagName)) {
      return el.textContent?.trim() || '';
    }

    return '';
  }

  /**
   * Check if form control has proper label
   */
  private hasLabel(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): boolean {
    // Check for aria-label
    if (element.getAttribute('aria-label')) return true;

    // Check for aria-labelledby
    if (element.getAttribute('aria-labelledby')) return true;

    // Check for associated label
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return true;
    }

    // Check for wrapping label
    const wrappingLabel = element.closest('label');
    if (wrappingLabel) return true;

    // Check for title (not ideal but acceptable)
    if (element.getAttribute('title')) return true;

    return false;
  }

  /**
   * Get element description for reporting
   */
  private getElementDescription(element: HTMLElement): string {
    let description = element.tagName.toLowerCase();

    if (element.id) {
      description += `#${element.id}`;
    }

    if (element.className) {
      description += `.${element.className.split(' ').join('.')}`;
    }

    const text = element.textContent?.trim().substring(0, 30);
    if (text) {
      description += ` "${text}${text.length > 30 ? '...' : ''}"`;
    }

    return description;
  }
}

/**
 * Quick accessibility audit function
 */
export function auditAccessibility(container?: HTMLElement): AccessibilityReport {
  const tester = new AccessibilityTester();
  return tester.runAllTests(container);
}

/**
 * Log accessibility report to console
 */
export function logAccessibilityReport(report: AccessibilityReport): void {
  console.group('🔍 Accessibility Audit Report');
  console.log(`Total Tests: ${report.totalTests}`);
  console.log(`✅ Passed: ${report.passed}`);
  console.log(`❌ Failed: ${report.failed}`);
  console.log(`⚠️ Warnings: ${report.warnings}`);

  if (report.results.length > 0) {
    console.group('📋 Detailed Results');

    report.results.forEach(result => {
      const icon = result.passed ? '✅' : result.severity === 'error' ? '❌' : '⚠️';

      if (result.element) {
        console.log(`${icon} ${result.message}`, result.element);
      } else {
        console.log(`${icon} ${result.message}`);
      }
    });

    console.groupEnd();
  }

  console.groupEnd();
}

/**
 * Development helper to run accessibility tests
 */
export function runAccessibilityTests(): void {
  if (process.env.NODE_ENV === 'development') {
    const report = auditAccessibility();
    logAccessibilityReport(report);
  }
}
