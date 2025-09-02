import React from 'react';
import type { Experience } from '@/types/api';
import styles from './ChronologicalItem.module.css';
import { useTranslation } from '@/contexts/TranslationContext';
import ChronologicalCard from './ChronologicalCard';
import { useChronologicalItem } from './hooks/useChronologicalItem';

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
  onDelete?: (item: CombinedItem) => void;
}

const ChronologicalItem: React.FC<ChronologicalItemProps> = ({
  item,
  index,
  position,
  animationDelay = 0.15,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  // Usar el hook para manejar lógica del componente
  const {
    positionClass,
    animationDelay: hookAnimationDelay,
    timelineDate,
    typeIcon,
    handleEdit,
  } = useChronologicalItem(item, index, position, onEdit);

  return (
    <div
      className={`${styles.chronologicalItem} chronological-item ${styles[item.type]} ${item.type} ${styles[position]} ${position}`}
      style={{ animationDelay: hookAnimationDelay }}
    >
      <div className={styles.chronologicalMarker}>
        <div className={`${styles.markerDot} ${styles[item.type]}`}>
          <i className={typeIcon} />
        </div>
        <div className={styles.chronologicalYearExternal}>
          {timelineDate === new Date().getFullYear().toString() ? t.time.present : timelineDate}
        </div>
      </div>
      <div className={styles.cardWrapper}>
        <ChronologicalCard
          item={item}
          context="chronological"
          onEdit={handleEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};

export default ChronologicalItem;
