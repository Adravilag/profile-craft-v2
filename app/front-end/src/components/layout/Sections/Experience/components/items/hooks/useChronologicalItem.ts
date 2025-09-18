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
  isPresent: boolean;
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
    const dateStr = item.end_date || item.start_date || '';
    // Validar cadena antes de construir Date
    const parsed = Date.parse(dateStr);
    if (isNaN(parsed)) {
      // Si no se puede parsear, devolver cadena vacía para evitar mostrar el año actual por defecto
      return '';
    }
    const year = new Date(parsed).getFullYear();
    return year.toString();
  }, [item.start_date, item.end_date]);

  // Determinar si el item representa una experiencia actual/presente
  const isPresent = useMemo(() => {
    // Si existe la bandera explícita en el backend (ej. is_current)
    const anyItem = item as any;
    if (anyItem && anyItem.is_current === true) return true;

    // Si end_date contiene una palabra que indica presente
    const end = (item.end_date || '').trim();
    if (!end) return false;

    // Detectar palabras como 'presente', 'actual', 'ahora', 'now'
    if (/^(presente|actualmente|actual|ahora|now)$/i.test(end)) return true;

    return false;
  }, [item.end_date, item]);

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
    isPresent,
    typeIcon,
    triggerAnimation,
    handleEdit,
    handleMouseEnter,
    handleMouseLeave,
  };
};

export default useChronologicalItem;
