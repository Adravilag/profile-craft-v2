import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EnhancedExperienceForm from './EnhancedExperienceForm';

// Mock de los contextos
vi.mock('@/contexts', () => ({
  useNotificationContext: () => ({
    showError: vi.fn(),
    showSuccess: vi.fn(),
  }),
  useUnifiedTheme: () => ({
    currentTheme: 'light',
    themeConfig: {
      colors: {
        primary: '#007acc',
        secondary: '#f0f0f0',
        accent: '#ff6b35',
        text: '#333333',
        background: '#ffffff',
      },
    },
    toggleTheme: vi.fn(),
    setTheme: vi.fn(),
  }),
  useTranslation: () => ({
    currentLanguage: 'es',
    setLanguage: vi.fn(),
  }),
  useT: () => ({
    states: {
      error: 'Error',
      loading: 'Cargando...',
    },
    ui: {
      buttons: {
        download: 'Descargar',
      },
    },
  }),
}));

vi.mock('@/contexts/TranslationContext', () => ({
  useTranslation: () => ({
    t: {
      forms: {
        experience: {
          title: 'Experience',
          education: 'Education',
          editExperience: 'Edit Experience',
          editEducation: 'Edit Education',
          newExperience: 'New Experience',
          newEducation: 'New Education',
          basicInfo: 'Basic Information',
          position: 'Position Title',
          positionPlaceholder: 'E.g: Senior Full Stack Developer',
          positionHelper: 'Specify your main role or position',
          degree: 'Title or Degree',
          degreePlaceholder: 'E.g: Computer Engineering Degree',
          degreeHelper: 'Enter the complete title name',
          company: 'Company',
          institution: 'Institution',
          companyPlaceholder: 'E.g: TechCorp Solutions',
          institutionPlaceholder: 'E.g: University of Technology',
          companyHelper: 'Company or organization name',
          institutionHelper: 'University or educational center name',
          timePeriod: 'Time Period',
          startDate: 'Start Date',
          endDate: 'End Date',
          currentJob: 'Current Job',
          currentStudies: 'Ongoing Studies',
          technologies: 'Technologies and Tools',
          technologiesUsed: 'Technologies Used',
          technologiesPlaceholder: 'Type and press Enter to add...',
          technologiesHelper: 'Add the most relevant technologies for this position',
          academicDetails: 'Academic Details',
          grade: 'Grade',
          gradePlaceholder: 'E.g: Outstanding, 8.5/10, Honor Roll',
          gradeHelper: 'Average grade, mention or recognition obtained',
          displayOrder: 'Display Order',
          displayOrderHelper: 'Number to sort the display',
          details: 'Description and Details',
          description: 'Description',
          descriptionLabel: 'Description',
          descriptionPlaceholder:
            'Describe your responsibilities, achievements and outstanding projects...',
          descriptionEducationPlaceholder:
            'Describe the specialization, outstanding projects, etc...',
          descriptionHelper:
            'Maximum 500 characters. Focus on key achievements and responsibilities',
          cancel: 'Cancel',
          save: 'Save',
          saveChanges: 'Save Changes',
          create: 'Create',
          createExperience: 'Create Experience',
          createEducation: 'Create Education',
          saving: 'Saving...',
          progressComplete: 'Complete this form to add your experience',
          progressCompleted: 'Completed',
          closeShortcut: 'Close',
          saveShortcut: 'Save',
        },
        validation: {
          required: 'This field is required',
          titleRequired: 'Title is required',
          titleMinLength: 'Title must be at least 3 characters',
          titleMustContainLetters: 'Title must contain letters',
          companyRequired: 'Company is required',
          institutionRequired: 'Institution is required',
          minLength: 'Must be at least 2 characters',
          mustContainLetters: 'Must contain letters',
          startDateRequired: 'Start date is required',
          endDateRequired: 'End date is required',
          invalidDateFormat: 'Invalid date format (DD-MM-YYYY)',
          descriptionMaxLength: 'Description cannot exceed 500 characters',
          technologiesRequired: 'Add at least one technology or tool',
          endDateMustBeAfterStart: 'End date must be after start date',
          validationErrors: 'Validation Errors',
          pleaseFixErrors: 'Please fix the errors before continuing',
        },
        notifications: {
          experienceUpdated: 'Experience Updated',
          educationUpdated: 'Education Updated',
          experienceCreated: 'New Experience Created',
          educationCreated: 'New Academic Formation Created',
          updateSuccess: 'Successfully updated',
          createSuccess: 'Successfully created',
          saveError: 'Error saving',
          unknownError: 'Unknown error occurred',
        },
      },
    },
  }),
}));

vi.mock('@/components/ui/DateInput/DateInput', () => ({
  default: ({ name, ...props }: any) => (
    <input {...props} name={name} data-testid="date-input" placeholder="DD/MM/AAAA" />
  ),
}));

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  formType: 'experience' as const,
  initialData: {},
  isEditing: false,
  onSubmit: vi.fn(),
};

describe('EnhancedExperienceForm', () => {
  describe('Traducción del contexto', () => {
    it('debe usar traducciones para experiencia laboral', () => {
      render(<EnhancedExperienceForm {...defaultProps} />);

      // Verificar título del formulario
      expect(screen.getByText('New Experience')).toBeInTheDocument();

      // Verificar secciones
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByText('Time Period')).toBeInTheDocument();
      expect(screen.getByText('Technologies and Tools')).toBeInTheDocument();
      expect(screen.getByText('Description and Details')).toBeInTheDocument();

      // Verificar campos (usando funciones de matching para manejar asteriscos)
      expect(
        screen.getByText(
          (content, element) =>
            content.includes('Position Title') && element?.tagName.toLowerCase() === 'label'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          (content, element) =>
            content.includes('Company') && element?.tagName.toLowerCase() === 'label'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          (content, element) =>
            content.includes('Start Date') && element?.tagName.toLowerCase() === 'label'
        )
      ).toBeInTheDocument();
      expect(screen.getByText('Technologies Used')).toBeInTheDocument();
    });

    it('debe usar traducciones para educación', () => {
      render(<EnhancedExperienceForm {...defaultProps} formType="education" />);

      // Verificar título del formulario
      expect(screen.getByText('New Education')).toBeInTheDocument();

      // Verificar campos específicos de educación
      expect(
        screen.getByText(
          (content, element) =>
            content.includes('Title or Degree') && element?.tagName.toLowerCase() === 'label'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          (content, element) =>
            content.includes('Institution') && element?.tagName.toLowerCase() === 'label'
        )
      ).toBeInTheDocument();
      expect(screen.getByText('Academic Details')).toBeInTheDocument();
      expect(screen.getByText('Grade')).toBeInTheDocument();
    });

    it('debe usar traducciones para botones de acción', () => {
      render(<EnhancedExperienceForm {...defaultProps} />);

      // Verificar botones
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Create Experience')).toBeInTheDocument();
    });
  });
});
