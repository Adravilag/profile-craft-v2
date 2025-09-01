import React, { useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import styles from './DateInput.module.css';

interface DateInputProps {
  value?: string;
  onChange: (v: string) => void;
  name?: string;
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

const DateInput: React.FC<DateInputProps> = ({
  value = '',
  onChange,
  name,
  placeholder,
  ariaLabel,
  disabled,
}) => {
  const ref = useRef<HTMLInputElement | null>(null);
  const fp = useRef<any>(null);

  useEffect(() => {
    if (!ref.current) return;
    fp.current = flatpickr(ref.current, {
      allowInput: true,
      dateFormat: 'd-m-Y',
      // flatpickr can parse strings matching dateFormat; normalize slashes to dashes
      defaultDate: value ? value.replace(/\//g, '-') : undefined,
      onChange: (selectedDates: Date[]) => {
        if (selectedDates.length > 0) {
          const d = selectedDates[0];
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const year = d.getFullYear();
          onChange(`${day}-${month}-${year}`);
        }
      },
      onClose: () => {
        // when user types manual date, flatpickr doesn't always fire onChange; normalize value
        const val = ref.current?.value || '';
        if (val) onChange(val.replace(/\//g, '-'));
      },
    });

    return () => {
      try {
        fp.current?.destroy();
      } catch (e) {
        /* noop */
      }
      fp.current = null;
    };
  }, []);

  useEffect(() => {
    // keep input value in sync when external value changes
    if (ref.current && ref.current.value !== value) {
      ref.current.value = value;
    }
  }, [value]);

  return (
    <div className={styles.wrapper}>
      <input
        ref={ref}
        name={name}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={styles.input}
        disabled={disabled}
      />
      <button type="button" className={styles.icon} aria-hidden>
        📅
      </button>
    </div>
  );
};

export default DateInput;
