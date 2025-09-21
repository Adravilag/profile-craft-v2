// useProjectForm hook - Form state management and logic
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationContext } from '@/contexts';
import { createProject, updateProject } from '@/services/endpoints/projects';
import type { EnhancedProject, TabType, UseProjectFormReturn } from '../types/ProjectFormTypes';

/**
 * Creates an empty project object with default values
 * Used as the initial state for new project creation
 * @returns {EnhancedProject} Empty project with default values
 */
const createEmptyProject = (): EnhancedProject => ({
  user_id: 'dynamic-admin-id',
  title: '',
  description: '',
  image_url: '',
  gallery_images: [],
  github_url: '',
  live_url: '',
  project_url: '',
  project_content: '',
  video_demo_url: '',
  status: 'En Desarrollo',
  order_index: 0,
  type: 'proyecto',
  technologies: [],
  seo_metadata: {
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    is_featured: false,
    reading_time: 5,
  },
});

/**
 * Custom hook for managing project form state and operations
 * Handles both create and edit modes with comprehensive form management
 *
 * @param {EnhancedProject} [initialProject] - Initial project data for pre-populating the form
 * @param {'create' | 'edit'} [mode='create'] - Form mode, determines behavior and API calls
 * @param {string} [projectId] - Project ID when in edit mode
 * @param {() => void} [onSuccess] - Callback executed after successful save operation
 * @param {() => void} [onCancel] - Callback executed when form is cancelled
 * @returns {UseProjectFormReturn} Object containing form state and handlers
 *
 * @example
 * ```tsx
 * // Create mode
 * const formHook = useProjectForm();
 *
 * // Edit mode
 * const formHook = useProjectForm(undefined, 'edit', 'project-123',
 *   () => navigate('/projects'),
 *   () => navigate('/admin')
 * );
 * ```
 */
