// Exportaciones del módulo Experience
export { default as ExperienceSection } from './ExperienceSection';
export { default as ExperienceCard } from './components/cards/ExperienceCard';
export { default as EducationCard } from './components/cards/EducationCard';
export { default as ChronologicalItem } from './components/items/ChronologicalItem';

// Componentes de administración reutilizables
export { AddExperienceForm, AddEducationForm } from './admin';

// Importar tipos de la API
import type { Experience as ApiExperience, Education as ApiEducation } from '@/types/api';
export type { ApiExperience as Experience, ApiEducation as Education };

// Interfaces locales - Las extendemos para mantener compatibilidad
export interface EducationLocal extends Partial<ApiEducation> {
  id?: number; // Propiedad para compatibilidad con código anterior
  _id: string;
  title: string;
  institution: string;
  start_date: string;
  end_date: string;
  description?: string;
  grade?: string;
}

export interface CombinedItem {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  description?: string;
  type: 'experience' | 'education';
  company?: string;
  institution?: string;
  technologies?: string[];
  grade?: string;
}
