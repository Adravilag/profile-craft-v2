// src/app/main.tsx
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from './providers/providers';
import { ensureImageMap } from '@/utils/imageLookup';
import { NORMALIZED_BASE } from '@/config/basePath';
const App = React.lazy(() => import('./App').then(m => ({ default: m.App })));

// Asegurarse de que el elemento root existe

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

// Runtime shim: mitigar advertencia de deprecación de moment.defineLocale
// Algunas dependencias aún llaman a moment.defineLocale para actualizar locales existentes,
// lo que provoca warnings. Aquí parcheamos la API para que llame a updateLocale cuando el
// locale ya existe y preserve el comportamiento original para definiciones nuevas.
try {
  let momentPatched = false;
  const patchMoment = (momentLib: any) => {
    if (!momentLib || momentPatched) return;
    try {
      const originalDefine = momentLib.defineLocale;
      momentLib.defineLocale = function (localeName: string, config: any) {
        try {
          if (momentLib.locales && typeof momentLib.locales === 'function') {
            // Si el locale ya existe, usar updateLocale para evitar warning
            const existing = momentLib.locales().includes(localeName);
            if (existing && typeof momentLib.updateLocale === 'function') {
              return momentLib.updateLocale(localeName, config);
            }
          }
        } catch (e) {
          // swallow and fallback to original
        }
        // Fallback a comportamiento original
        return originalDefine.call(momentLib, localeName, config);
      };
      // mark as patched to avoid double wrapping
      momentPatched = true;
      if (import.meta.env.DEV && typeof console !== 'undefined') {
        console.info('[shim] moment.defineLocale patched to prefer updateLocale when appropriate');
      }
    } catch (err) {
      // no-op
    }
  };

  // Si moment ya está en window
  if (typeof (window as any).moment !== 'undefined') {
    patchMoment((window as any).moment);
  } else {
    // Intentar import dinámico silencioso; si no existe, no hacer nada
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const maybeMoment = require && typeof require === 'function' ? require('moment') : null;
      if (maybeMoment) patchMoment(maybeMoment);
    } catch (e) {
      // ignore - moment may not be bundled as commonjs or present at runtime
    }
  }
} catch (e) {
  // ignore any shim errors
}

// Debug: verificar variables de entorno// Small reveal helper (client-only)
if (typeof window !== 'undefined') {
  try {
    // Si la aplicación está configurada para montarse bajo un basename
    // (p.ej. '/') y la URL actual no lo contiene, hacer
    // un replaceState para anteponer el basename. Esto evita que
    // <Router basename="/"> no pueda emparejar la ruta
    // cuando el dev server se abre en '/'.
    const base = NORMALIZED_BASE || '/';
    const pathname = window.location.pathname || '/';
    if (base && base !== '/' && !pathname.startsWith(base)) {
      const trimmed = pathname.replace(/^\//, '');
      const newPath = base + (trimmed ? '/' + trimmed : '');
      const searchHash = (window.location.search || '') + (window.location.hash || '');
      window.history.replaceState({}, '', newPath + searchHash);
    }
  } catch (err) {
    // silent
  }
  try {
    if (!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      const addRevealObserver = () => {
        try {
          const io = new IntersectionObserver(
            (entries, observer) => {
              entries.forEach(e => {
                if (e.isIntersecting) {
                  (e.target as HTMLElement).classList.add('is-in');
                  observer.unobserve(e.target);
                }
              });
            },
            { rootMargin: '-12% 0px -12% 0px', threshold: 0.08 }
          );
          document.querySelectorAll('.reveal').forEach(el => io.observe(el));
        } catch (err) {
          // guard against older browsers
        }
      };

      const schedule = (cb: () => void) => {
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(cb, { timeout: 500 });
        } else if ((window as any).requestAnimationFrame) {
          (window as any).requestAnimationFrame(() => setTimeout(cb, 50));
        } else {
          setTimeout(cb, 200);
        }
      };

      schedule(addRevealObserver);
    }
  } catch (e) {
    // silent
  }
}
// Si estamos en modo preview (definido por VITE_PREVIEW), arrancar MSW antes de montar la app
// Asegurarnos de poblar el image map antes de montar para evitar flashes en UI
const mountApp = async () => {
  try {
    await ensureImageMap();
  } catch (e) {
    // no bloquear el arranque si falla la carga de imágenes
    // console.warn('ensureImageMap failed', e);
  }

  if (typeof window !== 'undefined' && import.meta.env.VITE_PREVIEW === 'true') {
    // Evitar arrancar MSW en Microsoft Edge porque en algunos entornos
    // la comunicación del service worker añade latencia perceptible.
    // Detectamos Edge de forma conservadora por userAgent.
    const isEdge = (() => {
      try {
        const ua = navigator.userAgent || '';
        // 'Edg' es el token moderno para Chromium-based Edge, 'Edge' para legacy
        return ua.includes('Edg') || ua.includes('Edge');
      } catch (e) {
        return false;
      }
    })();

    if (isEdge) {
      // No arrancar worker en Edge: montar app inmediatamente
      if (import.meta.env.DEV && typeof console !== 'undefined') {
        console.info('[MSW] Worker skipped on Edge to avoid potential performance issues');
      }
      ReactDOM.createRoot(root).render(
        <React.StrictMode>
          <Suspense fallback={<div aria-hidden="true" id="app-loading" />}>
            <App />
          </Suspense>
        </React.StrictMode>
      );
    } else {
      // arrancar worker en modo cliente
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      import('../mocks/browser')
        .then(({ worker }) => {
          return worker.start({
            onUnhandledRequest: 'warn',
          });
        })
        .then(() => {})
        .catch(error => {
          console.error('❌ [MSW] Error iniciando worker:', error);
          // si falla, seguimos montando la app sin mocks
        })
        .finally(() => {
          ReactDOM.createRoot(root).render(
            <React.StrictMode>
              <Suspense fallback={<div aria-hidden="true" id="app-loading" />}>
                <App />
              </Suspense>
            </React.StrictMode>
          );
        });
    }
  } else {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <Suspense fallback={<div aria-hidden="true" id="app-loading" />}>
          <App />
        </Suspense>
      </React.StrictMode>
    );
  }
};

// Kick off mounting sequence
void mountApp();

// Web Vitals: sólo en navegador y en producción
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  const bootWebVitals = () => {
    import('@/utils/webVitals').then(({ initWebVitals }) => initWebVitals());
  };

  if (typeof (window as any).requestIdleCallback === 'function') {
    (window as any).requestIdleCallback(bootWebVitals);
  } else {
    setTimeout(bootWebVitals, 0);
  }
}
