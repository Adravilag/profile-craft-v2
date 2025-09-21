import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop
 * Lista los cambios en la ubicación y fuerza el scroll del window al top.
 * Respeta cuando la navegación fue con hash (navegación a ancla) y evita interferir.
 */
export default function ScrollToTop(): null {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Si hay hash, dejar que el navegador lo gestione (scroll a ancla) — opcional
    if (hash && hash.length > 0) return;

    // Esperamos al próximo frame para asegurar que el nuevo contenido se haya renderizado
    const raf = window.requestAnimationFrame(() => {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      } catch {
        window.scrollTo(0, 0);
      }
    });

    return () => window.cancelAnimationFrame(raf);
  }, [pathname, hash]);

  return null;
}
