// src/hooks/useBackendStatus.ts

import { useState, useEffect, useCallback } from 'react';
import { debugLog } from '../utils/debugConfig';

export interface BackendStatus {
  isOnline: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  error: string | null;
  retryCount: number;
}

const API_BASE_URL =
  import.meta.env?.VITE_API_URL || 'https://profile-craft-v2-backend.onrender.com/api';
const HEALTH_CHECK_URL = `${API_BASE_URL}/health`;
const CHECK_INTERVAL = 30000; // 30 segundos
const MAX_RETRIES = 5; // Aumentar a 5 para Render
const INITIAL_RETRY_DELAY = 5000; // 5 segundos inicial
const MAX_RETRY_DELAY = 60000; // Máximo 1 minuto entre reintentos

export const useBackendStatus = () => {
  const [status, setStatus] = useState<BackendStatus>({
    isOnline: true, // Asumimos que está online inicialmente
    isChecking: false,
    lastChecked: null,
    error: null,
    retryCount: 0,
  });
  const checkBackendHealth = useCallback(
    async (isManualCheck = false) => {
      if (status.isChecking && !isManualCheck) return;

      setStatus(prev => ({ ...prev, isChecking: true }));

      const controller = new AbortController();
      let timeoutId: NodeJS.Timeout | undefined;

      try {
        timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout

        const response = await fetch(HEALTH_CHECK_URL, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (timeoutId) clearTimeout(timeoutId);
        if (response.ok) {
          const data = await response.json();
          debugLog.backendStatus('✅ Backend está online:', data);

          setStatus(prev => ({
            ...prev,
            isOnline: true,
            isChecking: false,
            lastChecked: new Date(),
            error: null,
            retryCount: 0,
          }));
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error: any) {
        if (timeoutId) clearTimeout(timeoutId);

        const errorMessage =
          error.name === 'AbortError'
            ? 'Timeout: El servidor no responde'
            : error.message || 'Error de conexión desconocido';

        debugLog.error('❌ Backend status check failed:', errorMessage);

        setStatus(prev => ({
          ...prev,
          isOnline: false,
          isChecking: false,
          lastChecked: new Date(),
          error: errorMessage,
          retryCount: prev.retryCount + 1,
        }));
      }
    },
    [status.isChecking]
  );
  const retryConnection = useCallback(() => {
    if (status.retryCount < MAX_RETRIES) {
      debugLog.backendStatus(
        `🔄 Reintentando conexión (${status.retryCount + 1}/${MAX_RETRIES})...`
      );
      checkBackendHealth(true);
    }
  }, [status.retryCount, checkBackendHealth]);

  const resetRetryCount = useCallback(() => {
    setStatus(prev => ({ ...prev, retryCount: 0 }));
  }, []);

  // Verificación inicial al montar el componente
  useEffect(() => {
    debugLog.backendStatus('🔍 Iniciando verificación de estado del backend...');
    checkBackendHealth(true);
  }, []);

  // Verificación periódica cuando el backend está online
  useEffect(() => {
    if (!status.isOnline) return;

    const interval = setInterval(() => {
      checkBackendHealth();
    }, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [status.isOnline, checkBackendHealth]);
  // Auto-retry cuando el backend está offline (con límite y backoff exponencial)
  useEffect(() => {
    if (!status.isOnline && status.retryCount < MAX_RETRIES && !status.isChecking) {
      // Backoff exponencial: 5s, 10s, 20s, 40s, 60s
      const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, status.retryCount), MAX_RETRY_DELAY);

      debugLog.backendStatus(`⏱️ Próximo reintento en ${delay / 1000} segundos...`);

      const retryTimeout = setTimeout(() => {
        retryConnection();
      }, delay);

      return () => clearTimeout(retryTimeout);
    }
  }, [status.isOnline, status.retryCount, status.isChecking, retryConnection]);

  return {
    ...status,
    checkBackendHealth: () => checkBackendHealth(true),
    retryConnection,
    resetRetryCount,
  };
};
