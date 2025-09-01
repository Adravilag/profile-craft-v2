// utils/webVitals.ts
import type { Metric } from 'web-vitals';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

function sendToAnalytics(metric: Metric) {
  const { name, value, id } = metric;
  window.gtag?.('event', name, {
    value: Math.round(name === 'CLS' ? value * 1000 : value),
    event_label: id,
    non_interaction: true,
  });
  console.log(`${name}: ${value} (${id})`);
}

export function initWebVitals(callback: (metric: Metric) => void = sendToAnalytics) {
  import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
    onCLS(callback);
    onFCP(callback);
    onLCP(callback);
    onTTFB(callback);
    onINP?.(callback); // INP (sustituye a FID)
  });
}
