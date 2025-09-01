// src/components/ui/LoadingSpinner/LoadingSpinner.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renderiza con label accesible por defecto', () => {
    render(<LoadingSpinner />);
    const status = screen.getByRole('status', { name: /cargando/i });
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('acepta tamaño custom y lo aplica al SVG', () => {
    const { container } = render(<LoadingSpinner size={32} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg).toHaveAttribute('width', '32px');
    expect(svg).toHaveAttribute('height', '32px');
  });

  it('muestra children como texto visible opcional', () => {
    render(<LoadingSpinner>Cargando datos…</LoadingSpinner>);
    expect(screen.getByText('Cargando datos…')).toBeInTheDocument();
  });

  it('aplica className y style al contenedor del spinner', () => {
    render(<LoadingSpinner className="extra" style={{ color: 'rebeccapurple' }} />);
    const status = screen.getByRole('status');
    expect(status).toHaveClass('extra');

    // Opción A: usar el valor normalizado por JSDOM
    expect(status).toHaveStyle({ color: 'rgb(102, 51, 153)' });

    // Opción B (equivalente): comparar el computed style
    // expect(getComputedStyle(status).color).toBe("rgb(102, 51, 153)");
  });
  it('fullScreen: renderiza overlay a pantalla completa y centra el spinner', () => {
    const { container } = render(<LoadingSpinner fullScreen />);
    const status = screen.getByRole('status');
    const overlay = status.parentElement as HTMLElement;
    expect(overlay).toBeTruthy();
    // El overlay es el contenedor externo (fixed + inset 0)
    expect(overlay).toHaveStyle('position: fixed');
    expect(overlay).toHaveStyle('inset: 0');
    // El spinner sigue presente
    expect(status).toBeInTheDocument();
  });

  it('usa el label personalizado para accesibilidad', () => {
    render(<LoadingSpinner label="Loading content" />);
    expect(screen.getByRole('status', { name: /loading content/i })).toBeInTheDocument();
  });
});
