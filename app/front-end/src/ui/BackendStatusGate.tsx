import React from 'react';
import { useBackendStatus } from '../hooks/useBackendStatus';
import BackendLoadingScreen from '../pages/BackendLoadingPage/BackendLoadingPage';

/**
 * Este layout envuelve children y muestra un loading de backend si está inactivo.
 * Úsalo en _app.tsx, App.tsx o layouts globales.
 */
export const BackendStatusGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOnline, isChecking, retryCount, error } = useBackendStatus();

  // Mostrar loading si backend está caído o arrancando
  if (!isOnline || isChecking) {
    return <BackendLoadingScreen />;
  }

  return <>{children}</>;
};

export default BackendStatusGate;
