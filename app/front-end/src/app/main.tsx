// src/app/main.tsx
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from './providers/providers';
import { NORMALIZED_BASE } from '@/config/basePath';
const App = React.lazy(() => import('./App').then(m => ({ default: m.App })));

// Asegurarse de que el elemento root existe

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

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
if (typeof window !== 'undefined' && import.meta.env.VITE_PREVIEW === 'true') {
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
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Suspense fallback={<div aria-hidden="true" id="app-loading" />}>
        <App />
      </Suspense>
    </React.StrictMode>
  );
}

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
