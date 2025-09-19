export function formatDateRange(
  from: string | Date,
  to?: string | Date,
  language: 'es' | 'en' = 'es'
) {
  // Month names per language
  const monthsByLang: Record<'es' | 'en', string[]> = {
    es: [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ],
    en: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
  };
  const months = monthsByLang[language] || monthsByLang.es;

  const parse = (v?: string | Date | undefined) => {
    if (!v) return null;
    if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
    if (typeof v === 'string') {
      // tratar valores que indican presente/actual
      if (/^\s*(presente|actualmente|actual|ahora|now)\s*$/i.test(v)) return 'PRESENT';

      // intentar parsear YYYY-MM-DD o YYYY-MM o cualquier cadena reconocible por Date
      const maybe = new Date(v);
      if (!isNaN(maybe.getTime())) return maybe;
      return null;
    }
    return null;
  };

  const presentByLang: Record<'es' | 'en', string> = { es: 'Presente', en: 'Present' };
  const fmt = (d: Date | 'PRESENT' | null) => {
    if (!d) return '';
    if (d === 'PRESENT') return presentByLang[language] || presentByLang.es;
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  try {
    const fDate = parse(from);
    const tDate = parse(to as any);
    const fStr = fmt(fDate as any);
    const tStr = fmt(tDate as any);
    return tStr ? `${fStr} - ${tStr}` : fStr || '';
  } catch (e) {
    // fallback a formato original en caso de error
    const f = typeof from === 'string' ? from : from.toISOString().slice(0, 10);
    const t = to ? (typeof to === 'string' ? to : to.toISOString().slice(0, 10)) : '';
    return t ? `${f} - ${t}` : f;
  }
}

export function calculateDuration(from: string | Date, to?: string | Date) {
  // Backwards-compatible: default to Spanish
  return calculateDurationInternal(from, to, 'es');
}

export function calculateDurationInternal(
  from: string | Date,
  to?: string | Date,
  language: 'es' | 'en' = 'es'
) {
  try {
    const start = typeof from === 'string' ? new Date(from) : from;
    const end =
      to && typeof to === 'string' && /presente|actual|now/i.test(to as string) === false
        ? new Date(to as string)
        : to && to instanceof Date
          ? to
          : new Date();

    const months = Math.max(
      0,
      (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
    );
    const y = Math.floor(months / 12);
    const m = months % 12;

    // localization tokens
    const tokensByLang: Record<
      'es' | 'en',
      {
        month: (n: number) => string;
        year: (n: number) => string;
        compact: (y: number, m: number) => string;
      }
    > = {
      es: {
        month: (n: number) => `${n} ${n === 1 ? 'mes' : 'meses'}`,
        year: (n: number) => `${n} ${n === 1 ? 'año' : 'años'}`,
        compact: (yy: number, mm: number) => `${yy}a ${mm}m`,
      },
      en: {
        month: (n: number) => `${n} ${n === 1 ? 'month' : 'months'}`,
        year: (n: number) => `${n} ${n === 1 ? 'year' : 'years'}`,
        compact: (yy: number, mm: number) => `${yy}y ${mm}m`,
      },
    };

    const tokens = tokensByLang[language] || tokensByLang.es;

    if (months === 0) return tokens.month(0);
    if (y === 0) return tokens.month(m);
    if (m === 0) return tokens.year(y);
    return tokens.compact(y, m);
  } catch (e) {
    return '';
  }
}

export function formatDateFromInput(input: string) {
  // accept YYYY-MM-DD and return same for now
  return input;
}

export function convertSpanishDateToISO(spanish: string) {
  if (!spanish) return '';
  const s = spanish.trim();

  // Treat common tokens as-is
  if (/^(presente|actualmente|actual|ahora|now)$/i.test(s)) return s;

  // Already ISO-like (YYYY-MM-DD)
  // Already ISO-like (YYYY-MM-DD) or year-month (YYYY-MM)
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{4}-\d{2}$/.test(s)) return s;

  // Match dd-mm-yyyy or dd/mm/yyyy
  const m = s.match(/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/);
  if (m) {
    const [, dd, mm, yyyy] = m;
    return `${yyyy}-${mm}-${dd}`;
  }

  // Match 'mes de yyyy' or 'mes yyyy' in Spanish (e.g. 'junio de 2024' or 'junio 2024')
  const months = {
    enero: '01',
    febrero: '02',
    marzo: '03',
    abril: '04',
    mayo: '05',
    junio: '06',
    julio: '07',
    agosto: '08',
    septiembre: '09',
    octubre: '10',
    noviembre: '11',
    diciembre: '12',
  } as Record<string, string>;

  const mmMatch = s.match(/^([A-Za-zÀ-ÿ]+)\s+(?:de\s+)?(\d{4})$/i);
  if (mmMatch) {
    const [, monthName, yyyy] = mmMatch;
    const key = monthName.toLowerCase();
    if (months[key]) {
      return `${yyyy}-${months[key]}-01`;
    }
  }

  // Fallback: try Date parse and return ISO date if valid
  try {
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  } catch (e) {
    // noop
  }

  // Last resort: return original string
  return s;
}
