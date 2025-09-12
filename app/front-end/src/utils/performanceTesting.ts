/**
 * Performance testing utilities for the ProjectEditor component
 */

export interface PerformanceMetrics {
  renderTime: number;
  conversionTime: number;
  memoryUsage?: number;
  componentCount: number;
}

export interface PerformanceTestResult {
  testName: string;
  metrics: PerformanceMetrics;
  passed: boolean;
  threshold: number;
  actualValue: number;
}

/**
 * Measure component render time
 */
export function measureRenderTime(renderFn: () => void): number {
  const startTime = performance.now();
  renderFn();
  const endTime = performance.now();
  return endTime - startTime;
}

/**
 * Measure content conversion time
 */
export function measureConversionTime(
  conversionFn: (content: string) => string,
  content: string
): number {
  const startTime = performance.now();
  conversionFn(content);
  const endTime = performance.now();
  return endTime - startTime;
}

/**
 * Get memory usage (if available)
 */
export function getMemoryUsage(): number | undefined {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return memory.usedJSHeapSize;
  }
  return undefined;
}

/**
 * Count React components in the DOM
 */
export function countComponents(container: Element): number {
  const reactElements = container.querySelectorAll('[data-reactroot], [data-react-component]');
  return reactElements.length;
}

/**
 * Performance test thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
  RENDER_TIME: 30, // 30ms for initial render (more realistic for testing environments)
  CONVERSION_TIME: 50, // 50ms for content conversion
  MEMORY_USAGE: 50 * 1024 * 1024, // 50MB
  COMPONENT_COUNT: 100, // Maximum component count
} as const;

/**
 * Run performance tests
 */
export function runPerformanceTests(
  renderFn: () => void,
  conversionFn: (content: string) => string,
  testContent: string,
  container: Element
): PerformanceTestResult[] {
  const results: PerformanceTestResult[] = [];

  // Test render time
  const renderTime = measureRenderTime(renderFn);
  results.push({
    testName: 'Render Time',
    metrics: {
      renderTime,
      conversionTime: 0,
      componentCount: 0,
    },
    passed: renderTime <= PERFORMANCE_THRESHOLDS.RENDER_TIME,
    threshold: PERFORMANCE_THRESHOLDS.RENDER_TIME,
    actualValue: renderTime,
  });

  // Test conversion time
  const conversionTime = measureConversionTime(conversionFn, testContent);
  results.push({
    testName: 'Conversion Time',
    metrics: {
      renderTime: 0,
      conversionTime,
      componentCount: 0,
    },
    passed: conversionTime <= PERFORMANCE_THRESHOLDS.CONVERSION_TIME,
    threshold: PERFORMANCE_THRESHOLDS.CONVERSION_TIME,
    actualValue: conversionTime,
  });

  // Test memory usage
  const memoryUsage = getMemoryUsage();
  if (memoryUsage !== undefined) {
    results.push({
      testName: 'Memory Usage',
      metrics: {
        renderTime: 0,
        conversionTime: 0,
        memoryUsage,
        componentCount: 0,
      },
      passed: memoryUsage <= PERFORMANCE_THRESHOLDS.MEMORY_USAGE,
      threshold: PERFORMANCE_THRESHOLDS.MEMORY_USAGE,
      actualValue: memoryUsage,
    });
  }

  // Test component count
  const componentCount = countComponents(container);
  results.push({
    testName: 'Component Count',
    metrics: {
      renderTime: 0,
      conversionTime: 0,
      componentCount,
    },
    passed: componentCount <= PERFORMANCE_THRESHOLDS.COMPONENT_COUNT,
    threshold: PERFORMANCE_THRESHOLDS.COMPONENT_COUNT,
    actualValue: componentCount,
  });

  return results;
}

/**
 * Generate performance report
 */
export function generatePerformanceReport(results: PerformanceTestResult[]): string {
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;

  let report = `Performance Test Results: ${passedTests}/${totalTests} tests passed\n\n`;

  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const unit = getUnit(result.testName);
    report += `${status} ${result.testName}: ${result.actualValue.toFixed(2)}${unit} (threshold: ${result.threshold}${unit})\n`;
  });

  return report;
}

/**
 * Get appropriate unit for metric
 */
function getUnit(testName: string): string {
  switch (testName) {
    case 'Render Time':
    case 'Conversion Time':
      return 'ms';
    case 'Memory Usage':
      return 'MB';
    case 'Component Count':
      return '';
    default:
      return '';
  }
}

/**
 * Debounce utility for performance testing
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle utility for performance testing
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
