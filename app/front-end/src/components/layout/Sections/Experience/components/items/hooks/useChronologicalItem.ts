import { useState, useCallback, useMemo } from 'react';

interface ChronologicalItem {
  _id: string;
  title: string;
  start_date: string;
  end_date: string;
  description?: string;
  type: 'experience' | 'education';
  company?: string;
  institution?: string;
  technologies?: string[];
}

type Position = 'left' | 'right';

interface UseChronologicalItemReturn {
  isVisible: boolean;
  isAnimating: boolean;
  isHovered: boolean;
  positionClass: string;
  animationDelay: string;
  timelineDate: string;
  typeIcon: string;
  triggerAnimation: () => void;
  handleEdit: () => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
}

export const useChronologicalItem = (
  item: ChronologicalItem,
  index: number,
  position: Position,
  onEdit?: (item: ChronologicalItem) => void
): UseChronologicalItemReturn => {
  // Estados de animación y hover
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Función para activar la animación
  const triggerAnimation = useCallback(() => {
    setIsVisible(true);
    setIsAnimating(true);

    // Desactivar el estado de animación después de un tiempo
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  }, []);

  // Handlers para eventos de mouse
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Handler para edición
  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(item);
    }
  }, [item, onEdit]);

  // Clase CSS para posicionamiento
  const positionClass = useMemo(() => {
    return `chronological-item-${position}`;
  }, [position]);

  // Delay de animación basado en índice
  const animationDelay = useMemo(() => {
    return `${index * 100}ms`;
  }, [index]);

  // Fecha para el timeline
  const timelineDate = useMemo(() => {
    // Extraer el año de la fecha de fin, o de inicio si no hay fecha de fin
    const dateStr = item.end_date || item.start_date;
    const year = new Date(dateStr).getFullYear();
    return year.toString();
  }, [item.start_date, item.end_date]);

  // Icono según el tipo de item
  const typeIcon = useMemo(() => {
    return item.type === 'experience' ? 'fas fa-briefcase' : 'fas fa-graduation-cap';
  }, [item.type]);

  return {
    isVisible,
    isAnimating,
    isHovered,
    positionClass,
    animationDelay,
    timelineDate,
    typeIcon,
    triggerAnimation,
    handleEdit,
    handleMouseEnter,
    handleMouseLeave,
  };
};

export default useChronologicalItem;
