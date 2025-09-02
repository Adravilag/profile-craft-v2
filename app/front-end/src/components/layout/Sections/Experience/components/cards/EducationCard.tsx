import React from 'react';
import ChronologicalCard from '../items/ChronologicalCard';
import { useEducationCard } from './hooks/useEducationCard';

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

interface EducationCardProps {
  education: Education;
  index: number;
  animationDelay?: number;
  showDuration?: boolean;
  onEdit?: (item: any) => void;
}

const EducationCard: React.FC<EducationCardProps> = ({
  education,
  index,
  animationDelay = 0.1,
  onEdit,
}) => {
  // Usar el hook para manejar lógica del componente
  const { formattedItem, handleEdit } = useEducationCard({
    education,
    index,
    animationDelay,
    onEdit,
  });

  return <ChronologicalCard item={formattedItem} context="education" onEdit={handleEdit} />;
};

export default EducationCard;
