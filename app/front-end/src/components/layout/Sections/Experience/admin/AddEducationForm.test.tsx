import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AddEducationForm from './AddEducationForm';

// Mock del contexto de traducción
vi.mock('@/contexts/TranslationContext', () => ({
  useTranslation: () => ({
    t: {
      forms: {
        education: {
          title: 'Título',
          institution: 'Institución',
          startDate: 'Fecha de inicio',
          endDate: 'Fecha de fin',
          description: 'Descripción',
          grade: 'Calificación',
        },
      },
    },
  }),
}));

// Mock de hooks
vi.mock('@/hooks/useNotification', () => ({
  useNotification: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

// Mock de servicios
vi.mock('@/services/endpoints', () => ({
  education: {
    create: vi.fn(),
    update: vi.fn(),
  },
}));

describe('[TEST] AddEducationForm - Integración con ModalShell', () => {
  const defaultProps = {
    onSave: vi.fn(),
    onCancel: vi.fn(),
  };

  it('[TEST ROJO] debe soportar useModalShell prop para integración', () => {
    render(<AddEducationForm {...defaultProps} useModalShell={true} />);

    // Debe mostrar campos básicos de educación
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/institución/i)).toBeInTheDocument();
  });

  it('[TEST ROJO] debe comunicar cambios de formulario para progreso', () => {
    const onFormDataChange = vi.fn();
    const onValidationErrorsChange = vi.fn();

    render(
      <AddEducationForm
        {...defaultProps}
        useModalShell={true}
        onFormDataChange={onFormDataChange}
        onValidationErrorsChange={onValidationErrorsChange}
      />
    );

    // Llenar campo título
    const titleInput = screen.getByLabelText(/título/i);
    fireEvent.change(titleInput, { target: { value: 'Licenciatura en Informática' } });

    // Debe haber llamado al callback
    expect(onFormDataChange).toHaveBeenCalled();
  });

  it('[TEST ROJO] debe calcular progreso basado en campos de educación', () => {
    const onFormDataChange = vi.fn();

    render(
      <AddEducationForm
        {...defaultProps}
        useModalShell={true}
        onFormDataChange={onFormDataChange}
      />
    );

    // Llenar campos básicos
    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: 'Licenciatura' },
    });
    fireEvent.change(screen.getByLabelText(/institución/i), {
      target: { value: 'Universidad XYZ' },
    });

    // Verificar que se llama onFormDataChange con los datos correctos
    expect(onFormDataChange).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Licenciatura',
        institution: 'Universidad XYZ',
      })
    );
  });
});
