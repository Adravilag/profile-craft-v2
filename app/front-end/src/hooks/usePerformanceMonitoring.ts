import { useEffect, useCallback, useState } from 'react';
import { debugLog } from '../utils/debugConfig';
import { useAuth } from '@/contexts';

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
}

export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const { user, isAuthenticated } = useAuth();

  // Verificar si el usuario es administrador
  const isAdmin = isAuthenticated && user?.role === 'admin';

  // Función para enviar métricas (placeholder para analytics)
  const sendMetric = useCallback(
    (name: string, value: number, delta?: number) => {
      // Solo mostrar logs de debug si el usuario es administrador
      if (process.env.NODE_ENV === 'development' && isAdmin) {
        debugLog.performance(`Performance Metric - ${name}:`, {
          value: Math.round(value),
          delta: delta ? Math.round(delta) : undefined,
          rating: getMetricRating(name, value),
        });
      }

      // Actualizar el estado de métricas
      setMetrics(prev => ({
        ...prev,
        [name.toLowerCase()]: value,
      }));

      // Aquí se integraría con un servicio de analytics como Google Analytics
      // gtag('event', name, {
      //   value: Math.round(value),
      //   custom_parameter_1: delta ? Math.round(delta) : undefined,
      // });
    },
    [isAdmin]
  );

  // Función para evaluar si una métrica es buena, necesita mejora o es mala
  const getMetricRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const thresholds: Record<string, [number, number]> = {
      LCP: [2500, 4000],
      FID: [100, 300],
      CLS: [0.1, 0.25],
      FCP: [1800, 3000],
      TTFB: [800, 1800],
    };

    const [good, poor] = thresholds[name] || [0, 0];
    if (value <= good) return 'good';
    if (value <= poor) return 'needs-improvement';
    return 'poor';
  };

  // Obtener Web Vitals usando PerformanceObserver
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // LCP (Largest Contentful Paint)
    const observeLCP = () => {
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver(list => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as any;
            if (lastEntry) {
              sendMetric('LCP', lastEntry.startTime);
            }
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
          return observer;
        } catch (e) {
          if (isAdmin) {
            debugLog.warn('LCP observer not supported');
          }
        }
      }
    };

    // FID (First Input Delay)
    const observeFID = () => {
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver(list => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (entry.processingStart && entry.startTime) {
                const fid = entry.processingStart - entry.startTime;
                sendMetric('FID', fid);
              }
            });
          });
          observer.observe({ entryTypes: ['first-input'] });
          return observer;
        } catch (e) {
          if (isAdmin) {
            debugLog.warn('FID observer not supported');
          }
        }
      }
    };

    // CLS (Cumulative Layout Shift)
    const observeCLS = () => {
      if ('PerformanceObserver' in window) {
        try {
          let clsValue = 0;
          const observer = new PerformanceObserver(list => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
                setMetrics(prev => ({ ...prev, cls: clsValue }));
              }
            });
          });
          observer.observe({ entryTypes: ['layout-shift'] });

          // Enviar CLS cuando la página se descarga
          const sendCLS = () => sendMetric('CLS', clsValue);
          window.addEventListener('beforeunload', sendCLS);

          return observer;
        } catch (e) {
          if (isAdmin) {
            debugLog.warn('CLS observer not supported');
          }
        }
      }
    };

    // FCP (First Contentful Paint)
    const observeFCP = () => {
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver(list => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (entry.name === 'first-contentful-paint') {
                sendMetric('FCP', entry.startTime);
              }
            });
          });
          observer.observe({ entryTypes: ['paint'] });
          return observer;
        } catch (e) {
          if (isAdmin) {
            debugLog.warn('FCP observer not supported');
          }
        }
      }
    };

    // TTFB (Time to First Byte)
    const observeTTFB = () => {
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver(list => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (entry.responseStart && entry.requestStart) {
                const ttfb = entry.responseStart - entry.requestStart;
                sendMetric('TTFB', ttfb);
              }
            });
          });
          observer.observe({ entryTypes: ['navigation'] });
          return observer;
        } catch (e) {
          if (isAdmin) {
            debugLog.warn('TTFB observer not supported');
          }
        }
      }
    };

    const observers = [
      observeLCP(),
      observeFID(),
      observeCLS(),
      observeFCP(),
      observeTTFB(),
    ].filter(Boolean);

    return () => {
      observers.forEach(observer => observer?.disconnect());
    };
  }, [sendMetric]);

  // Función para obtener métricas de navegación
  const getNavigationMetrics = useCallback(() => {
    if (typeof window === 'undefined' || !window.performance) return null;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return null;

    const startTime = navigation.startTime || 0;

    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - startTime,
      loadComplete: navigation.loadEventEnd - startTime,
      domInteractive: navigation.domInteractive - startTime,
      ttfb: navigation.responseStart - navigation.requestStart,
      dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcpConnect: navigation.connectEnd - navigation.connectStart,
      serverResponse: navigation.responseEnd - navigation.responseStart,
      domProcessing: navigation.domComplete - navigation.domInteractive,
      resourcesLoad: navigation.loadEventEnd - navigation.domContentLoadedEventEnd,
      redirectTime: navigation.redirectEnd - navigation.redirectStart,
      requestTime: navigation.responseStart - navigation.requestStart,
      downloadTime: navigation.responseEnd - navigation.responseStart,
    };
  }, []);

  // Función adicional para obtener información de recursos
  const getResourceMetrics = useCallback(() => {
    if (typeof window === 'undefined' || !window.performance) return null;

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    return resources.map(resource => ({
      name: resource.name,
      duration: resource.duration,
      size: resource.transferSize || 0,
      type: resource.initiatorType,
      startTime: resource.startTime,
    }));
  }, []);

  // Función para obtener información de memoria (si está disponible)
  const getMemoryInfo = useCallback(() => {
    if (typeof window === 'undefined') return null;

    // @ts-ignore - performance.memory es una extensión de Chrome
    const memory = (performance as any).memory;

    if (memory) {
      return {
        usedJSMemorySize: memory.usedJSMemorySize,
        totalJSMemorySize: memory.totalJSMemorySize,
        jsMemoryLimit: memory.jsMemoryLimit,
      };
    }

    return null;
  }, []);

  return {
    metrics,
    getNavigationMetrics,
    getResourceMetrics,
    getMemoryInfo,
    sendMetric,
  };
};
