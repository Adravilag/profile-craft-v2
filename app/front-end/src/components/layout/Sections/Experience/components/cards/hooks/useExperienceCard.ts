import { useState, useCallback, useMemo } from 'react';
import type { Experience } from '@/types/api';

interface UseExperienceCardParams {
  experience: Experience;
  index: number;
  animationDelay?: number;
  onEdit?: (item: any) => void;
}

interface UseExperienceCardReturn {
  isHovered: boolean;
  formattedDateRange: string;
  animationDelay: string;
  technologiesList: string[];
  formattedItem: any; // Item formateado para ChronologicalCard
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  handleEdit: () => void;
}

export const useExperienceCard = ({
  experience,
  index = 0,
  animationDelay = 0.1,
  onEdit,
}: UseExperienceCardParams): UseExperienceCardReturn => {
  // Estado de hover
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Handlers para eventos del mouse
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Item formateado para ChronologicalCard
  const formattedItem = useMemo(() => {
    return {
      _id: experience._id || String(experience.id) || `exp-${index}`,
      id: experience.id,
      title: experience.position,
      start_date: experience.start_date,
      end_date: experience.end_date || '',
      description: experience.description,
      type: 'experience' as const,
      company: experience.company,
      technologies: experience.technologies,
    };
  }, [experience, index]);

  // Handler para edición
  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(formattedItem);
    }
  }, [formattedItem, onEdit]);

  // Formateo de rango de fechas
  const formattedDateRange = useMemo(() => {
    const startDate = experience.start_date;
    const endDate = experience.end_date || (experience.is_current ? 'Presente' : '');

    if (endDate) {
      return `${startDate} - ${endDate}`;
    }

    return startDate;
  }, [experience.start_date, experience.end_date, experience.is_current]);

  // Delay de animación basado en índice y parámetro
  const animationDelayString = useMemo(() => {
    return `${index * (animationDelay * 1000)}ms`;
  }, [index, animationDelay]);

  // Lista de tecnologías
  const technologiesList = useMemo(() => {
    return experience.technologies || [];
  }, [experience.technologies]);

  return {
    isHovered,
    formattedDateRange,
    animationDelay: animationDelayString,
    technologiesList,
    formattedItem,
    handleMouseEnter,
    handleMouseLeave,
    handleEdit,
  };
};

export default useExperienceCard;
