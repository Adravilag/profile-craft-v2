/**
 * [TEST] SectionsLoadingContext - Contexto global para loading de secciones
 *
 * Test para contexto que permita compartir el estado de loading
 * entre todas las secciones de la aplicación.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { SectionsLoadingProvider, useSectionsLoadingContext } from './SectionsLoadingContext';

// Componente de prueba para probar el contexto
const TestComponent: React.FC = () => {
  const { isLoading, setLoading, isAnyLoading } = useSectionsLoadingContext();

  return (
    <div>
      <div data-testid="skills-loading">{isLoading('skills').toString()}</div>
      <div data-testid="any-loading">{isAnyLoading().toString()}</div>
      <button data-testid="set-skills-loading" onClick={() => setLoading('skills', true)}>
        Set Skills Loading
      </button>
    </div>
  );
};

describe('[TEST] SectionsLoadingContext - Global Loading State', () => {
  it('🔴 should provide loading context to children', () => {
    // [TEST] - Rojo: Verificar que el contexto provee datos a los hijos

    render(
      <SectionsLoadingProvider>
        <TestComponent />
      </SectionsLoadingProvider>
    );

    expect(screen.getByTestId('skills-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('any-loading')).toHaveTextContent('false');
  });

  it('🔴 should allow updating loading state from context', () => {
    // [TEST] - Rojo: Verificar actualización de estado desde contexto

    render(
      <SectionsLoadingProvider>
        <TestComponent />
      </SectionsLoadingProvider>
    );

    const button = screen.getByTestId('set-skills-loading');

    act(() => {
      button.click();
    });

    expect(screen.getByTestId('skills-loading')).toHaveTextContent('true');
    expect(screen.getByTestId('any-loading')).toHaveTextContent('true');
  });

  it('🔴 should throw error when used outside provider', () => {
    // [TEST] - Rojo: Verificar error cuando se usa fuera del provider

    // Mock console.error para capturar el error
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useSectionsLoadingContext must be used within a SectionsLoadingProvider');

    console.error = originalError;
  });
});
