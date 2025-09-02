import React from 'react';
import ChronologicalCard from '../items/ChronologicalCard';

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
  // Convertir education a CombinedItem para ChronologicalCard
  const combinedItem = {
    _id: education._id || String(education.id) || `edu-${index}`,
    id: education.id,
    title: education.title,
    start_date: education.start_date,
    end_date: education.end_date,
    description: education.description,
    type: 'education' as const,
    institution: education.institution,
    grade: education.grade,
  };

  return <ChronologicalCard item={combinedItem} context="education" onEdit={onEdit} />;
};

export default EducationCard;
