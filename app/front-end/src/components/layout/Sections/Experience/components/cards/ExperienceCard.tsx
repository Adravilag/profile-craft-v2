import React from 'react';
import type { Experience } from '@/types/api';
import ChronologicalCard from '../items/ChronologicalCard';
import { useExperienceCard } from './hooks/useExperienceCard';

interface ExperienceCardProps {
  experience: Experience;
  index: number;
  animationDelay?: number;
  onEdit?: (item: any) => void;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({
  experience,
  index,
  animationDelay = 0.1,
  onEdit,
}) => {
  // Usar el hook para manejar lógica del componente
  const { isHovered, formattedItem, handleMouseEnter, handleMouseLeave, handleEdit } =
    useExperienceCard({
      experience,
      index,
      animationDelay,
      onEdit,
    });

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <ChronologicalCard item={formattedItem} context="experience" onEdit={handleEdit} />
    </div>
  );
};

export default ExperienceCard;
