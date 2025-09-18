// types/skills.ts

// Extensión para CSS custom properties
declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}

export type SortOption =
  | 'alphabetical'
  | 'alphabetical_desc'
  | 'difficulty'
  | 'difficulty_desc'
  | 'level'
  | 'level_desc';

export interface SkillIconData {
  name: string;
  svg_path: string;
  type?: string;
  category?: string;
  color?: string;
  docs_url?: string;
  official_repo?: string;
  difficulty_level?: string;
}

export interface ExternalSkillData {
  popularity?: string;
  difficulty?: string;
  description?: string;
  links?: Array<{
    title: string;
    url: string;
    type?: string;
  }>;
  first_appeared?: string;
  paradigm?: string;
  license?: string;
  last_updated?: string;
}

export interface SkillFormData {
  name: string;
  category: string;
  svg_path?: string;
  level: number;
  featured?: boolean;
}

export interface SkillCardProps {
  skill: any; // Usar el tipo Skill de api.ts
  skillsIcons: SkillIconData[];
  onEdit: (skill: any) => void;
  onDelete: (id: number) => void;
  onDragStart: (id: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (id: number) => void;
  isDragging: boolean;
  isAdmin?: boolean;
}

export interface CategoryFiltersProps {
  categories?: string[];
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  skillsGrouped?: Record<string, any[]>;
  forceVisible?: boolean; // Para testing
}

export interface SkillsGridProps {
  filteredGrouped: Record<string, any[]>;
  skillsIcons: SkillIconData[];
  iconsLoading?: boolean;
  draggedSkillId: number | null;
  onEdit: (skill: any) => void;
  onDelete: (id: number) => void;
  onDragStart: (id: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (id: number) => void;
  selectedSort?: Record<string, SortOption>; // Ordenamiento por categoría
  sortingClass?: string;
  onSortToggle?: (category: string, sortType?: SortOption) => void;
  onCategoryExpand?: (category: string) => void; // Nueva prop para expansión de categorías
  isAdmin?: boolean;
}

export interface SkillModalProps {
  isOpen: boolean;
  editingId: number | string | null;
  formData: SkillFormData;
  skillNames?: string[]; // Opcional para mantener compatibilidad
  skillsIcons: SkillIconData[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onFormChangeWithIcon?: (updates: Partial<SkillFormData & { svg_path?: string }>) => void;
  isAdmin?: boolean;
  /** Opcionales: permiten ajustar el tamaño máximo del modal desde el consumidor */
  maxWidth?: string | number;
  maxHeight?: string | number;
}

// Tipo para resultados de LogoHub API (basado en documentación oficial)
export interface LogoHubResult {
  id: string;
  name: string;
  description?: string;
  website?: string;
  category?: string;
  tags?: string[];
  colors?: {
    primary: string;
    secondary?: string;
  };
  files: {
    svg: string;
    png?: string;
  };
  slug?: string;
  variants?: Record<string, string>;
  created?: string;
}

// Respuesta completa de la API LogoHub
export interface LogoHubApiResponse {
  logos: LogoHubResult[];
  total: number;
  page: {
    limit: number;
    offset: number;
  };
}

// Error response de LogoHub
export interface LogoHubError {
  error: {
    code: number;
    message: string;
    details?: string;
  };
}
