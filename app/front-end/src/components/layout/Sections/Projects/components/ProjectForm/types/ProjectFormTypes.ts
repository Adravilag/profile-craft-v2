// ProjectForm types and interfaces
import type { Project } from '@/types/api';

/**
 * SEO metadata interface for enhanced project information
 * Used to store search engine optimization data for projects
 */
export interface SeoMetadata {
  /** Meta title for SEO (max 60 characters recommended) */
  meta_title?: string;
  /** Meta description for SEO (max 160 characters recommended) */
  meta_description?: string;
  /** Comma-separated keywords for SEO */
  meta_keywords?: string;
  /** Whether this project should be featured prominently */
  is_featured?: boolean;
  /** Estimated reading time in minutes */
  reading_time?: number;
}

/**
 * Enhanced project interface that extends the base Project type
 * Adds SEO metadata capabilities while omitting the ID field for form usage
 */
export interface EnhancedProject extends Omit<Project, 'id'> {
  /** Optional SEO metadata for the project */
  seo_metadata?: SeoMetadata;
  /** Optional gallery images for the project (array of image URLs) */
  gallery_images?: string[];
}

/**
 * Available tab types for the project form interface
 * Represents the different sections of the form
 */
export type TabType = 'basic' | 'gallery' | 'links' | 'content' | 'seo';

/**
 * Props interface for the ProjectForm component
 * Supports both create and edit modes with optional callbacks
 */
export interface ProjectFormProps {
  /** Form mode - 'create' for new projects, 'edit' for existing ones */
  mode?: 'create' | 'edit';
  /** Project ID when in edit mode */
  projectId?: string;
  /** Callback function called when form is successfully submitted */
  onSuccess?: () => void;
  /** Callback function called when form is cancelled */
  onCancel?: () => void;
  /** Optional current language for the form ('es' | 'en') */
  language?: 'es' | 'en';
  /** Optional callback when language changes */
  onLanguageChange?: (lang: 'es' | 'en') => void;
}

/**
 * Return type for the useProjectForm hook
 * Provides all necessary state and handlers for form management
 */
export interface UseProjectFormReturn {
  /** Current form state containing all project data */
  form: EnhancedProject;
  /** Setter function for updating form state */
  setForm: React.Dispatch<React.SetStateAction<EnhancedProject>>;
  /** Current value of the technology input field */
  techInput: string;
  /** Setter function for technology input field */
  setTechInput: React.Dispatch<React.SetStateAction<string>>;
  /** Whether the form is currently being saved */
  saving: boolean;
  /** Object containing validation errors keyed by field name */
  validationErrors: Record<string, string>;
  /** Currently active tab in the form */
  activeTab: TabType;
  /** Setter function for active tab */
  setActiveTab: React.Dispatch<React.SetStateAction<TabType>>;
  /** Handler for updating form field values */
  handleFormChange: (field: keyof EnhancedProject, value: string | number | string[]) => void;
  /** Handler for adding a new technology to the list */
  handleAddTechnology: () => void;
  /** Handler for removing a technology from the list by index */
  handleRemoveTechnology: (index: number) => void;
  /** Handler for saving/submitting the form */
  handleSave: () => Promise<void>;
  /** Handler for cancelling the form */
  handleCancel: () => void;
  /** Function that calculates and returns the form completion percentage */
  getProgressPercentage: () => number;
}

/**
 * Return type for the useProjectData hook
 * Provides project loading functionality for edit mode
 */
export interface UseProjectDataReturn {
  /** The loaded project data, null if not loaded or loading failed */
  project: Project | null;
  /** Whether project data is currently being loaded */
  loading: boolean;
  /** Error message if loading failed, null otherwise */
  error: string | null;
  /** Function to load project data by ID */
  loadProject: (id: string) => Promise<void>;
}
