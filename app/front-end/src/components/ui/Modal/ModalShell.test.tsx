import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ModalShell from './ModalShell';

describe('ModalShell', () => {
  const defaultProps = {
    title: 'Test Modal',
    onClose: vi.fn(),
  };

  it('debe renderizar un modal básico', () => {
    render(
      <ModalShell {...defaultProps}>
        <div>Contenido del modal</div>
      </ModalShell>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Contenido del modal')).toBeInTheDocument();
  });

  it('[TEST] debe mostrar barra de progreso cuando se proporciona formProgress', () => {
    const formData = {
      title: 'Desarrollador',
      company: 'TechCorp',
      start_date: '01-01-2023',
      end_date: '',
      description: 'Descripción válida',
      technologies: '',
      order_index: 0,
      is_current: true,
    };

    const validationErrors = {};
    const selectedTechnologies = ['React', 'TypeScript'];

    render(
      <ModalShell
        {...defaultProps}
        formData={formData}
        validationErrors={validationErrors}
        selectedTechnologies={selectedTechnologies}
        showProgress={true}
      >
        <div>Formulario</div>
      </ModalShell>
    );

    // Debe mostrar la barra de progreso
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText(/completado/i)).toBeInTheDocument();
  });

  it('[TEST] no debe mostrar barra de progreso cuando showProgress es false', () => {
    render(
      <ModalShell {...defaultProps} showProgress={false}>
        <div>Formulario</div>
      </ModalShell>
    );

    // No debe mostrar la barra de progreso
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
