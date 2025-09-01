import { useCallback, useRef, useEffect } from 'react';

// Hook para debounce - retrasa la ejecución hasta que no haya actividad
export const useDebounce = <T extends (...args: any[]) => any>(callback: T, delay: number): T => {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  return debouncedCallback;
};

// Hook para throttle - limita la frecuencia de ejecución
export const useThrottle = <T extends (...args: any[]) => any>(callback: T, delay: number): T => {
  const lastRun = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(
          () => {
            callback(...args);
            lastRun.current = Date.now();
          },
          delay - (Date.now() - lastRun.current)
        );
      }
    },
    [callback, delay]
  ) as T;

  return throttledCallback;
};

// Hook para RAF (requestAnimationFrame) - optimiza animaciones
export const useRAF = <T extends (...args: any[]) => any>(callback: T): T => {
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const rafCallback = useCallback(
    (...args: Parameters<T>) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        callback(...args);
      });
    },
    [callback]
  ) as T;

  return rafCallback;
};

// Hook combinado para casos complejos
interface OptimizationOptions {
  type: 'debounce' | 'throttle' | 'raf';
  delay?: number;
}

export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  options: OptimizationOptions = { type: 'raf' }
): T => {
  const timeoutRef = useRef<number | null>(null);
  const lastCallRef = useRef<number>(0);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();

    if (options.type === 'debounce') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        callback(...args);
      }, options.delay || 300);
    } else if (options.type === 'throttle') {
      if (now - lastCallRef.current >= (options.delay || 100)) {
        lastCallRef.current = now;
        callback(...args);
      }
    } else if (options.type === 'raf') {
      if (timeoutRef.current) {
        cancelAnimationFrame(timeoutRef.current);
      }
      timeoutRef.current = requestAnimationFrame(() => {
        callback(...args);
      });
    }
  }, deps) as T;
};
