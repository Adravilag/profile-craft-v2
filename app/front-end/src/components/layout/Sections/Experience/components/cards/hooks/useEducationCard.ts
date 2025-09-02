import { useState, useCallback, useMemo } from 'react';

interface Education {
  _id?: string;
  id?: number | string;
  title: string;
  institution: string;
  start_date: string;
  end_date: string;
  description?: string;
  grade?: string;
}

interface UseEducationCardParams {
  education: Education;
  index: number;
  animationDelay?: number;
  onEdit?: (item: any) => void;
}

interface UseEducationCardReturn {
  isHovered: boolean;
  formattedDateRange: string;
  animationDelay: string;
  gradeDisplay: string;
  formattedItem: any;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  handleEdit: () => void;
}

export const useEducationCard = ({
  education,
  index = 0,
  animationDelay = 0.1,
  onEdit,
}: UseEducationCardParams): UseEducationCardReturn => {
  // Estado de hover
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Handlers para eventos del mouse
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Formatear rango de fechas
  const formattedDateRange = useMemo(() => {
    const startYear = new Date(education.start_date).getFullYear();
    const endYear = education.end_date ? new Date(education.end_date).getFullYear() : 'Present';
    return `${startYear} - ${endYear}`;
  }, [education.start_date, education.end_date]);

  // Calcular delay de animación
  const calculatedAnimationDelay = useMemo(() => {
    const delay = Math.round(animationDelay * (index + 1) * 100) / 100;
    return `${delay}s`;
  }, [animationDelay, index]);

  // Formatear display de grado
  const gradeDisplay = useMemo(() => {
    return education.grade ? `Grade: ${education.grade}` : '';
  }, [education.grade]);

  // Item formateado para ChronologicalCard
  const formattedItem = useMemo(() => {
    return {
      _id: education._id || String(education.id) || `edu-${index}`,
      id: education.id,
      title: education.title,
      start_date: education.start_date,
      end_date: education.end_date,
      description: education.description,
      type: 'education' as const,
      institution: education.institution,
      grade: education.grade,
      animationDelay: calculatedAnimationDelay,
    };
  }, [education, index, calculatedAnimationDelay]);

  // Handler para editar
  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(formattedItem);
    }
  }, [onEdit, formattedItem]);

  return {
    isHovered,
    formattedDateRange,
    animationDelay: calculatedAnimationDelay,
    gradeDisplay,
    formattedItem,
    handleMouseEnter,
    handleMouseLeave,
    handleEdit,
  };
};
