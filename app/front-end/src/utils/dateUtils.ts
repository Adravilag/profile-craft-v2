export function formatDateRange(from: string | Date, to?: string | Date) {
  const f = typeof from === 'string' ? from : from.toISOString().slice(0, 10);
  const t = to ? (typeof to === 'string' ? to : to.toISOString().slice(0, 10)) : '';
  return t ? `${f} - ${t}` : f;
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
