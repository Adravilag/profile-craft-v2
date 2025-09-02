export function formatDateRange(from: string | Date, to?: string | Date) {
  // Mostrar nombres de mes en español: e.g. "junio 2024 - noviembre 2024"
  const months = [
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
  ];

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

  const fmt = (d: Date | 'PRESENT' | null) => {
    if (!d) return '';
    if (d === 'PRESENT') return 'Presente';
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
  // Devuelve duración legible en español.
  // - si < 12 meses: 'X mes(es)'
  // - si >= 12 y sin meses adicionales: 'Y año(s)'
  // - si >=12 y con meses: 'Ya Mm' (ej. '2a 3m')
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

    if (months === 0) return `0 meses`;
    if (y === 0) return `${m} ${m === 1 ? 'mes' : 'meses'}`;
    if (m === 0) return `${y} ${y === 1 ? 'año' : 'años'}`;
    return `${y}a ${m}m`;
  } catch (e) {
    return '';
  }
}

export function formatDateFromInput(input: string) {
  // accept YYYY-MM-DD and return same for now
  return input;
}

export function convertSpanishDateToISO(spanish: string) {
  // naive passthrough
  return spanish;
}
