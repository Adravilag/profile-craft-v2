import React, { useRef } from 'react';
import { useBackendStatus } from '../../hooks/useBackendStatus';
import BackendLoadingScreen from './BackendLoadingPage';

/**
 * Este layout envuelve children y muestra un loading de backend si está inactivo.
 * Úsalo en _app.tsx, App.tsx o layouts globales.
 */

// Bandera local para saber si el backend ya estuvo online alguna vez
export const BackendStatusGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOnline, isChecking } = useBackendStatus();
  const wasOnline = useRef(false);

  // Si alguna vez estuvo online, nunca más bloquea la app
  if (isOnline) {
    wasOnline.current = true;
    return <>{children}</>;
  }

  // Si nunca estuvo online, muestra loading
  if (!wasOnline.current || isChecking) {
    return <BackendLoadingScreen />;
  }

  // Si ya estuvo online, aunque el backend caiga, deja pasar la app
  return <>{children}</>;
};

export default BackendStatusGate;
