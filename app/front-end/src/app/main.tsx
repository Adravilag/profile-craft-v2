// src/app/main.tsx
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

// Utilidades de configuración
import { setupMomentLocalePatch } from './setup/momentLocalePatch';
import { setupBaseUrlRedirect } from './setup/baseUrlRedirect';
import { setupRevealObserver } from './setup/revealObserver';
import { ensureImageMap } from '@/utils/imageLookup';
// Preload skill settings to improve UX on components that need suggestions/icons
// Use dynamic import to avoid increasing the initial bundle size

// Punto de entrada
const root = document.getElementById('root');
if (!root) throw new Error('No se encontró el elemento raíz (#root).');

const renderApp = () => {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Suspense fallback={<div id="app-loading" aria-hidden="true" />}>
        <App />
      </Suspense>
    </React.StrictMode>
  );
};

const main = async () => {
  setupMomentLocalePatch();
  setupBaseUrlRedirect();
  setupRevealObserver();

  try {
    await ensureImageMap();
  } catch (error) {
    console.warn('No se pudo cargar el mapa de imágenes:', error);
  }

  // Preload skill settings in background (non-blocking)
  void (async () => {
    try {
      const mod = await import(
        /* webpackChunkName: "skill-settings-loader" */ '@/features/skills/utils/skillSettingsLoader'
      );
      const anyMod = mod as any;
      const fn = anyMod.preloadSkillSettings || anyMod.preload || anyMod.default || anyMod;
      if (typeof fn === 'function') await fn();
    } catch (e) {
      /* noop */
    }
  })();

  renderApp();
};

void main();
