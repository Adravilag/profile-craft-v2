// src/components/layout/ErrorBoundary/QueryErrorBoundary.test.tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryErrorBoundary } from './QueryErrorBoundary';

const Boom: React.FC = () => {
  throw new Error('Boom!');
};

describe('QueryErrorBoundary', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('renderiza sus hijos cuando no hay error', () => {
    render(
      <QueryErrorBoundary>
        <div>OK CHILD</div>
      </QueryErrorBoundary>
    );
    expect(screen.getByText('OK CHILD')).toBeInTheDocument();
  });

  it('muestra fallback UI cuando un hijo lanza error', () => {
    render(
      <QueryErrorBoundary>
        <Boom />
      </QueryErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Algo salió mal/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Intentar de nuevo/i })).toBeInTheDocument();
  });

  it('permite reintentar y volver a renderizar hijos después del error', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <QueryErrorBoundary>
        <Boom />
      </QueryErrorBoundary>
    );

    // Estamos en fallback
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // 1) Cambiamos el hijo a uno "seguro" (el boundary sigue en hasError=true)
    rerender(
      <QueryErrorBoundary>
        <div>Recovered Child</div>
      </QueryErrorBoundary>
    );

    // 2) Ahora pulsamos "Intentar de nuevo" para limpiar el estado del boundary
    await user.click(screen.getByRole('button', { name: /Intentar de nuevo/i }));

    // 3) Esperamos a que desaparezca el fallback y aparezca el hijo
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByText('Recovered Child')).toBeInTheDocument();
    });
  });
});
