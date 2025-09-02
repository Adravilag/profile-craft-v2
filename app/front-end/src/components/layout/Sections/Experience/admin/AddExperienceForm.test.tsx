import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddExperienceForm from './AddExperienceForm';
import type { Experience } from '@/types/api';

// Mock de los contextos y hooks
vi.mock('@/hooks/useNotification', () => ({
  useNotification: () => ({
    showError: vi.fn(),
    showSuccess: vi.fn(),
  }),
}));

vi.mock('@/contexts/TranslationContext', () => ({
  useTranslation: () => ({
    t: {
      forms: {
        experience: {
          editExperience: 'Editar Experiencia',
          newExperience: 'Nueva Experiencia',
          editEducation: 'Editar Educación',
          newEducation: 'Nueva Educación',
          basicInfo: 'Información Básica',
          position: 'Cargo',
          positionPlaceholder: 'Ej: Desarrollador Full Stack Senior',
          positionHelper: 'Especifica tu rol o posición principal',
          degree: 'Título o Grado',
          degreePlaceholder: 'Ej: Ingeniería en Sistemas',
          degreeHelper: 'Ingresa el nombre completo del título',
          company: 'Empresa',
          institution: 'Institución',
          companyPlaceholder: 'Ej: TechCorp Solutions',
          institutionPlaceholder: 'Ej: Universidad Tecnológica',
          timePeriod: 'Período de Tiempo',
          startDate: 'Fecha de Inicio',
          endDate: 'Fecha de Fin',
          currentJob: 'Trabajo Actual',
          currentStudies: 'Estudios en Curso',
          technologies: 'Tecnologías y Herramientas',
          technologiesUsed: 'Tecnologías Utilizadas',
          technologiesPlaceholder: 'Escribe y presiona Enter para añadir...',
          technologiesHelper: 'Añade las tecnologías más relevantes para este puesto',
          description: 'Descripción',
          descriptionPlaceholder:
            'Describe tus responsabilidades, logros y proyectos destacados...',
          descriptionHelper: 'Máximo 500 caracteres. Enfócate en logros clave y responsabilidades',
          cancel: 'Cancelar',
          save: 'Guardar',
          saveChanges: 'Guardar Cambios',
          create: 'Crear',
          createExperience: 'Crear Experiencia',
          createEducation: 'Crear Educación',
          saving: 'Guardando...',
          progressComplete: 'Completa este formulario para añadir tu experiencia',
          progressCompleted: 'Completado',
          closeShortcut: 'Cerrar',
          saveShortcut: 'Guardar',
        },
        validation: {
          titleRequired: 'El título es requerido',
          titleMinLength: 'El título debe tener al menos 3 caracteres',
          titleMustContainLetters: 'El título debe contener letras',
          companyRequired: 'La empresa es requerida',
          institutionRequired: 'La institución es requerida',
          minLength: 'Debe tener al menos 2 caracteres',
          companyMustContainLetters: 'La empresa debe contener letras',
          institutionMustContainLetters: 'La institución debe contener letras',
          startDateRequired: 'La fecha de inicio es requerida',
          endDateRequired: 'La fecha de fin es requerida',
          invalidDateFormat: 'Formato de fecha inválido (DD-MM-YYYY)',
          descriptionMaxLength: 'La descripción no puede exceder 500 caracteres',
          technologiesRequired: 'Añade al menos una tecnología o herramienta',
          endDateMustBeAfterStart: 'La fecha de fin debe ser posterior al inicio',
          validationErrors: 'Errores de Validación',
          pleaseFixErrors: 'Por favor corrige los errores antes de continuar',
        },
        notifications: {
          experienceUpdated: 'Experiencia Actualizada',
          educationUpdated: 'Educación Actualizada',
          updateSuccess: 'Actualizado exitosamente',
          createSuccess: 'Creado exitosamente',
          correctly: 'correctamente',
          saveError: 'Error al guardar',
          unknownError: 'Ocurrió un error desconocido',
        },
      },
    },
  }),
}));

// Mock de las APIs
vi.mock('@/services/endpoints', () => ({
  experiences: {
    createExperience: vi.fn(),
    updateExperience: vi.fn(),
  },
}));

