// src/app/main.tsx
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

// Utilidades de configuración
import { setupMomentLocalePatch } from './setup/momentLocalePatch';
import { setupBaseUrlRedirect } from './setup/baseUrlRedirect';
import { setupRevealObserver } from './setup/revealObserver';
import { setupMsw } from './setup/msw';
import { ensureImageMap } from '@/utils/imageLookup';

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

  try {
    await setupMsw();
  } catch (error) {
    console.error('❌ Error al iniciar MSW:', error);
  }

  renderApp();
};

void main();
