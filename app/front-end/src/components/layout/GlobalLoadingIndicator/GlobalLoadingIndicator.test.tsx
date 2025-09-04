/**
 * [TEST] GlobalLoadingIndicator - Indicador visual de loading
 *
 * Test para el componente que muestra el estado global de loading.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { GlobalLoadingIndicator } from './GlobalLoadingIndicator';
import { SectionsLoadingProvider } from '@/contexts/SectionsLoadingContext';

// Componente de prueba para controlar el estado
const TestController: React.FC<{ onSetLoading: (section: string, loading: boolean) => void }> = ({
  onSetLoading,
}) => {
  return (
    <div>
      <button data-testid="load-skills" onClick={() => onSetLoading('skills', true)}>
        Load Skills
      </button>
      <button data-testid="load-projects" onClick={() => onSetLoading('projects', true)}>
        Load Projects
      </button>
      <button
        data-testid="stop-loading"
        onClick={() => {
          onSetLoading('skills', false);
          onSetLoading('projects', false);
        }}
      >
        Stop Loading
      </button>
    </div>
  );
};

// Wrapper con contexto y controlador
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contextRef, setContextRef] = React.useState<any>(null);

  return (
    <SectionsLoadingProvider>
      <div
        ref={el => {
          if (el && !contextRef) {
            // Obtener referencia al contexto usando el hook directamente
            const { useSectionsLoadingContext } = require('@/contexts/SectionsLoadingContext');
            setContextRef({ setLoading: () => {} }); // Placeholder para el test
          }
        }}
      />
      {children}
      <TestController
        onSetLoading={(section, loading) => {
          // En un test real, esto sería manejado por el contexto
          const event = new CustomEvent('setLoading', { detail: { section, loading } });
          window.dispatchEvent(event);
        }}
      />
    </SectionsLoadingProvider>
  );
};

describe('[TEST] GlobalLoadingIndicator - Visual Loading State', () => {
  it('🔴 should not render when no loading and showOnlyWhenLoading=true', () => {
    // [TEST] - Rojo: No mostrar cuando no hay loading

    render(
      <SectionsLoadingProvider>
        <GlobalLoadingIndicator showOnlyWhenLoading={true} />
      </SectionsLoadingProvider>
    );

    expect(screen.queryByTestId('global-loading-indicator')).not.toBeInTheDocument();
  });

  it('🔴 should render when showOnlyWhenLoading=false', () => {
    // [TEST] - Rojo: Mostrar siempre cuando showOnlyWhenLoading=false

    render(
      <SectionsLoadingProvider>
        <GlobalLoadingIndicator showOnlyWhenLoading={false} />
      </SectionsLoadingProvider>
    );

    expect(screen.getByTestId('global-loading-indicator')).toBeInTheDocument();
    expect(screen.getByText('Idle')).toBeInTheDocument();
  });

  it('🔴 should show debug info when debug=true', () => {
    // [TEST] - Rojo: Mostrar información de debug

    render(
      <SectionsLoadingProvider>
        <GlobalLoadingIndicator debug={true} showOnlyWhenLoading={false} />
      </SectionsLoadingProvider>
    );

    expect(screen.getByText('Debug Info')).toBeInTheDocument();
  });

  it('🔴 should apply correct position class', () => {
    // [TEST] - Rojo: Aplicar clase de posición correcta

    const { rerender } = render(
      <SectionsLoadingProvider>
        <GlobalLoadingIndicator position="bottom-left" showOnlyWhenLoading={false} />
      </SectionsLoadingProvider>
    );

    const indicator = screen.getByTestId('global-loading-indicator');
    expect(indicator.className).toContain('bottom-left');

    rerender(
      <SectionsLoadingProvider>
        <GlobalLoadingIndicator position="top-right" showOnlyWhenLoading={false} />
      </SectionsLoadingProvider>
    );

    expect(indicator.className).toContain('top-right');
  });

  it('🔴 should show loading status text', () => {
    // [TEST] - Rojo: Mostrar texto de estado de loading

    render(
      <SectionsLoadingProvider>
        <GlobalLoadingIndicator showOnlyWhenLoading={false} />
      </SectionsLoadingProvider>
    );

    expect(screen.getByText('Loading Status')).toBeInTheDocument();
    expect(screen.getByText('Idle')).toBeInTheDocument();
  });
});
