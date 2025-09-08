import { useMemo, useCallback } from 'react';
import { useExperience } from './useExperience';
import { useEducation } from './useEducation';
import type { Experience, Education } from '@/types/api';

// Tipos para datos unificados
interface ChronologicalItem {
  _id: string;
  id?: number;
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

interface ExperienceSectionStats {
  experienceCount: number;
  educationCount: number;
  technologiesCount: number;
}

export const useExperienceSection = () => {
  const {
    experiences,
    loading: experiencesLoading,
    error: experiencesError,
    retryCount,
    create: createExperience,
    update: updateExperience,
    remove: removeExperience,
    retry: retryExperiences,
    refresh: refreshExperiences,
  } = useExperience();

  const {
    education,
    loading: educationLoading,
    error: educationError,
    create: createEducation,
    update: updateEducation,
    remove: removeEducation,
    refresh: refreshEducation,
  } = useEducation();

  // Estados combinados
  const loading = experiencesLoading || educationLoading;
  const error = experiencesError || educationError;

  // Función para parsear fechas para ordenamiento
  const parseDate = useCallback((dateString: string | null | undefined): number => {
    if (!dateString || dateString.trim() === '') {
      return 0;
    }

    if (dateString === 'Presente') {
      return new Date().getFullYear() * 12 + new Date().getMonth();
    }

    if (/^\d{4}$/.test(dateString)) {
      return parseInt(dateString) * 12;
    }

    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    const parts = dateString.split(' ');
    if (parts.length >= 2) {
      const [monthStr, yearStr] = parts;
      const monthIndex = months.indexOf(monthStr);
      const year = parseInt(yearStr);

      if (monthIndex !== -1 && !isNaN(year)) {
        return year * 12 + monthIndex;
      }
    }

    const fallbackYear = parseInt(dateString);
    return !isNaN(fallbackYear) ? fallbackYear * 12 : 0;
  }, []);

  // Datos cronológicos combinados y ordenados
  const chronologicalData = useMemo((): ChronologicalItem[] => {
    const combinedItems: ChronologicalItem[] = [
      ...(Array.isArray(experiences) ? experiences : []).map(exp => ({
        _id: exp._id || '',
        title: exp.position,
        start_date: exp.start_date,
        end_date: exp.end_date || '',
        description: exp.description,
        type: 'experience' as const,
        company: exp.company,
        technologies: exp.technologies,
      })),
      ...(Array.isArray(education) ? education : []).map(edu => ({
        _id: (edu._id || edu.id)?.toString() || '',
        id: typeof edu.id === 'number' ? edu.id : undefined,
        title: edu.title,
        start_date: edu.start_date,
        end_date: edu.end_date,
        description: edu.description,
        type: 'education' as const,
        institution: edu.institution,
        grade: edu.grade,
      })),
    ];

    return combinedItems.sort((a, b) => {
      const dateA = a.end_date ? parseDate(a.end_date) : 0;
      const dateB = b.end_date ? parseDate(b.end_date) : 0;
      return dateB - dateA; // Descendente (más reciente primero)
    });
  }, [experiences, education, parseDate]);

  // Estadísticas
  const stats = useMemo((): ExperienceSectionStats => {
    const experienceCount = Array.isArray(experiences) ? experiences.length : 0;
    const educationCount = Array.isArray(education) ? education.length : 0;
    const technologiesCount = Array.isArray(experiences)
      ? experiences.reduce((acc, exp) => acc + (exp.technologies?.length || 0), 0)
      : 0;

    return {
      experienceCount,
      educationCount,
      technologiesCount,
    };
  }, [experiences, education]);

  // Función para actualizar todos los datos
  const refreshAll = useCallback(async () => {
    await Promise.all([refreshExperiences(), refreshEducation()]);
  }, [refreshExperiences, refreshEducation]);

  return {
    // Datos
    experiences,
    education,
    chronologicalData,

    // Estados
    loading,
    error,
    retryCount,
    stats,

    // Acciones de experiencia
    createExperience,
    updateExperience,
    removeExperience,
    retryExperiences,

    // Acciones de educación
    createEducation,
    updateEducation,
    removeEducation,

    // Acciones generales
    refreshAll,
  } as const;
};

export type { ChronologicalItem, ExperienceSectionStats };
export default useExperienceSection;
