import React from 'react';
import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css'; // CSS removido si no existe
import styles from './Calendar.module.css';

interface CalendarProps {
  selectedDate: Date | string | null;
  onChange: (date: Date | null) => void;
  dateFormat?: string;
  placeholderText?: string;
  className?: string;
  showMonthYearPicker?: boolean;
  disabled?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onChange,
  dateFormat = 'dd-MM-yyyy',
  placeholderText = 'DD-MM-YYYY',
  className = '',
  showMonthYearPicker = false,
  disabled = false,
}) => {
  const parseDateSafe = (value: Date | string | null): Date | null => {
    if (value === null || value === undefined || value === '') return null;
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
    if (typeof value === 'string') {
      const s = value.trim();
      // Match formats: DD-MM-YYYY, DD/MM/YYYY
      const dmY = /^([0-3]?\d)[-/]([0-1]?\d)[-/](\d{4})$/;
      const yM = /^(\d{4})-([0-1]?\d)$/; // YYYY-MM
      const yMd = /^(\d{4})[-/](\d{2})[-/](\d{2})$/; // YYYY-MM-DD or ISO
      let m;
      if ((m = dmY.exec(s))) {
        const day = Number(m[1]);
        const month = Number(m[2]) - 1;
        const year = Number(m[3]);
        const d = new Date(year, month, day);
        return isNaN(d.getTime()) ? null : d;
      }
      if ((m = yM.exec(s))) {
        const year = Number(m[1]);
        const month = Number(m[2]) - 1;
        const d = new Date(year, month, 1);
        return isNaN(d.getTime()) ? null : d;
      }
      if ((m = yMd.exec(s))) {
        const year = Number(m[1]);
        const month = Number(m[2]) - 1;
        const day = Number(m[3]);
        const d = new Date(year, month, day);
        return isNaN(d.getTime()) ? null : d;
      }
      const parsed = new Date(s);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  };

  const safeSelected = parseDateSafe(selectedDate as any);

  return (
    <div className={`${styles.calendarWrapper} ${className}`}>
      <DatePicker
        selected={safeSelected}
        onChange={onChange}
        dateFormat={dateFormat}
        placeholderText={placeholderText}
        showMonthYearPicker={showMonthYearPicker}
        className={styles.datePickerInput}
        disabled={Boolean(disabled)}
      />
    </div>
  );
};

export default Calendar;
