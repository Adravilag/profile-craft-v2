// Tests for useProjectForm hook
import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useProjectForm } from '../hooks/useProjectForm';
import { createProject, updateProject } from '@/services/endpoints/projects';
import { mockEnhancedProject, emptyProject, resetAllMocks } from './setup';
import type { EnhancedProject } from '../types/ProjectFormTypes';

// Mock the projects API
vi.mock('@/services/endpoints/projects', () => ({
  createProject: vi.fn(),
  updateProject: vi.fn(),
}));

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock notification context
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();
vi.mock('@/contexts', () => ({
  useNotificationContext: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
  }),
}));

const mockCreateProject = createProject as ReturnType<typeof vi.fn>;
const mockUpdateProject = updateProject as ReturnType<typeof vi.fn>;

describe('useProjectForm', () => {
  beforeEach(() => {
    resetAllMocks();
    mockNavigate.mockReset();
    mockShowSuccess.mockReset();
    mockShowError.mockReset();
  });

  describe('Form Initialization', () => {
    it('should initialize with empty project when no initial data provided', () => {
      const { result } = renderHook(() => useProjectForm());

      expect(result.current.form).toEqual(emptyProject);
      expect(result.current.techInput).toBe('');
      expect(result.current.saving).toBe(false);
      expect(result.current.validationErrors).toEqual({});
      expect(result.current.activeTab).toBe('basic');
    });

    it('should initialize with provided project data', () => {
      const { result } = renderHook(() => useProjectForm(mockEnhancedProject));

      expect(result.current.form).toEqual(mockEnhancedProject);
      expect(result.current.techInput).toBe('');
      expect(result.current.saving).toBe(false);
      expect(result.current.validationErrors).toEqual({});
      expect(result.current.activeTab).toBe('basic');
    });

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useProjectForm());

      expect(typeof result.current.handleFormChange).toBe('function');
      expect(typeof result.current.handleAddTechnology).toBe('function');
      expect(typeof result.current.handleRemoveTechnology).toBe('function');
      expect(typeof result.current.handleSave).toBe('function');
      expect(typeof result.current.handleCancel).toBe('function');
      expect(typeof result.current.getProgressPercentage).toBe('function');
      expect(typeof result.current.setActiveTab).toBe('function');
      expect(typeof result.current.setForm).toBe('function');
      expect(typeof result.current.setTechInput).toBe('function');
    });
  });

  describe('Form Field Changes', () => {
    it('should handle string field changes', () => {
      const { result } = renderHook(() => useProjectForm());

      act(() => {
        result.current.handleFormChange('title', 'New Project Title');
      });

      expect(result.current.form.title).toBe('New Project Title');
    });

    it('should handle number field changes', () => {
      const { result } = renderHook(() => useProjectForm());

      act(() => {
        result.current.handleFormChange('order_index', 5);
      });

      expect(result.current.form.order_index).toBe(5);
    });

    it('should handle multiple field changes', () => {
      const { result } = renderHook(() => useProjectForm());

      act(() => {
        result.current.handleFormChange('title', 'Test Title');
        result.current.handleFormChange('description', 'Test Description');
        result.current.handleFormChange('status', 'Completado');
      });

      expect(result.current.form.title).toBe('Test Title');
      expect(result.current.form.description).toBe('Test Description');
      expect(result.current.form.status).toBe('Completado');
    });

    it('should handle nested SEO metadata changes', () => {
      const { result } = renderHook(() => useProjectForm());

      act(() => {
        result.current.setForm(prev => ({
          ...prev,
          seo_metadata: {
            ...prev.seo_metadata,
            meta_title: 'SEO Title',
            is_featured: true,
          },
        }));
      });

      expect(result.current.form.seo_metadata?.meta_title).toBe('SEO Title');
      expect(result.current.form.seo_metadata?.is_featured).toBe(true);
    });
  });

  describe('Technology Management', () => {
    it('should add technology when techInput has value', () => {
      const { result } = renderHook(() => useProjectForm());

      act(() => {
        result.current.setTechInput('React');
      });

      act(() => {
        result.current.handleAddTechnology();
      });

      expect(result.current.form.technologies).toContain('React');
      expect(result.current.techInput).toBe('');
    });

    it('should not add empty technology', () => {
      const { result } = renderHook(() => useProjectForm());

      act(() => {
        result.current.setTechInput('');
        result.current.handleAddTechnology();
      });

      expect(result.current.form.technologies).toEqual([]);
    });

    it('should not add duplicate technology', () => {
      const initialProject: EnhancedProject = {
        ...emptyProject,
        technologies: ['React'],
      };
      const { result } = renderHook(() => useProjectForm(initialProject));

      act(() => {
        result.current.setTechInput('React');
        result.current.handleAddTechnology();
      });

      expect(result.current.form.technologies).toEqual(['React']);
    });

    it('should trim whitespace from technology input', () => {
      const { result } = renderHook(() => useProjectForm());

      act(() => {
        result.current.setTechInput('  TypeScript  ');
      });

      act(() => {
        result.current.handleAddTechnology();
      });

      expect(result.current.form.technologies).toContain('TypeScript');
      expect(result.current.techInput).toBe('');
    });

    it('should remove technology by index', () => {
      const initialProject: EnhancedProject = {
        ...emptyProject,
        technologies: ['React', 'TypeScript', 'Node.js'],
      };
      const { result } = renderHook(() => useProjectForm(initialProject));

      act(() => {
        result.current.handleRemoveTechnology(1); // Remove TypeScript
      });

      expect(result.current.form.technologies).toEqual(['React', 'Node.js']);
    });

    it('should handle removing technology from empty array', () => {
      const { result } = renderHook(() => useProjectForm());

      act(() => {
        result.current.handleRemoveTechnology(0);
      });

      expect(result.current.form.technologies).toEqual([]);
    });

    it('should handle invalid index when removing technology', () => {
      const initialProject: EnhancedProject = {
        ...emptyProject,
        technologies: ['React'],
      };
      const { result } = renderHook(() => useProjectForm(initialProject));

      act(() => {
        result.current.handleRemoveTechnology(5); // Invalid index
      });

      expect(result.current.form.technologies).toEqual(['React']);
    });
  });

  describe('Progress Calculation', () => {
    it('should calculate 0% progress for empty project', () => {
      const { result } = renderHook(() => useProjectForm());

      expect(result.current.getProgressPercentage()).toBe(0);
    });

    it('should calculate progress based on filled required fields', () => {
      const partialProject: EnhancedProject = {
        ...emptyProject,
        title: 'Test Project',
        description: 'Test Description',
      };
      const { result } = renderHook(() => useProjectForm(partialProject));

      const progress = result.current.getProgressPercentage();
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThan(100);
    });

    it('should calculate 100% progress for complete project', () => {
      const { result } = renderHook(() => useProjectForm(mockEnhancedProject));

      expect(result.current.getProgressPercentage()).toBe(100);
    });

    it('should update progress when fields change', () => {
      const { result } = renderHook(() => useProjectForm());

      const initialProgress = result.current.getProgressPercentage();

      act(() => {
        result.current.handleFormChange('title', 'New Title');
        result.current.handleFormChange('description', 'New Description');
      });

      const updatedProgress = result.current.getProgressPercentage();
      expect(updatedProgress).toBeGreaterThan(initialProgress);
    });
  });

  describe('Tab Management', () => {
    it('should initialize with basic tab active', () => {
      const { result } = renderHook(() => useProjectForm());

      expect(result.current.activeTab).toBe('basic');
    });

    it('should change active tab', () => {
      const { result } = renderHook(() => useProjectForm());

      act(() => {
        result.current.setActiveTab('links');
      });

      expect(result.current.activeTab).toBe('links');

      act(() => {
        result.current.setActiveTab('content');
      });

      expect(result.current.activeTab).toBe('content');

      act(() => {
        result.current.setActiveTab('seo');
      });

      expect(result.current.activeTab).toBe('seo');
    });
  });

  describe('Form State Management', () => {
    it('should allow direct form state updates', () => {
      const { result } = renderHook(() => useProjectForm());

      act(() => {
        result.current.setForm({
          ...emptyProject,
          title: 'Direct Update',
          technologies: ['Vue', 'Nuxt'],
        });
      });

      expect(result.current.form.title).toBe('Direct Update');
      expect(result.current.form.technologies).toEqual(['Vue', 'Nuxt']);
    });

    it('should maintain form state consistency', () => {
      const { result } = renderHook(() => useProjectForm());

      act(() => {
        result.current.handleFormChange('title', 'Test');
        result.current.setTechInput('React');
      });

      act(() => {
        result.current.handleAddTechnology();
        result.current.setActiveTab('links');
      });

      expect(result.current.form.title).toBe('Test');
      expect(result.current.form.technologies).toContain('React');
      expect(result.current.activeTab).toBe('links');
      expect(result.current.techInput).toBe('');
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for required fields', async () => {
      const { result } = renderHook(() => useProjectForm());

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.validationErrors.title).toBe('El título es requerido');
      expect(result.current.validationErrors.description).toBe('La descripción es requerida');
      expect(result.current.validationErrors.image_url).toBe('La imagen es requerida');
      expect(result.current.validationErrors.github_url).toBe('El enlace de GitHub es requerido');
      expect(result.current.validationErrors.project_content).toBe(
        'El contenido del proyecto es requerido'
      );
      expect(mockShowError).toHaveBeenCalledWith('Por favor corrige los errores en el formulario');
    });

    it('should show validation errors for required fields in edit mode', async () => {
      const emptyEditProject: EnhancedProject = {
        ...emptyProject,
        title: '',
        description: '',
        image_url: '',
        github_url: '',
        project_content: '',
      };
      const { result } = renderHook(() => useProjectForm(emptyEditProject, 'edit', 'test-id'));

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.validationErrors.title).toBe('El título es requerido');
      expect(result.current.validationErrors.description).toBe('La descripción es requerida');
      expect(result.current.validationErrors.image_url).toBe('La imagen es requerida');
      expect(result.current.validationErrors.github_url).toBe('El enlace de GitHub es requerido');
      expect(result.current.validationErrors.project_content).toBe(
        'El contenido del proyecto es requerido'
      );
      expect(mockShowError).toHaveBeenCalledWith('Por favor corrige los errores en el formulario');
    });

    it('should validate URL fields', async () => {
      const { result } = renderHook(() => useProjectForm());

      act(() => {
        result.current.handleFormChange('title', 'Test Project');
        result.current.handleFormChange('description', 'Test Description');
        result.current.handleFormChange('image_url', 'invalid-url');
        result.current.handleFormChange('github_url', 'not-a-url');
        result.current.handleFormChange('live_url', 'also-invalid');
        result.current.handleFormChange('project_content', 'Test Content');
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.validationErrors.image_url).toBe('Debe ser una URL válida');
      expect(result.current.validationErrors.github_url).toBe('Debe ser una URL válida');
      expect(result.current.validationErrors.live_url).toBe('Debe ser una URL válida');
    });

    it('should validate URL fields in edit mode', async () => {
      const invalidUrlProject: EnhancedProject = {
        ...emptyProject,
        title: 'Test Project',
        description: 'Test Description',
        image_url: 'invalid-url',
        github_url: 'not-a-url',
        live_url: 'also-invalid',
        project_url: 'bad-url',
        video_demo_url: 'invalid-video-url',
        project_content: 'Test Content',
      };

      const { result } = renderHook(() => useProjectForm(invalidUrlProject, 'edit', 'test-id'));

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.validationErrors.image_url).toBe('Debe ser una URL válida');
      expect(result.current.validationErrors.github_url).toBe('Debe ser una URL válida');
      expect(result.current.validationErrors.live_url).toBe('Debe ser una URL válida');
      expect(result.current.validationErrors.project_url).toBe('Debe ser una URL válida');
      expect(result.current.validationErrors.video_demo_url).toBe('Debe ser una URL válida');
    });

    it('should accept valid URLs', async () => {
      const validProject: EnhancedProject = {
        ...emptyProject,
        title: 'Test Project',
        description: 'Test Description',
        image_url: 'https://example.com/image.jpg',
        github_url: 'https://github.com/user/repo',
        live_url: 'https://example.com',
        project_url: 'https://blog.com/article',
        video_demo_url: 'https://youtube.com/watch?v=test',
        project_content: 'Test Content',
      };

      const { result } = renderHook(() => useProjectForm(validProject));
      mockCreateProject.mockResolvedValue({ id: '1', ...validProject });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(Object.keys(result.current.validationErrors)).toHaveLength(0);
      expect(mockCreateProject).toHaveBeenCalledWith(validProject);
    });

    it('should accept valid URLs in edit mode', async () => {
      const validProject: EnhancedProject = {
        ...emptyProject,
        title: 'Test Project',
        description: 'Test Description',
        image_url: 'https://example.com/image.jpg',
        github_url: 'https://github.com/user/repo',
        live_url: 'https://example.com',
        project_url: 'https://blog.com/article',
        video_demo_url: 'https://youtube.com/watch?v=test',
        project_content: 'Test Content',
      };

      const { result } = renderHook(() => useProjectForm(validProject, 'edit', 'test-id'));
      mockUpdateProject.mockResolvedValue({ id: 'test-id', ...validProject });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(Object.keys(result.current.validationErrors)).toHaveLength(0);
      expect(mockUpdateProject).toHaveBeenCalledWith('test-id', validProject);
    });

    it('should clear validation errors when fields are corrected', () => {
      const { result } = renderHook(() => useProjectForm());

      // First trigger validation errors
      act(() => {
        result.current.handleSave();
      });

      expect(result.current.validationErrors.title).toBeTruthy();

      // Then fix the field
      act(() => {
        result.current.handleFormChange('title', 'Fixed Title');
      });

      expect(result.current.validationErrors.title).toBeUndefined();
    });

    it('should clear validation errors when fields are corrected in edit mode', () => {
      const { result } = renderHook(() => useProjectForm(emptyProject, 'edit', 'test-id'));

      // First trigger validation errors
      act(() => {
        result.current.handleSave();
      });

      expect(result.current.validationErrors.title).toBeTruthy();
      expect(result.current.validationErrors.description).toBeTruthy();

      // Then fix the fields
      act(() => {
        result.current.handleFormChange('title', 'Fixed Title');
        result.current.handleFormChange('description', 'Fixed Description');
      });

      expect(result.current.validationErrors.title).toBeUndefined();
      expect(result.current.validationErrors.description).toBeUndefined();
    });

    it('should allow empty optional URL fields', async () => {
      const minimalProject: EnhancedProject = {
        ...emptyProject,
        title: 'Test Project',
        description: 'Test Description',
        image_url: 'https://example.com/image.jpg',
        github_url: 'https://github.com/user/repo',
        project_content: 'Test Content',
        live_url: '', // Optional field left empty
        project_url: '', // Optional field left empty
        video_demo_url: '', // Optional field left empty
      };

      const { result } = renderHook(() => useProjectForm(minimalProject));
      mockCreateProject.mockResolvedValue({ id: '1', ...minimalProject });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(Object.keys(result.current.validationErrors)).toHaveLength(0);
      expect(mockCreateProject).toHaveBeenCalledWith(minimalProject);
    });

    it('should allow empty optional URL fields in edit mode', async () => {
      const minimalProject: EnhancedProject = {
        ...emptyProject,
        title: 'Test Project',
        description: 'Test Description',
        image_url: 'https://example.com/image.jpg',
        github_url: 'https://github.com/user/repo',
        project_content: 'Test Content',
        live_url: '', // Optional field left empty
        project_url: '', // Optional field left empty
        video_demo_url: '', // Optional field left empty
      };

      const { result } = renderHook(() => useProjectForm(minimalProject, 'edit', 'test-id'));
      mockUpdateProject.mockResolvedValue({ id: 'test-id', ...minimalProject });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(Object.keys(result.current.validationErrors)).toHaveLength(0);
      expect(mockUpdateProject).toHaveBeenCalledWith('test-id', minimalProject);
    });

    it('should validate whitespace-only fields as empty', async () => {
      const whitespaceProject: EnhancedProject = {
        ...emptyProject,
        title: '   ',
        description: '\t\n  ',
        image_url: '  ',
        github_url: '   ',
        project_content: '\n\t  ',
      };

      const { result } = renderHook(() => useProjectForm(whitespaceProject));

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.validationErrors.title).toBe('El título es requerido');
      expect(result.current.validationErrors.description).toBe('La descripción es requerida');
      expect(result.current.validationErrors.image_url).toBe('La imagen es requerida');
      expect(result.current.validationErrors.github_url).toBe('El enlace de GitHub es requerido');
      expect(result.current.validationErrors.project_content).toBe(
        'El contenido del proyecto es requerido'
      );
    });

    it('should maintain validation consistency between create and edit modes', async () => {
      const invalidProject: EnhancedProject = {
        ...emptyProject,
        title: '',
        description: '',
        image_url: 'invalid-url',
        github_url: '',
        project_content: '',
      };

      // Test create mode
      const { result: createResult } = renderHook(() => useProjectForm(invalidProject, 'create'));
      await act(async () => {
        await createResult.current.handleSave();
      });

      // Test edit mode
      const { result: editResult } = renderHook(() =>
        useProjectForm(invalidProject, 'edit', 'test-id')
      );
      await act(async () => {
        await editResult.current.handleSave();
      });

      // Both modes should have the same validation errors
      expect(createResult.current.validationErrors).toEqual(editResult.current.validationErrors);
      expect(createResult.current.validationErrors.title).toBe('El título es requerido');
      expect(createResult.current.validationErrors.image_url).toBe('Debe ser una URL válida');
    });
  });

  describe('Form Submission - Create Mode', () => {
    it('should call createProject with form data in create mode', async () => {
      const { result } = renderHook(() => useProjectForm(mockEnhancedProject, 'create'));
      mockCreateProject.mockResolvedValue({ id: '1', ...mockEnhancedProject });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockCreateProject).toHaveBeenCalledWith(mockEnhancedProject);
      expect(mockShowSuccess).toHaveBeenCalledWith('Proyecto creado exitosamente');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/projects');
    });

    it('should call createProject with default mode when no mode specified', async () => {
      const { result } = renderHook(() => useProjectForm(mockEnhancedProject)); // No mode specified
      mockCreateProject.mockResolvedValue({ id: '1', ...mockEnhancedProject });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockCreateProject).toHaveBeenCalledWith(mockEnhancedProject);
      expect(mockUpdateProject).not.toHaveBeenCalled();
      expect(mockShowSuccess).toHaveBeenCalledWith('Proyecto creado exitosamente');
    });

    it('should set saving state during create operation', async () => {
      const { result } = renderHook(() => useProjectForm(mockEnhancedProject, 'create'));

      let resolveCreate: (value: any) => void;
      const createPromise = new Promise(resolve => {
        resolveCreate = resolve;
      });
      mockCreateProject.mockReturnValue(createPromise);

      // Start save operation
      act(() => {
        result.current.handleSave();
      });

      expect(result.current.saving).toBe(true);

      // Complete save operation
      act(() => {
        resolveCreate({ id: '1', ...mockEnhancedProject });
      });

      await act(async () => {
        await createPromise;
      });

      expect(result.current.saving).toBe(false);
    });

    it('should handle create errors', async () => {
      const { result } = renderHook(() => useProjectForm(mockEnhancedProject, 'create'));
      const errorMessage = 'Network error';
      mockCreateProject.mockRejectedValue(new Error(errorMessage));

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockShowError).toHaveBeenCalledWith(`Error al crear el proyecto: ${errorMessage}`);
      expect(result.current.saving).toBe(false);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle create errors with non-Error objects', async () => {
      const { result } = renderHook(() => useProjectForm(mockEnhancedProject, 'create'));
      mockCreateProject.mockRejectedValue('String error');

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockShowError).toHaveBeenCalledWith('Error al crear el proyecto: Error desconocido');
      expect(result.current.saving).toBe(false);
    });

    it('should call onSuccess callback instead of navigate when provided', async () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(() =>
        useProjectForm(mockEnhancedProject, 'create', undefined, onSuccess)
      );
      mockCreateProject.mockResolvedValue({ id: '1', ...mockEnhancedProject });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(onSuccess).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should not submit if validation fails in create mode', async () => {
      const invalidProject: EnhancedProject = {
        ...emptyProject,
        title: '', // Missing required field
      };
      const { result } = renderHook(() => useProjectForm(invalidProject, 'create'));

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockCreateProject).not.toHaveBeenCalled();
      expect(mockShowError).toHaveBeenCalledWith('Por favor corrige los errores en el formulario');
      expect(result.current.saving).toBe(false);
    });

    it('should preserve form data after failed create submission', async () => {
      const { result } = renderHook(() => useProjectForm(mockEnhancedProject, 'create'));
      mockCreateProject.mockRejectedValue(new Error('Server error'));

      await act(async () => {
        await result.current.handleSave();
      });

      // Form data should be preserved after error
      expect(result.current.form).toEqual(mockEnhancedProject);
      expect(result.current.saving).toBe(false);
    });
  });

  describe('Form Submission - Edit Mode', () => {
    it('should call updateProject with form data in edit mode', async () => {
      const projectId = 'test-id';
      const { result } = renderHook(() => useProjectForm(mockEnhancedProject, 'edit', projectId));
      mockUpdateProject.mockResolvedValue({ id: projectId, ...mockEnhancedProject });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockUpdateProject).toHaveBeenCalledWith(projectId, mockEnhancedProject);
      expect(mockCreateProject).not.toHaveBeenCalled();
      expect(mockShowSuccess).toHaveBeenCalledWith('Proyecto actualizado exitosamente');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/projects');
    });

    it('should set saving state during update operation', async () => {
      const projectId = 'test-id';
      const { result } = renderHook(() => useProjectForm(mockEnhancedProject, 'edit', projectId));

      let resolveUpdate: (value: any) => void;
      const updatePromise = new Promise(resolve => {
        resolveUpdate = resolve;
      });
      mockUpdateProject.mockReturnValue(updatePromise);

      // Start save operation
      act(() => {
        result.current.handleSave();
      });

      expect(result.current.saving).toBe(true);

      // Complete save operation
      act(() => {
        resolveUpdate({ id: projectId, ...mockEnhancedProject });
      });

      await act(async () => {
        await updatePromise;
      });

      expect(result.current.saving).toBe(false);
    });

    it('should handle update errors', async () => {
      const projectId = 'test-id';
      const { result } = renderHook(() => useProjectForm(mockEnhancedProject, 'edit', projectId));
      const errorMessage = 'Update failed';
      mockUpdateProject.mockRejectedValue(new Error(errorMessage));

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockShowError).toHaveBeenCalledWith(
        `Error al actualizar el proyecto: ${errorMessage}`
      );
      expect(result.current.saving).toBe(false);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle update errors with non-Error objects', async () => {
      const projectId = 'test-id';
      const { result } = renderHook(() => useProjectForm(mockEnhancedProject, 'edit', projectId));
      mockUpdateProject.mockRejectedValue({ message: 'API Error' });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockShowError).toHaveBeenCalledWith(
        'Error al actualizar el proyecto: Error desconocido'
      );
      expect(result.current.saving).toBe(false);
    });

    it('should not call updateProject if no projectId provided in edit mode', async () => {
      const { result } = renderHook(() => useProjectForm(mockEnhancedProject, 'edit')); // No projectId

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockUpdateProject).not.toHaveBeenCalled();
      expect(mockCreateProject).not.toHaveBeenCalled();
      expect(mockShowSuccess).not.toHaveBeenCalled();
      // Note: The hook still calls navigate even when no projectId is provided in edit mode
      // This is the current behavior - it navigates back to admin page
    });

    it('should call onSuccess callback instead of navigate in edit mode', async () => {
      const projectId = 'test-id';
      const onSuccess = vi.fn();
      const { result } = renderHook(() =>
        useProjectForm(mockEnhancedProject, 'edit', projectId, onSuccess)
      );
      mockUpdateProject.mockResolvedValue({ id: projectId, ...mockEnhancedProject });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(onSuccess).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should not submit if validation fails in edit mode', async () => {
      const invalidProject: EnhancedProject = {
        ...emptyProject,
        title: '', // Missing required field
      };
      const { result } = renderHook(() => useProjectForm(invalidProject, 'edit', 'test-id'));

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockUpdateProject).not.toHaveBeenCalled();
      expect(mockShowError).toHaveBeenCalledWith('Por favor corrige los errores en el formulario');
      expect(result.current.saving).toBe(false);
    });

    it('should preserve form data after failed update submission', async () => {
      const projectId = 'test-id';
      const { result } = renderHook(() => useProjectForm(mockEnhancedProject, 'edit', projectId));
      mockUpdateProject.mockRejectedValue(new Error('Server error'));

      await act(async () => {
        await result.current.handleSave();
      });

      // Form data should be preserved after error
      expect(result.current.form).toEqual(mockEnhancedProject);
      expect(result.current.saving).toBe(false);
    });

    it('should handle concurrent save operations correctly', async () => {
      const projectId = 'test-id';
      const { result } = renderHook(() => useProjectForm(mockEnhancedProject, 'edit', projectId));

      let resolveFirst: (value: any) => void;
      const firstPromise = new Promise(resolve => {
        resolveFirst = resolve;
      });

      mockUpdateProject.mockReturnValue(firstPromise);

      // Start first save operation
      act(() => {
        result.current.handleSave();
      });
      expect(result.current.saving).toBe(true);

      // Try to start second save operation while first is in progress
      // The current implementation doesn't prevent concurrent calls, so both will execute
      act(() => {
        result.current.handleSave();
      });

      // Complete first operation
      act(() => {
        resolveFirst({ id: projectId, ...mockEnhancedProject });
      });

      await act(async () => {
        await firstPromise;
      });

      // Both calls will execute since there's no concurrency protection in current implementation
      expect(mockUpdateProject).toHaveBeenCalledTimes(2);
      expect(result.current.saving).toBe(false);
    });
  });

  describe('Cancel Functionality', () => {
    it('should navigate to admin projects when cancel is called without callback', () => {
      const { result } = renderHook(() => useProjectForm());

      act(() => {
        result.current.handleCancel();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/admin/projects');
    });

    it('should call onCancel callback when provided', () => {
      const onCancel = vi.fn();
      const { result } = renderHook(() =>
        useProjectForm(undefined, 'create', undefined, undefined, onCancel)
      );

      act(() => {
        result.current.handleCancel();
      });

      expect(onCancel).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Comprehensive Validation and Submission Tests', () => {
    it('should validate all required fields before submission in create mode', async () => {
      const { result } = renderHook(() => useProjectForm(emptyProject, 'create'));

      await act(async () => {
        await result.current.handleSave();
      });

      // Check all required field validations
      expect(result.current.validationErrors).toEqual({
        title: 'El título es requerido',
        description: 'La descripción es requerida',
        image_url: 'La imagen es requerida',
        github_url: 'El enlace de GitHub es requerido',
        project_content: 'El contenido del proyecto es requerido',
      });

      expect(mockCreateProject).not.toHaveBeenCalled();
      expect(mockShowError).toHaveBeenCalledWith('Por favor corrige los errores en el formulario');
    });

    it('should validate all required fields before submission in edit mode', async () => {
      const { result } = renderHook(() => useProjectForm(emptyProject, 'edit', 'test-id'));

      await act(async () => {
        await result.current.handleSave();
      });

      // Check all required field validations
      expect(result.current.validationErrors).toEqual({
        title: 'El título es requerido',
        description: 'La descripción es requerida',
        image_url: 'La imagen es requerida',
        github_url: 'El enlace de GitHub es requerido',
        project_content: 'El contenido del proyecto es requerido',
      });

      expect(mockUpdateProject).not.toHaveBeenCalled();
      expect(mockShowError).toHaveBeenCalledWith('Por favor corrige los errores en el formulario');
    });

    it('should successfully submit valid form in create mode', async () => {
      const { result } = renderHook(() => useProjectForm(mockEnhancedProject, 'create'));
      mockCreateProject.mockResolvedValue({ id: '1', ...mockEnhancedProject });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.validationErrors).toEqual({});
      expect(mockCreateProject).toHaveBeenCalledWith(mockEnhancedProject);
      expect(mockShowSuccess).toHaveBeenCalledWith('Proyecto creado exitosamente');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/projects');
    });

    it('should successfully submit valid form in edit mode', async () => {
      const projectId = 'test-id';
      const { result } = renderHook(() => useProjectForm(mockEnhancedProject, 'edit', projectId));
      mockUpdateProject.mockResolvedValue({ id: projectId, ...mockEnhancedProject });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.validationErrors).toEqual({});
      expect(mockUpdateProject).toHaveBeenCalledWith(projectId, mockEnhancedProject);
      expect(mockShowSuccess).toHaveBeenCalledWith('Proyecto actualizado exitosamente');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/projects');
    });

    it('should handle partial form completion and progressive validation', async () => {
      const { result } = renderHook(() => useProjectForm(emptyProject, 'create'));

      // Fill some fields progressively
      act(() => {
        result.current.handleFormChange('title', 'Test Project');
      });

      await act(async () => {
        await result.current.handleSave();
      });

      // Should still have validation errors for other required fields
      expect(result.current.validationErrors.title).toBeUndefined();
      expect(result.current.validationErrors.description).toBe('La descripción es requerida');
      expect(result.current.validationErrors.image_url).toBe('La imagen es requerida');

      // Fill more fields
      act(() => {
        result.current.handleFormChange('description', 'Test Description');
        result.current.handleFormChange('image_url', 'https://example.com/image.jpg');
      });

      await act(async () => {
        await result.current.handleSave();
      });

      // Should have fewer validation errors
      expect(result.current.validationErrors.title).toBeUndefined();
      expect(result.current.validationErrors.description).toBeUndefined();
      expect(result.current.validationErrors.image_url).toBeUndefined();
      expect(result.current.validationErrors.github_url).toBe('El enlace de GitHub es requerido');
      expect(result.current.validationErrors.project_content).toBe(
        'El contenido del proyecto es requerido'
      );
    });

    it('should validate URL format for all URL fields', async () => {
      const projectWithInvalidUrls: EnhancedProject = {
        ...emptyProject,
        title: 'Test Project',
        description: 'Test Description',
        image_url: 'not-a-url',
        github_url: 'also-not-a-url',
        live_url: 'invalid',
        project_url: 'bad-url',
        video_demo_url: 'wrong-format',
        project_content: 'Test Content',
      };

      const { result } = renderHook(() => useProjectForm(projectWithInvalidUrls, 'create'));

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.validationErrors.image_url).toBe('Debe ser una URL válida');
      expect(result.current.validationErrors.github_url).toBe('Debe ser una URL válida');
      expect(result.current.validationErrors.live_url).toBe('Debe ser una URL válida');
      expect(result.current.validationErrors.project_url).toBe('Debe ser una URL válida');
      expect(result.current.validationErrors.video_demo_url).toBe('Debe ser una URL válida');
      expect(mockCreateProject).not.toHaveBeenCalled();
    });

    it('should handle mixed valid and invalid data correctly', async () => {
      const mixedProject: EnhancedProject = {
        ...emptyProject,
        title: 'Valid Title',
        description: '', // Invalid - empty
        image_url: 'https://valid-url.com/image.jpg', // Valid
        github_url: 'invalid-url', // Invalid - bad format
        live_url: 'https://valid-live.com', // Valid
        project_url: '', // Valid - optional field can be empty
        video_demo_url: 'bad-video-url', // Invalid - bad format
        project_content: 'Valid content', // Valid
      };

      const { result } = renderHook(() => useProjectForm(mixedProject, 'edit', 'test-id'));

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.validationErrors.title).toBeUndefined();
      expect(result.current.validationErrors.description).toBe('La descripción es requerida');
      expect(result.current.validationErrors.image_url).toBeUndefined();
      expect(result.current.validationErrors.github_url).toBe('Debe ser una URL válida');
      expect(result.current.validationErrors.live_url).toBeUndefined();
      expect(result.current.validationErrors.project_url).toBeUndefined();
      expect(result.current.validationErrors.video_demo_url).toBe('Debe ser una URL válida');
      expect(result.current.validationErrors.project_content).toBeUndefined();
      expect(mockUpdateProject).not.toHaveBeenCalled();
    });

    it('should clear all validation errors when form becomes valid', async () => {
      const { result } = renderHook(() => useProjectForm(emptyProject, 'create'));

      // First, trigger validation errors
      await act(async () => {
        await result.current.handleSave();
      });

      expect(Object.keys(result.current.validationErrors)).toHaveLength(5);

      // Then fix all fields
      act(() => {
        result.current.handleFormChange('title', 'Valid Title');
        result.current.handleFormChange('description', 'Valid Description');
        result.current.handleFormChange('image_url', 'https://example.com/image.jpg');
        result.current.handleFormChange('github_url', 'https://github.com/user/repo');
        result.current.handleFormChange('project_content', 'Valid Content');
      });

      mockCreateProject.mockResolvedValue({ id: '1', ...mockEnhancedProject });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.validationErrors).toEqual({});
      expect(mockCreateProject).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown errors gracefully', async () => {
      const { result } = renderHook(() => useProjectForm(mockEnhancedProject, 'create'));
      mockCreateProject.mockRejectedValue('Unknown error'); // Not an Error object

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockShowError).toHaveBeenCalledWith('Error al crear el proyecto: Error desconocido');
    });

    it('should prevent submission when validation fails', async () => {
      const { result } = renderHook(() => useProjectForm()); // Empty project

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockCreateProject).not.toHaveBeenCalled();
      expect(mockUpdateProject).not.toHaveBeenCalled();
      expect(mockShowError).toHaveBeenCalledWith('Por favor corrige los errores en el formulario');
    });

    it('should handle network timeout errors', async () => {
      const { result } = renderHook(() => useProjectForm(mockEnhancedProject, 'create'));
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      mockCreateProject.mockRejectedValue(timeoutError);

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockShowError).toHaveBeenCalledWith('Error al crear el proyecto: Request timeout');
      expect(result.current.saving).toBe(false);
    });

    it('should handle validation errors during form changes', async () => {
      const { result } = renderHook(() => useProjectForm());

      // Set initial validation errors
      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.validationErrors.title).toBeTruthy();

      // Clear error when field is fixed
      act(() => {
        result.current.handleFormChange('title', 'Valid Title');
      });

      expect(result.current.validationErrors.title).toBeUndefined();

      // Set up a project with all required fields filled but invalid URL
      act(() => {
        result.current.handleFormChange('description', 'Valid Description');
        result.current.handleFormChange('github_url', 'https://github.com/user/repo');
        result.current.handleFormChange('project_content', 'Valid Content');
        result.current.handleFormChange('image_url', 'invalid-url');
      });

      // Now trigger validation with invalid URL
      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.validationErrors.image_url).toBe('Debe ser una URL válida');

      // Clear URL error when fixed
      act(() => {
        result.current.handleFormChange('image_url', 'https://valid-url.com');
      });

      expect(result.current.validationErrors.image_url).toBeUndefined();
    });

    it('should maintain error state consistency across mode changes', async () => {
      // Test that validation behavior is consistent between modes
      const invalidData: EnhancedProject = {
        ...emptyProject,
        title: '',
        image_url: 'invalid-url',
      };

      // Create mode
      const { result: createResult } = renderHook(() => useProjectForm(invalidData, 'create'));
      await act(async () => {
        await createResult.current.handleSave();
      });

      // Edit mode
      const { result: editResult } = renderHook(() =>
        useProjectForm(invalidData, 'edit', 'test-id')
      );
      await act(async () => {
        await editResult.current.handleSave();
      });

      // Both should have same validation errors
      expect(createResult.current.validationErrors.title).toBe(
        editResult.current.validationErrors.title
      );
      expect(createResult.current.validationErrors.image_url).toBe(
        editResult.current.validationErrors.image_url
      );
    });
  });
});
