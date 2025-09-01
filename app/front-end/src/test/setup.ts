// Setup para pruebas unitarias (Vitest)
import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';

// Mock window.scrollTo para JSDOM
Object.defineProperty(window, 'scrollTo', {
  value: () => {},
  writable: true,
});

// Opcional: polyfills o mocks globales
// globalThis.fetch = globalThis.fetch ?? (() => Promise.resolve({ json: () => ({}) }));

export {};

// Limpieza global: eliminar contenedores residuales creados por portales (modals/spinners)
if (typeof beforeEach === 'function') {
  beforeEach(() => {
    try {
      // eliminar modals residuales
      const modals = Array.from(document.querySelectorAll('[data-testimonial-modal]'));
      modals.forEach(n => n.remove());

      // eliminar loading overlay containers
      const loaders = Array.from(
        document.querySelectorAll('[data-testid="loading-overlay-container"]')
      );
      loaders.forEach(n => n.remove());

      // asegurar que no hay style de bloqueo de scroll en body
      if (document.body.style.position === 'fixed') {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.style.overflow = '';
      }
    } catch (e) {
      // noop
    }
  });
}
