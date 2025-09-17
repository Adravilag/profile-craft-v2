// Helper utilities to resolve SkillPill props (slug, svg, name, color)
// from a selected technology item or a plain string, using the
// technology suggestions list as fallback.

export type SuggestionItem = { name?: string; slug?: string; svg?: string; color?: string };

export type ResolvedPill = {
  slug: string;
  svg?: string | undefined;
  name: string;
  color?: string | undefined;
};

/**
 * Resolve pill props from a selected technology value and suggestions.
 * - tech may be a string (name) or an object with optional fields.
 * - suggestions is an array of known items (from skill_settings.json).
 */
export function resolvePillFromTech(
  tech: any,
  suggestions: SuggestionItem[] | undefined,
  index?: number
): ResolvedPill {
  let name = '';
  let slug: string | undefined = undefined;
  let svg: string | undefined = undefined;
  let color: string | undefined = undefined;

  if (!tech) {
    name = `tech-${index ?? '0'}`;
  } else if (typeof tech === 'string') {
    name = tech;
  } else if (typeof tech === 'object') {
    name = tech.name || tech.slug || '';
    slug = tech.slug;
    svg = tech.svg;
    color = tech.color;
  }

  const lookup = (slug || name || '').toString().trim().toLowerCase();
  let suggested: SuggestionItem | undefined = undefined;
  if (Array.isArray(suggestions) && lookup) {
    suggested = suggestions.find(i => {
      if (!i) return false;
      const s1 = (i.slug || '').toString().toLowerCase();
      const s2 = (i.name || '').toString().toLowerCase();
      return s1 === lookup || s2 === lookup;
    });
  }

  const pillSvg = svg || suggested?.svg;
  const pillColor = color || suggested?.color;
  const pillSlug = (slug || suggested?.slug || name || `tech-${index ?? '0'}`).toString();
  const pillName = name || suggested?.name || pillSlug;

  return {
    slug: pillSlug,
    svg: pillSvg,
    name: pillName,
    color: pillColor,
  } as ResolvedPill;
}

export default resolvePillFromTech;
