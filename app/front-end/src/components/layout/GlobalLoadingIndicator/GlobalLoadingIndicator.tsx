/**
 * [COMPONENTE] GlobalLoadingIndicator - Indicador visual del estado de loading
 *
 * Componente que muestra qué secciones están cargando actualmente.
 * Útil para debugging y para mostrar feedback visual al usuario.
 */

import React from 'react';
import { useSectionsLoadingContext } from '@/contexts/SectionsLoadingContext';
import styles from './GlobalLoadingIndicator.module.css';

interface GlobalLoadingIndicatorProps {
  /** Si debe mostrarse en modo debug (más información) */
  debug?: boolean;
  /** Si debe mostrarse solo cuando hay loading activo */
  showOnlyWhenLoading?: boolean;
  /** Posición del indicador */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * Indicador visual global del estado de loading de las secciones.
 */
export const GlobalLoadingIndicator: React.FC<GlobalLoadingIndicatorProps> = ({
  debug = false,
  showOnlyWhenLoading = true,
  position = 'top-right',
}) => {
  const { isAnyLoading, getLoadingSections, getLoadingState } = useSectionsLoadingContext();

  const loadingSections = getLoadingSections();
  const isLoading = isAnyLoading();

  // No mostrar si no hay loading y está configurado para mostrar solo cuando carga
  if (showOnlyWhenLoading && !isLoading) {
    return null;
  }

  return (
    <div
      className={`${styles.indicator} ${styles[position]}`}
      data-testid="global-loading-indicator"
    >
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.title}>Loading Status</span>
          {isLoading && (
            <span className={styles.spinner} aria-label="Loading">
              ⏳
            </span>
          )}
        </div>

        {/* Estado básico */}
        <div className={styles.status}>
          <span className={`${styles.badge} ${isLoading ? styles.loading : styles.idle}`}>
            {isLoading ? `Loading (${loadingSections.length})` : 'Idle'}
          </span>
        </div>

        {/* Secciones cargando */}
        {loadingSections.length > 0 && (
          <div className={styles.sections}>
            <span className={styles.label}>Loading:</span>
            <div className={styles.sectionList}>
              {loadingSections.map(section => (
                <span key={section} className={styles.section}>
                  {section}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Modo debug: mostrar todo el estado */}
        {debug && (
          <details className={styles.debug}>
            <summary>Debug Info</summary>
            <pre className={styles.debugContent}>{JSON.stringify(getLoadingState(), null, 2)}</pre>
          </details>
        )}
      </div>
    </div>
  );
};
