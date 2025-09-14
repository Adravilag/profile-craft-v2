/**
 * Cargador centralizado de iconos SVG para skills
 * Maneja import.meta.glob con alias absolutos y mapeo de tecnologías
 */

// Simplified SVG loader: creates a map filename(base) -> URL using import.meta.glob
// This loader intentionally avoids aliases/variant generation and prefers direct
// filename matches (as defined in the JSON `svg` field) with a small set of
// deterministic fallbacks (slug, normalized variants).

// Cargar todos los SVGs con ruta absoluta (ejecutado una sola vez en build/runtime)
const svgModules = import.meta.glob('/src/assets/svg/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const normalizeKey = (name: string) =>
  name
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[_]+/g, '-')
    .replace(/[^a-z0-9-.]/g, '');

/**
 * Mapa simple: filename (sin extensión) normalizado -> url
 */
export const svgMap: Record<string, string> = Object.entries(svgModules).reduce(
  (acc, [path, url]) => {
    const match = path.match(/([^/]+)\.svg$/i);
    if (!match) return acc;

    const rawName = match[1];
    const key = normalizeKey(rawName);
    if (key && !acc[key]) acc[key] = url;

    return acc;
  },
  {} as Record<string, string>
);

/**
 * Alias manuales para tecnologías que no tienen SVG directo o necesitan mapeo especial
 * Actualizado después de la limpieza de SVGs duplicados
 */
// NOTE: TECH_ALIASES and variant generation were intentionally removed to simplify
// the loader (see .kiro/specs for design). If you need special mappings again,
// keep them in a small local map in the place where they're required (e.g. a
// migration script) rather than in the runtime loader.

/**
 * Busca el icono para un skill dado
 * @param canonical - Nombre canónico del skill
 * @param normalized - Nombre normalizado del skill
 * @returns URL del SVG o null si no se encuentra
 */
export const findSkillIcon = (canonical: string, normalized: string): string | null => {
  // Primary: try the canonical value as given (useful if it already matches
  // the filename in the JSON `svg` field).
  if (canonical) {
    const key = normalizeKey(canonical.replace(/\.svg$/i, ''));
    if (key && svgMap[key]) return svgMap[key];
  }

  // Secondary: try normalized slug/name
  if (normalized) {
    const k = normalizeKey(normalized.replace(/\.svg$/i, ''));
    if (k && svgMap[k]) return svgMap[k];
    // also try without dashes
    const nos = k.replace(/-/g, '');
    if (nos && svgMap[nos]) return svgMap[nos];
  }

  // No match found
  return null;
};

/**
 * Estadísticas del cargador de iconos (útil para debugging)
 */
export const getIconLoaderStats = () => {
  return {
    totalIcons: Object.keys(svgMap).length,
    // aliases removed in simplified loader
    totalAliases: 0,
    availableIcons: Object.values(svgMap).length,
  };
};

/**
 * Intenta resolver la URL de un SVG para una entrada de la semilla `skill_setings.json`.
 * Comprueba en este orden:
 *  - si `entry.svg` está presente, intenta buscar por nombre de archivo (sin extensión)
 *  - intenta usar `slug` o `name` normalizados usando `findSkillIcon`
 *  - genera variantes con `generateSkillVariants` y prueba cada una
 * Devuelve `null` si no se encuentra ninguna coincidencia.
 */
export const findIconForSeedEntry = (entry: {
  svg?: string;
  slug?: string;
  name?: string;
}): string | null => {
  if (!entry) return null;

  // 1) If JSON includes an explicit svg filename, try it first
  if (entry.svg && typeof entry.svg === 'string') {
    const fileBase = entry.svg.replace(/\.svg$/i, '').trim();
    const k = normalizeKey(fileBase);
    if (k && svgMap[k]) return svgMap[k];
  }

  // 2) Try slug then name
  const candidate = (entry.slug || entry.name || '').toString();
  const normalized = normalizeKey(candidate);
  if (normalized && svgMap[normalized]) return svgMap[normalized];

  // 3) fallback: try without dashes
  const withoutDashes = normalized.replace(/-/g, '');
  if (withoutDashes && svgMap[withoutDashes]) return svgMap[withoutDashes];

  return null;
};

/**
 * Mapear un array de entradas seed (ej. `skill_setings.json`) a un mapa de slug -> svgUrl
 * Solo incluye entradas que se hayan podido resolver.
 */
export const mapSeedToSvg = (seed: Array<{ svg?: string; slug?: string; name?: string }>) => {
  const out: Record<string, string> = {};
  if (!Array.isArray(seed)) return out;

  for (const entry of seed) {
    const slug =
      entry.slug ||
      (entry.name || '')
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');
    if (!slug) continue;
    const url = findIconForSeedEntry(entry);
    if (url) out[slug] = url;
  }

  return out;
};

/**
 * Utility wrapper: resolve an icon URL from a skill JSON entry.
 * Kept as a small ergonomic helper name (`resolveSkillIconFromJson`) per tasks.md.
 */
export const resolveSkillIconFromJson = (entry: {
  svg?: string;
  slug?: string;
  name?: string;
}): string | null => {
  return findIconForSeedEntry(entry);
};
