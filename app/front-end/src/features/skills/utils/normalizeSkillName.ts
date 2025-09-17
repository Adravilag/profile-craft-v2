// Utilities to normalize skill names for lookup and generate variants
export function normalizeSkillName(input: string | null) {
  const original = input === null ? null : String(input);
  if (input === null) return { original: null } as any;

  const trimmed = original.trim();
  if (trimmed === '') return { original, normalized: '', canonical: '' };

  const lower = trimmed.toLowerCase();

  // Build normalized version: keep dots (for .js), convert spaces to '-', convert + to '-', remove #
  // IMPORTANT: do NOT collapse or trim repeated hyphens introduced by consecutive '+' characters
  let normalized = lower
    .replace(/#/g, '') // remove hash sign
    .replace(/\+/g, '-') // plus -> hyphen (keep duplicates)
    .replace(/\s+/g, '-') // spaces -> hyphen
    // Replace other punctuation (except dot and hyphen) with hyphen
    .replace(/[^a-z0-9.\-]/g, '-')
    // trim leading/trailing dots but keep hyphens produced by pluses (so C++ -> c--)
    .replace(/^\.+|\.+$/g, '');

  // canonical: remove hyphens, convert dots to 'dot', and strip any non-alphanum
  const canonical = normalized
    // convert dot to word but then strip non-alphanum so 'c--' -> 'c'
    .replace(/\./g, 'dot')
    .replace(/[-_]/g, '')
    .replace(/[^a-z0-9]/g, '');

  return { original, normalized, canonical };
}

export function generateSkillVariants(normalizedName: string) {
  if (!normalizedName) return [];
  const variants = new Set<string>();

  variants.add(normalizedName);
  // without hyphens
  variants.add(normalizedName.replace(/-/g, ''));
  // dot -> dot word
  variants.add(normalizedName.replace(/\./g, 'dot'));
  // remove dots
  variants.add(normalizedName.replace(/\./g, ''));

  return Array.from(variants).filter(Boolean);
}

export default normalizeSkillName;
