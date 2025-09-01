import React from 'react';
import type { Experience } from '@/types/api';
import TimelineCard from './TimelineCard';

interface ExperienceCardProps {
  experience: Experience;
  index: number;
  animationDelay?: number;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({
  experience,
  index,
  animationDelay = 0.1,
}) => {
  // Experience object is passed to TimelineCard which will derive dates, images and techs

  return <TimelineCard experience={experience} index={index} animationDelay={animationDelay} />;
};

export default ExperienceCard;
