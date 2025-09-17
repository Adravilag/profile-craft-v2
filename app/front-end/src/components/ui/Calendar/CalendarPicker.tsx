import React, { useState, useMemo } from 'react';
import styles from './CalendarPicker.module.css';

interface PickerProps {
  // initial can be a Date or a string in 'YYYY-MM' format
  initial?: Date | string | null;
  // onSelect returns a string in 'YYYY-MM' format or null when cleared
  onSelect?: (d: string | null) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  className?: string;
  disabled?: boolean;
}

const CalendarPicker: React.FC<PickerProps> = ({
  initial = null,
  onSelect,
  placeholder = 'DD-MM-YYYY',
  id,
  name,
  className,
  disabled = false,
}) => {
  // internal value stored as 'YYYY-MM' string or empty
  const [monthValue, setMonthValue] = useState<string | ''>(() => {
    if (!initial) return '';
    if (initial instanceof Date) {
      const y = initial.getFullYear();
      const m = String(initial.getMonth() + 1).padStart(2, '0');
      return `${y}-${m}`;
    }
    // assume string in 'YYYY-MM' or other parseable
    const s = String(initial);
    // Accept 'DD-MM-YYYY' (legacy) -> convert to YYYY-MM
    if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
      const [d, m, y] = s.split('-');
      return `${y}-${m}`;
    }
    if (/^\d{4}-\d{2}$/.test(s)) return s;
    // attempt to parse as Date and fallback to YYYY-MM
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      return `${y}-${m}`;
    }
    return '';
  });

  return (
    <div className={styles.pickerWrapper}>
      <input
        type="month"
        id={id}
        name={name}
        value={monthValue}
        onChange={e => {
          const v = e.target.value; // 'YYYY-MM' or empty
          const newVal = v || '';
          setMonthValue(newVal);
          onSelect && onSelect(newVal || null);
        }}
        placeholder={placeholder}
        className={className || styles.pickerInput}
        aria-label="month"
        disabled={disabled}
      />
    </div>
  );
};

export default CalendarPicker;
