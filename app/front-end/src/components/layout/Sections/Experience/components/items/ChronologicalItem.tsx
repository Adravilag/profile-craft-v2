import React from 'react';
import type { Experience } from '@/types/api';
import { formatDateFromInput } from '@/utils/dateUtils';
import styles from './ChronologicalItem.module.css';
import { useTranslation } from '@/contexts/TranslationContext';
import ChronologicalCard from './ChronologicalCard';

interface Education {
  id?: number; // Para compatibilidad con código antiguo
  _id?: string; // ID de MongoDB
  title: string;
  institution: string;
  start_date: string;
  end_date: string;
  description?: string;
  grade?: string;
}

interface CombinedItem extends Partial<Experience & Education> {
  _id: string; // ID de MongoDB
  id?: number; // Para compatibilidad con código antiguo
  title: string;
  start_date: string;
  end_date: string;
  description?: string;
  type: 'experience' | 'education';
  company?: string;
  institution?: string;
  technologies?: string[];
  grade?: string;
}

interface ChronologicalItemProps {
  item: CombinedItem;
  index: number;
  position: 'left' | 'right';
  animationDelay?: number;
  onEdit?: (item: CombinedItem) => void;
}

const ChronologicalItem: React.FC<ChronologicalItemProps> = ({
  item,
  index,
  position,
  animationDelay = 0.15,
  onEdit,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={`${styles.chronologicalItem} chronological-item ${styles[item.type]} ${item.type} ${styles[position]} ${position}`}
      style={{ animationDelay: `${index * animationDelay}s` }}
    >
      <div className={styles.chronologicalMarker}>
        <div className={`${styles.markerDot} ${styles[item.type]}`}>
          <i
            className={item.type === 'experience' ? 'fas fa-briefcase' : 'fas fa-graduation-cap'}
          />
        </div>
        <div className={styles.chronologicalYearExternal}>
          {formatDateFromInput(item.end_date) || t.time.present}
        </div>
      </div>
      <ChronologicalCard item={item} context="chronological" onEdit={onEdit} />
    </div>
  );
};

export default ChronologicalItem;
