import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { debugLog } from '@/utils/debugConfig';
import { scrollToElement } from '@/utils/scrollToElement';

interface UseInitialScrollToSectionProps {
  navItems: Array<{ id: string }>;
  navigateToSection: (id: string, options?: any, shouldScroll?: boolean) => void;
  setIsInitialLoading: (isLoading: boolean) => void;
}

/**
 * Hook para manejar la navegación inicial a una sección del portafolio basada en la URL.
 * Muestra una pantalla de carga mientras espera que el DOM, recursos y scroll se estabilicen.
 */
export const useInitialScrollToSection = ({
  navItems,
  navigateToSection,
  setIsInitialLoading,
}: UseInitialScrollToSectionProps) => {
  const isInitialLoadingRef = useRef(false);
  const location = useLocation();
  const handledPathRef = useRef<string | null>(null);

  useEffect(() => {
    isInitialLoadingRef.current = true;
    const pathParts = (location.pathname || '').split('/').filter(Boolean);
    const validSections = new Set(navItems.map(n => n.id));

    let sectionFromPath: string | null = null;
    // Ruta vacía o raíz -> home
    if (pathParts.length === 0) {
      sectionFromPath = 'home';
    } else {
      // Si la ruta comienza con el basename 'profile-craft', saltarlo
      const parts = pathParts[0] === 'profile-craft' ? pathParts.slice(1) : pathParts;
      // Si después del basename no quedan partes -> home
      if (parts.length === 0) {
        sectionFromPath = 'home';
      } else {
        // Priorizar la primera parte como sección si coincide con navItems
        if (validSections.has(parts[0])) {
          sectionFromPath = decodeURIComponent(parts[0]);
        } else {
          // Si la última parte coincide (ej. /foo/about)
          const last = parts[parts.length - 1];
          if (validSections.has(last)) {
            sectionFromPath = decodeURIComponent(last);
          }
        }
      }
    }

    // Si la ruta no corresponde a una sección válida o ya la procesamos, no hacemos nada
    // También evitamos la navegación automática cuando la URL apunta a una vista de artículo/proyecto
    if (
      !sectionFromPath ||
      location.pathname.startsWith('/project/') ||
      location.pathname.startsWith('/project/') ||
      location.pathname.startsWith('/projects/')
    ) {
      isInitialLoadingRef.current = false;
      setIsInitialLoading(false);
      return;
    }

    // Evitar re-ejecutar si ya procesamos esta misma sección (rompe bucles por cambios de estado)
    if (handledPathRef.current === sectionFromPath) {
      debugLog.navigation('useInitialScrollToSection already handled', { sectionFromPath });
      return;
    }

    debugLog.navigation('useInitialScrollToSection resolved sectionFromPath', { sectionFromPath });

    // Helper: espera a que un elemento exista en el DOM
    const waitForElement = (selectorFn: () => HTMLElement | null, timeout = 5000) =>
      new Promise<HTMLElement | null>(resolve => {
        const start = Date.now();
        const check = () => {
          const el = selectorFn();
          if (el) {
            resolve(el);
          } else if (Date.now() - start >= timeout) {
            resolve(null);
          } else {
            requestAnimationFrame(check);
          }
        };
        check();
      });

    // Helper: espera a que los recursos importantes (imágenes) se carguen
    const waitForResources = (timeout = 5000) =>
      new Promise<void>(resolve => {
        let finished = false;
        const finish = () => {
          if (finished) return;
          finished = true;
          resolve();
        };
        const onLoadOrComplete = () => {
          const imgs = Array.from(document.images || []);
          if (imgs.length === 0) return finish();

          let pending = imgs.length;
          imgs.forEach(img => {
            if ((img as HTMLImageElement).complete) {
              pending -= 1;
            } else {
              const onEnd = () => {
                try {
                  img.removeEventListener('load', onEnd);
                  img.removeEventListener('error', onEnd);
                } catch (e) {}
                pending -= 1;
                if (pending <= 0) finish();
              };
              img.addEventListener('load', onEnd, { once: true });
              img.addEventListener('error', onEnd, { once: true });
            }
          });
          if (pending <= 0) finish();
        };

        if (document.readyState === 'complete') {
          onLoadOrComplete();
        } else {
          window.addEventListener('load', onLoadOrComplete, { once: true });
        }
        setTimeout(finish, timeout);
      });

    // Helper: espera a que la altura del scroll se estabilice
    const waitForScrollStability = (stableFor = 300, maxWait = 3000) =>
      new Promise<boolean>(resolve => {
        const start = Date.now();
        let lastHeight = document.documentElement.scrollHeight;
        let lastChange = Date.now();
        const interval = window.setInterval(() => {
          const h = document.documentElement.scrollHeight;
          if (h !== lastHeight) {
            lastHeight = h;
            lastChange = Date.now();
          }
          if (Date.now() - lastChange >= stableFor || Date.now() - start >= maxWait) {
            clearInterval(interval);
            resolve(Date.now() - lastChange >= stableFor);
          }
        }, 120);
      });

    // Helper: realiza el scroll a la sección usando el util compartido
    const scrollToSection = async (el: HTMLElement) => {
      try {
        // Leer navHeight para pasarlo como offset. Hacemos la lectura de layout
        // dentro de requestAnimationFrame para evitar forzar reflows durante el render.
        await new Promise<void>(resolve => {
          requestAnimationFrame(() => {
            try {
              const navHeightVar = getComputedStyle(document.documentElement).getPropertyValue(
                '--header-nav-height'
              );
              const navHeightFromVar = Number((navHeightVar || '').replace('px', '')) || 0;
              const headerEl = document.querySelector('.header-curriculum') as HTMLElement | null;
              const headerHeight = headerEl
                ? Math.round(headerEl.getBoundingClientRect().height)
                : 0;
              const navHeight = Math.max(0, Math.max(navHeightFromVar, headerHeight));
              // For initial navigation we force an instant jump
              // Wrap the call with Promise.resolve to be resilient against
              // mocks or implementations that might return a non-thenable value.
              Promise.resolve(scrollToElement(el, { offset: navHeight + 8, instant: true })).then(
                () => resolve()
              );
            } catch (e) {
              // Fallback inmediato
              Promise.resolve(scrollToElement(el, { offset: 8, instant: true })).then(() =>
                resolve()
              );
            }
          });
        });
      } catch (err) {
        debugLog.error('Error scrolling to section:', err);
      }
    };

    (async () => {
      // marcar como procesada para evitar ejecuciones repetidas
      handledPathRef.current = sectionFromPath;
      const start = Date.now();
      setIsInitialLoading(true);

      try {
        // Navegar para que la URL se actualice en la barra de direcciones
        navigateToSection(sectionFromPath, undefined, true);
      } catch (e) {
        debugLog.error('navigateToSection threw:', e);
      }

      // Buscar el elemento inmediatamente sin esperar
      const immediateElement =
        document.getElementById(sectionFromPath!) ||
        (document.querySelector(`[data-section="${sectionFromPath}"]`) as HTMLElement | null);

      if (immediateElement) {
        // Si el elemento ya existe, hacer scroll inmediatamente
        debugLog.navigation('useInitialScrollToSection: Element found immediately, scrolling now');
        try {
          await scrollToSection(immediateElement);
        } catch (err) {
          debugLog.error('Error in immediate scroll:', err);
        }

        // Finalizar la carga rápidamente para navegación inmediata
        const MIN_LOADING = 100; // Reducido para navegación inmediata
        const postElapsed = Date.now() - start;
        const remaining = Math.max(0, MIN_LOADING - postElapsed);

        setTimeout(() => {
          setIsInitialLoading(false);
          isInitialLoadingRef.current = false;
        }, remaining);
        return;
      }

      // Si el elemento no existe inmediatamente, usar el comportamiento anterior
      debugLog.navigation('useInitialScrollToSection: Element not found immediately, waiting...');

      const el = await waitForElement(
        () =>
          document.getElementById(sectionFromPath!) ||
          (document.querySelector(`[data-section="${sectionFromPath}"]`) as HTMLElement | null)
      );

      // Solo esperar recursos si no pudimos hacer scroll inmediatamente
      await Promise.all([waitForResources(), waitForScrollStability()]);

      if (el) {
        // For initial load we want the jump to be immediate (no animation)
        requestAnimationFrame(() => scrollToSection(el));
      }

      const MIN_LOADING = 250;
      const postElapsed = Date.now() - start;
      const remaining = Math.max(0, MIN_LOADING - postElapsed);

      setTimeout(() => {
        setIsInitialLoading(false);
        isInitialLoadingRef.current = false;
      }, remaining);
    })();
  }, [location.pathname, navItems, navigateToSection, setIsInitialLoading]);
};
