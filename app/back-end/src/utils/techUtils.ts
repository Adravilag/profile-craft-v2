export const normalizeTechSlug = (s: unknown): string => {
  if (!s && s !== 0) return '';
  const str = String(s || '')
    .toLowerCase()
    .trim();
  // replace spaces with hyphens, remove invalid chars, collapse multiple hyphens
  return str
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
    .replace(/-+/g, '-');
};

export const normalizeTechnologiesArray = (arr?: unknown): string[] => {
  if (!Array.isArray(arr)) return [];
  const normalized: string[] = [];
  for (const item of arr) {
    const s = normalizeTechSlug(item);
    if (!s) continue;
    if (!normalized.includes(s)) normalized.push(s);
  }
  return normalized;
};

export default {
  normalizeTechSlug,
  normalizeTechnologiesArray,
};