export const useProjectForm = (
  initialProject?: EnhancedProject,
  mode: 'create' | 'edit' = 'create',
  projectId?: string,
  onSuccess?: () => void,
  onCancel?: () => void
): UseProjectFormReturn => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotificationContext();

  // Form state
  const [form, setForm] = useState<EnhancedProject>(initialProject || createEmptyProject());
  const [techInput, setTechInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<TabType>('basic');

  // Handle form field changes
  const handleFormChange = useCallback(
    (field: keyof EnhancedProject, value: string | number | string[]) => {
      setForm(prev => ({
        ...prev,
        [field]: value as any,
      }));

      // Clear validation error for this field if it exists
      if (validationErrors[field]) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [validationErrors]
  );

  // Add technology to the list
  const handleAddTechnology = useCallback(() => {
    const trimmedTech = techInput.trim();

    if (trimmedTech && !form.technologies.includes(trimmedTech)) {
      setForm(prev => ({
        ...prev,
        technologies: [...prev.technologies, trimmedTech],
      }));
      setTechInput('');
    }
  }, [techInput, form.technologies]);

  // Remove technology from the list
  const handleRemoveTechnology = useCallback(
    (index: number) => {
      if (index >= 0 && index < form.technologies.length) {
        setForm(prev => ({
          ...prev,
          technologies: prev.technologies.filter((_, i) => i !== index),
        }));
      }
    },
    [form.technologies]
  );

  // Calculate progress percentage based on filled fields (memoized for performance)
  const getProgressPercentage = useMemo((): number => {
    const requiredFields = ['title', 'description', 'image_url', 'github_url', 'project_content'];

    const optionalFields = ['live_url', 'project_url', 'video_demo_url'];

    const seoFields = [
      'seo_metadata.meta_title',
      'seo_metadata.meta_description',
      'seo_metadata.meta_keywords',
    ];

    let filledCount = 0;
    let totalFields = requiredFields.length + optionalFields.length + seoFields.length + 1; // +1 for technologies

    // Check required fields
    requiredFields.forEach(field => {
      if (
        form[field as keyof EnhancedProject] &&
        String(form[field as keyof EnhancedProject]).trim()
      ) {
        filledCount++;
      }
    });

    // Check optional fields
    optionalFields.forEach(field => {
      if (
        form[field as keyof EnhancedProject] &&
        String(form[field as keyof EnhancedProject]).trim()
      ) {
        filledCount++;
      }
    });

    // Check SEO fields
    if (form.seo_metadata?.meta_title?.trim()) filledCount++;
    if (form.seo_metadata?.meta_description?.trim()) filledCount++;
    if (form.seo_metadata?.meta_keywords?.trim()) filledCount++;

    // Check technologies
    if (form.technologies.length > 0) filledCount++;

    return Math.round((filledCount / totalFields) * 100);
  }, [form]);

  // Validate form data
  const validateForm = useCallback((): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!form.title.trim()) {
      errors.title = 'El título es requerido';
    }

    if (!form.description.trim()) {
      errors.description = 'La descripción es requerida';
    }

    if (!form.image_url.trim()) {
      errors.image_url = 'La imagen es requerida';
    }

    // GitHub URL is optional — do not block save if missing
    // if (!form.github_url.trim()) {
    //   errors.github_url = 'El enlace de GitHub es requerido';
    // }

    if (!form.project_content.trim()) {
      errors.project_content = 'El contenido del proyecto es requerido';
    }

    // Validate URLs if provided
    const urlFields = ['image_url', 'github_url', 'live_url', 'project_url', 'video_demo_url'];
    urlFields.forEach(field => {
      const value = form[field as keyof EnhancedProject] as string;
      if (value && value.trim()) {
        try {
          new URL(value);
        } catch {
          errors[field] = 'Debe ser una URL válida';
        }
      }
    });

    setValidationErrors(errors);
    return errors;
  }, [form]);

  // Handle form submission
  const handleSave = useCallback(async () => {
    console.debug('[useProjectForm] handleSave invoked, mode=', mode, 'projectId=', projectId);
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      console.debug('[useProjectForm] validation failed', errors);
      showError('Por favor corrige los errores en el formulario');
      return;
    }

    setSaving(true);

    try {
      if (mode === 'create') {
        await createProject(form);
        showSuccess('Proyecto creado exitosamente');
      } else if (mode === 'edit' && projectId) {
        await updateProject(projectId, form);
        showSuccess('Proyecto actualizado exitosamente');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/admin/projects');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      showError(
        mode === 'create'
          ? `Error al crear el proyecto: ${errorMessage}`
          : `Error al actualizar el proyecto: ${errorMessage}`
      );
    } finally {
      setSaving(false);
    }
  }, [form, mode, projectId, validateForm, showSuccess, showError, onSuccess, navigate]);

  // Auto-fill image_url from the first gallery image when appropriate
  // If user has not provided an image_url but added gallery images, use the first one
  // This keeps the thumbnail in sync with gallery uploads and is a convenient default.
  // Note: This effect intentionally writes to state using setForm and therefore
  // is run as a side-effect when form.gallery_images changes.
  useEffect(() => {
    try {
      const gallery = form.gallery_images || [];
      if ((!form.image_url || !String(form.image_url).trim()) && gallery.length > 0) {
        setForm(prev => ({ ...prev, image_url: gallery[0] }));
      }
    } catch (e) {
      // noop
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.gallery_images]);

  const setPrimaryImage = useCallback((url: string) => {
    setForm(prev => ({ ...prev, image_url: url }));
  }, []);

  // Handle cancel action
  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/admin/projects');
    }
  }, [onCancel, navigate]);

  return {
    form,
    setForm,
    techInput,
    setTechInput,
    saving,
    validationErrors,
    activeTab,
    setActiveTab,
    handleFormChange,
    handleAddTechnology,
    handleRemoveTechnology,
    handleSave,
    handleCancel,
    getProgressPercentage: () => getProgressPercentage,
  };
};
