import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SkillPill from './SkillPill';

describe('[TEST] SkillPill - Funcionalidad de cerrar', () => {
  it('debe mostrar botón de cerrar cuando onClose es proporcionado', () => {
    const mockOnClose = vi.fn();

    render(<SkillPill slug="React" colored={true} onClose={mockOnClose} closable={true} />);

    // Debe mostrar el botón de cerrar
    const closeButton = screen.getByRole('button', { name: /eliminar react/i });
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveAttribute('aria-label', 'Eliminar React');
  });

  it('debe llamar onClose cuando se hace clic en el botón de cerrar', () => {
    const mockOnClose = vi.fn();

    render(<SkillPill slug="TypeScript" colored={true} onClose={mockOnClose} closable={true} />);

    const closeButton = screen.getByRole('button', { name: /eliminar typescript/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledWith('TypeScript');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('no debe mostrar botón de cerrar cuando closable es false', () => {
    const mockOnClose = vi.fn();

    render(<SkillPill slug="Vue.js" colored={true} onClose={mockOnClose} closable={false} />);

    // No debe mostrar el botón de cerrar
    const closeButton = screen.queryByRole('button', { name: /eliminar/i });
    expect(closeButton).not.toBeInTheDocument();
  });

  it('no debe mostrar botón de cerrar cuando onClose no es proporcionado', () => {
    render(<SkillPill slug="Angular" colored={true} />);

    // No debe mostrar el botón de cerrar
    const closeButton = screen.queryByRole('button', { name: /eliminar/i });
    expect(closeButton).not.toBeInTheDocument();
  });

  it('debe soportar atajos de teclado para cerrar', () => {
    const mockOnClose = vi.fn();

    render(<SkillPill slug="Node.js" colored={true} onClose={mockOnClose} closable={true} />);

    const closeButton = screen.getByRole('button', { name: /eliminar node\.js/i });

    // Probar Enter
    fireEvent.keyDown(closeButton, { key: 'Enter' });
    expect(mockOnClose).toHaveBeenCalledWith('Node.js');

    // Probar Espacio
    fireEvent.keyDown(closeButton, { key: ' ' });
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });
});
