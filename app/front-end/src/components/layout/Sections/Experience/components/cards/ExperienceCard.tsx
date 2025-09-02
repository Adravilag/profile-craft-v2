import React from 'react';
import type { Experience } from '@/types/api';
import ChronologicalCard from '../items/ChronologicalCard';

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
  // Convertir experience a CombinedItem para ChronologicalCard
  const combinedItem = {
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

  return <ChronologicalCard item={combinedItem} context="experience" onEdit={onEdit} />;
};

export default ExperienceCard;
