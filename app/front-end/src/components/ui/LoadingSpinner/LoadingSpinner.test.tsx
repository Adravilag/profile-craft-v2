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

  it('acepta tamaños predefinidos como string', () => {
    const { container } = render(<LoadingSpinner size="large" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg).toHaveAttribute('width', '48px');
    expect(svg).toHaveAttribute('height', '48px');
  });

  it('aplica variantes correctamente', () => {
    const { container } = render(<LoadingSpinner variant="pulse" />);
    const status = screen.getByRole('status');
    expect(status.className).toContain('variant-pulse');
  });

  it('renderiza gradiente cuando variant es gradient', () => {
    const { container } = render(<LoadingSpinner variant="gradient" />);
    const gradient = container.querySelector('linearGradient');
    expect(gradient).toBeInTheDocument();
  });

  it('muestra children como texto visible opcional', () => {
    render(<LoadingSpinner>Cargando datos…</LoadingSpinner>);
    expect(screen.getByText('Cargando datos…')).toBeInTheDocument();
  });

  it('aplica className y style al contenedor del spinner', () => {
    render(<LoadingSpinner className="extra" style={{ color: 'rebeccapurple' }} />);
    const status = screen.getByRole('status');
    expect(status).toHaveClass('extra');
    expect(status).toHaveStyle({ color: 'rgb(102, 51, 153)' });
  });

  it('aplica color personalizado cuando se proporciona', () => {
    render(<LoadingSpinner color="#ff0000" />);
    const status = screen.getByRole('status');
    expect(status).toHaveStyle({ color: '#ff0000' });
  });

  it('fullScreen: renderiza overlay a pantalla completa y centra el spinner', () => {
    const { container } = render(<LoadingSpinner fullScreen />);
    const status = screen.getByRole('status');
    const overlay = status.parentElement as HTMLElement;
    expect(overlay).toBeTruthy();
    expect(overlay).toHaveStyle('position: fixed');
    expect(overlay).toHaveStyle('inset: 0');
    expect(status).toBeInTheDocument();
  });

  it('usa el label personalizado para accesibilidad', () => {
    render(<LoadingSpinner label="Loading content" />);
    expect(screen.getByRole('status', { name: /loading content/i })).toBeInTheDocument();
  });

  it('aplica clases de tamaño cuando se usan tamaños predefinidos', () => {
    const { container } = render(<LoadingSpinner size="xlarge" />);
    const status = screen.getByRole('status');
    expect(status.className).toContain('size-xlarge');
  });

  it('mantiene funcionalidad con props combinadas', () => {
    render(
      <LoadingSpinner size="large" variant="gradient" color="#00ff00" className="custom-class">
        Procesando...
      </LoadingSpinner>
    );

    const status = screen.getByRole('status');
    expect(status).toHaveClass('custom-class');
    expect(status).toHaveStyle({ color: '#00ff00' });
    expect(screen.getByText('Procesando...')).toBeInTheDocument();
  });
});