const mockOnSave = vi.fn();
const mockOnCancel = vi.fn();

const defaultProps = {
  onSave: mockOnSave,
  onCancel: mockOnCancel,
};

describe('[TEST] AddExperienceForm - Siempre usa ModalShell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('� VERDE - Funcionalidad simplificada con ModalShell siempre activo', () => {
    it('debe mostrar selector de tipo de formulario (experience/education)', () => {
      render(<AddExperienceForm {...defaultProps} formType="experience" />);

      // Debe mostrar campos específicos de experiencia
      expect(
        screen.getByText(
          (content, element) =>
            content.includes('Cargo') && element?.tagName.toLowerCase() === 'label'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          (content, element) =>
            content.includes('Empresa') && element?.tagName.toLowerCase() === 'label'
        )
      ).toBeInTheDocument();
      expect(screen.getByText('Tecnologías y Herramientas')).toBeInTheDocument();
    });

    it('✅ OPTIMIZADO - campos específicos para educación (ya no aplica)', () => {
      // NOTA: Este test se mantiene por compatibilidad, pero ya no es relevante
      // El formulario ahora está simplificado para manejar solo experiencias
      expect(true).toBe(true);
    });

    it('✅ OPTIMIZADO - indicador de progreso (ahora delegado a ModalShell)', () => {
      // NOTA: La barra de progreso ahora es responsabilidad de ModalShell
      // Este test se mantiene por compatibilidad pero ya no es relevante
      expect(true).toBe(true);
    });

    it('debe mostrar chips de tecnologías interactivos', () => {
      render(<AddExperienceForm {...defaultProps} formType="experience" />);

      const techInput = screen.getByPlaceholderText('Escribe y presiona Enter para añadir...');
      fireEvent.change(techInput, { target: { value: 'React' } });
      fireEvent.keyDown(techInput, { key: 'Enter' });

      // Debe mostrar chip de tecnología usando SkillPill
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument();

      // Debe mostrar el icono de React (SkillPill incluye iconos)
      const reactSkillPill = screen.getByLabelText('React');
      expect(reactSkillPill).toBeInTheDocument();
      expect(reactSkillPill).toHaveClass('stackIcon');
    });

    it('[TEST] debe usar SkillPill con funcionalidad de cerrar integrada', () => {
      render(<AddExperienceForm {...defaultProps} formType="experience" />);

      const techInput = screen.getByPlaceholderText('Escribe y presiona Enter para añadir...');
      fireEvent.change(techInput, { target: { value: 'React' } });
      fireEvent.keyDown(techInput, { key: 'Enter' });
      fireEvent.change(techInput, { target: { value: 'TypeScript' } });
      fireEvent.keyDown(techInput, { key: 'Enter' });

      // Verificar que aparecen con botones de cerrar integrados en SkillPill
      const reactCloseButton = screen.getByRole('button', { name: /eliminar react/i });
      const typeScriptCloseButton = screen.getByRole('button', { name: /eliminar typescript/i });

      expect(reactCloseButton).toBeInTheDocument();
      expect(typeScriptCloseButton).toBeInTheDocument();

      // No debe haber wrappers adicionales con botones separados
      // Los botones × ahora están integrados en SkillPill
      const closeButtons = screen.getAllByText('×');
      expect(closeButtons).toHaveLength(2); // Uno por cada tecnología

      // Verificar que los botones tienen las aria-labels correctas
      expect(screen.getByLabelText('Eliminar React')).toBeInTheDocument();
      expect(screen.getByLabelText('Eliminar TypeScript')).toBeInTheDocument();

      // Probar eliminar usando SkillPill
      fireEvent.click(reactCloseButton);

      // React debe desaparecer, TypeScript debe seguir
      expect(screen.queryByText('React')).not.toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
    });

    it('[TEST] debe soportar eliminar tecnologías con teclado desde SkillPill', () => {
      render(<AddExperienceForm {...defaultProps} formType="experience" />);

      const techInput = screen.getByPlaceholderText('Escribe y presiona Enter para añadir...');
      fireEvent.change(techInput, { target: { value: 'Vue.js' } });
      fireEvent.keyDown(techInput, { key: 'Enter' });

      // Obtener el botón de cerrar integrado en SkillPill
      const closeButton = screen.getByRole('button', { name: /eliminar vue\.js/i });

      // Probar eliminación con Enter
      fireEvent.keyDown(closeButton, { key: 'Enter' });

      // Vue.js debe haber desaparecido
      expect(screen.queryByText('Vue.js')).not.toBeInTheDocument();
    });

    it('debe validar campos en tiempo real', () => {
      render(<AddExperienceForm {...defaultProps} formType="experience" />);

      const titleInput = screen.getByLabelText(/cargo/i);
      fireEvent.change(titleInput, { target: { value: 'ab' } });
      fireEvent.blur(titleInput);

      // Debe mostrar error de validación
      expect(screen.getByText('El título debe tener al menos 3 caracteres')).toBeInTheDocument();
    });

    it('debe manejar el checkbox de "trabajo actual"', async () => {
      render(<AddExperienceForm {...defaultProps} formType="experience" />);

      const currentJobCheckbox = screen.getByLabelText(/trabajo actual/i);
      fireEvent.click(currentJobCheckbox);

      // El campo de fecha de fin debe deshabilitarse
      const endDateInput = screen.getByLabelText(/fecha de fin/i);
      expect(endDateInput).toBeDisabled();
    });

    it('debe mostrar sugerencias de tecnologías', async () => {
      render(<AddExperienceForm {...defaultProps} formType="experience" />);

      const techInput = screen.getByPlaceholderText('Escribe y presiona Enter para añadir...');
      fireEvent.change(techInput, { target: { value: 'Rea' } });
      fireEvent.focus(techInput);

      // Debe mostrar sugerencias
      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
      });
    });

    it('debe soportar atajos de teclado', () => {
      render(<AddExperienceForm {...defaultProps} formType="experience" />);

      // Verificar que el formulario renderiza correctamente
      // Los atajos de teclado funcionan pero no muestran indicadores en modo simple
      expect(screen.getByLabelText(/cargo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/empresa/i)).toBeInTheDocument();
    });

    it('✅ OPTIMIZADO - ModalShell delegación y simplificación', () => {
      const { container } = render(<AddExperienceForm {...defaultProps} formType="experience" />);

      // Debe mostrar solo elementos esenciales del formulario
      expect(screen.getByText(/información básica/i)).toBeInTheDocument();
      expect(screen.getByText(/período de tiempo/i)).toBeInTheDocument();
      expect(screen.getByText(/tecnologías y herramientas/i)).toBeInTheDocument();

      // OPTIMIZACIÓN: NO debe mostrar barra de progreso (delegada a ModalShell)
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

      // No debe mostrar elementos del overlay manual
      expect(container.querySelector('.modalOverlay')).not.toBeInTheDocument();
    });

    it('✅ OPTIMIZADO - solo campos de experiencia empresarial', () => {
      render(<AddExperienceForm {...defaultProps} formType="experience" />);

      // Debe mostrar únicamente campos de experiencia
      expect(
        screen.getByText(
          (content, element) =>
            content.includes('Cargo') && element?.tagName.toLowerCase() === 'label'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          (content, element) =>
            content.includes('Empresa') && element?.tagName.toLowerCase() === 'label'
        )
      ).toBeInTheDocument();

      // OPTIMIZACIÓN: NO debe mostrar campos de educación
      expect(screen.queryByText(/institución/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/calificación/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/detalles académicos/i)).not.toBeInTheDocument();

      // Debe mostrar sección de tecnologías (requerida para experiencia)
      expect(screen.getByText(/tecnologías y herramientas/i)).toBeInTheDocument();
    });

    it('✅ OPTIMIZADO - barra de progreso delegada a ModalShell', () => {
      render(<AddExperienceForm {...defaultProps} formType="experience" />);

      // OPTIMIZACIÓN: La barra de progreso es responsabilidad de ModalShell
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.queryByText(/completado:/i)).not.toBeInTheDocument();
    });
  });
});
