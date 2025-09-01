import React, { useState } from 'react';
import TimelineCard from './TimelineCard';

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
}

const EducationCard: React.FC<EducationCardProps> = ({
  education,
  index,
  animationDelay = 0.1,
}) => {
  // TimelineCard will derive dates, images and grade from the education object
  return <TimelineCard education={education} index={index} animationDelay={animationDelay} />;
};

export default EducationCard;
