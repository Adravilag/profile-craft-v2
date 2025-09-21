export type SetupMswOptions = {
  mockPath?: string; // ruta del módulo que exporta `worker`
  onStart?: () => void;
};

export const setupMsw = async (opts: SetupMswOptions = {}): Promise<void> => {
  // No ejecutar en SSR
  if (typeof window === 'undefined') return;

  const isDev =
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV);
  if (!isDev) return;

  // Allow opt-out of MSW via env var (useful in preview or when real APIs are required)
  const disableMswFromEnv =
    (typeof process !== 'undefined' && String(process.env?.DISABLE_MSW).toLowerCase() === 'true') ||
    (typeof import.meta !== 'undefined' &&
      String((import.meta as any).env?.VITE_DISABLE_MSW).toLowerCase() === 'true');

  if (disableMswFromEnv) {
    // eslint-disable-next-line no-console
    console.info('[setupMsw] MSW disabled via environment variable');
    return;
  }

  try {
    // Evitar dependencias de alias en import dinámico (fallan en runtime si no están resueltas)
    // Usar una ruta relativa desde este archivo hacia `src/mocks/browser` por defecto.
    // allow override via opts.mockPath when needed (e.g., tests)
    const defaultMockPath = opts.mockPath || '../../mocks/browser';
    const mod = await import(defaultMockPath);
    const worker = mod?.worker;
    if (worker && typeof worker.start === 'function') {
      await worker.start();
      opts.onStart?.();
    }
  } catch (err) {
    // Loggear sólo en desarrollo para no romper producción
    // eslint-disable-next-line no-console
    console.warn('[setupMsw] could not start MSW', err);
  }
};
