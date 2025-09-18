export const setupBaseUrlRedirect = (): void => {
  // No ejecutar en SSR / entornos sin `window`
  if (typeof window === 'undefined' || typeof window.location === 'undefined') return;

  try {
    const { pathname, search, hash } = window.location;

    // Redirige cualquier ruta que termine en `index.html` (p. ej. `/index.html` o `/foo/index.html`)
    if (pathname.endsWith('index.html')) {
      // Construye la nueva URL respetando query y hash
      const base = pathname.replace(/index\.html$/, '') || '/';
      const newUrl = `${base}${search || ''}${hash || ''}`;

      const currentFull = `${pathname}${search || ''}${hash || ''}`;
      if (newUrl !== currentFull) {
        // Usar replace para no añadir entrada al history
        window.location.replace(newUrl);
      }
    }
  } catch (err) {
    // Sólo log en dev para evitar ruido en producción
    if (
      (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') ||
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV)
    ) {
      // eslint-disable-next-line no-console
      console.warn('[setupBaseUrlRedirect] redirect failed', err);
    }
  }
};
