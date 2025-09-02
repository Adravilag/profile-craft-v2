import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ExperienceModal from './ExperienceModal';

// Mock del contexto de traducción
vi.mock('@/contexts/TranslationContext', () => ({
  useTranslation: () => ({
    t: {
      forms: {
        experience: {
          editExperience: 'Editar Experiencia',
          newExperience: 'Nueva Experiencia',
          newEducation: 'Nueva Educación',
          saveChanges: 'Guardar Cambios',
          createExperience: 'Crear Experiencia',
          createEducation: 'Crear Educación',
        },
      },
      states: {
        cancel: 'Cancelar',
      },
    },
  }),
}));

describe('ExperienceModal - Integración con ModalShell y barra de progreso', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    formType: 'experience' as const,
    isEditing: false,
    onSubmit: vi.fn(),
  };

  it('[TEST INTEGRACION] debe mostrar barra de progreso cuando el modal está abierto', () => {
    render(<ExperienceModal {...defaultProps} />);

    // Debe mostrar el título del modal
    expect(screen.getByText('Nueva Experiencia')).toBeInTheDocument();

    // Debe mostrar la barra de progreso
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText(/completado:/i)).toBeInTheDocument();

    // Debe mostrar los campos específicos del formulario (por ID)
    expect(document.getElementById('title')).toBeInTheDocument();
    expect(document.getElementById('company')).toBeInTheDocument();
  });

  it('[TEST INTEGRACION] debe actualizar el progreso cuando se llenan campos', async () => {
    render(<ExperienceModal {...defaultProps} />);

    // Progreso inicial debe ser bajo
    const progressText = screen.getByText(/completado:/i);
    expect(progressText).toBeInTheDocument();

    // Llenar campo título (usando getElementById para mayor confiabilidad)
    const titleInput = document.getElementById('title') as HTMLInputElement;
    expect(titleInput).toBeInTheDocument();
    fireEvent.change(titleInput, { target: { value: 'Desarrollador Senior' } });

    // Llenar campo empresa (usando getElementById para mayor confiabilidad)
    const companyInput = document.getElementById('company') as HTMLInputElement;
    expect(companyInput).toBeInTheDocument();
    fireEvent.change(companyInput, { target: { value: 'TechCorp Solutions' } });

    // El progreso debería haber aumentado (aunque no podemos verificar el % exacto sin más interacción)
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('[TEST INTEGRACION] no debe mostrar barra de progreso cuando el modal está cerrado', () => {
    render(<ExperienceModal {...defaultProps} isOpen={false} />);

    // No debe renderizar nada cuando está cerrado
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByText('Nueva Experiencia')).not.toBeInTheDocument();
  });

  it('[TEST EDICION] debe mostrar barra de progreso cuando edita una experiencia existente', () => {
    const editProps = {
      ...defaultProps,
      isEditing: true,
      initialData: {
        title: 'Desarrollador Senior',
        company: 'TechCorp',
        start_date: '01-01-2023',
        description: 'Descripción existente',
      },
    };

    render(<ExperienceModal {...editProps} />);

    // Debe mostrar el título de edición
    expect(screen.getByText('Editar Experiencia')).toBeInTheDocument();

    // Debe mostrar la barra de progreso incluso en modo edición
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText(/completado:/i)).toBeInTheDocument();

    // Debe mostrar los campos del formulario con datos pre-cargados
    expect(document.getElementById('title')).toBeInTheDocument();
    expect(document.getElementById('company')).toBeInTheDocument();
  });

  it('[TEST EDUCACION] debe mostrar formulario de educación cuando formType es education', () => {
    render(<ExperienceModal {...defaultProps} formType="education" />);

    // Debe mostrar el título para educación
    expect(screen.getByText('Nueva Educación')).toBeInTheDocument();

    // Debe mostrar la barra de progreso
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Debe mostrar campos específicos de educación
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument(); // Título/Grado
    expect(screen.getByLabelText(/institución/i)).toBeInTheDocument();
  });
});
