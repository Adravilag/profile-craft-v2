import React from 'react';
import SkillPill from '@/components/ui/SkillPill/SkillPill';

interface TechItem {
  slug: string;
  name?: string;
}

interface TechnologyChipsProps {
  items: TechItem[];
  onRemove?: (slugOrIndex: string | number) => void;
  colored?: boolean;
  closable?: boolean;
  containerClassName?: string;
  itemClassName?: string;
}

const TechnologyChips: React.FC<TechnologyChipsProps> = ({
  items,
  onRemove,
  colored = true,
  closable = true,
  containerClassName = '',
  itemClassName = '',
}) => {
  return (
    <div
      className={containerClassName}
      role="list"
      style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}
    >
      {items.map((it, idx) => (
        <div key={it.slug || idx} style={{ display: 'inline-flex' }}>
          <SkillPill
            slug={it.slug}
            colored={colored}
            closable={!!onRemove && closable}
            onClose={() => onRemove && onRemove(it.slug)}
            className={itemClassName}
          />
        </div>
      ))}
    </div>
  );
};

export default TechnologyChips;
