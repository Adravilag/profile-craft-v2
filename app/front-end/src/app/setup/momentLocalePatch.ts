import dayjs from 'dayjs';
import 'dayjs/locale/es';

export type MomentLocaleOptions = {
  locale?: string;
};

export const setupMomentLocalePatch = (opts: MomentLocaleOptions = {}): void => {
  if (typeof dayjs === 'undefined') return;

  const locale = opts.locale || 'es';
  try {
    // dayjs requiere importar el locale y luego invocar locale()
    (dayjs as any).locale(locale);
  } catch (err) {
    if (
      (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') ||
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV)
    ) {
      // eslint-disable-next-line no-console
      console.warn('[setupMomentLocalePatch] failed to set locale', locale, err);
    }
  }
};
