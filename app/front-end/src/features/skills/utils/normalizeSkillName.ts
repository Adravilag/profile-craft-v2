/**
 * Normaliza nombres de skills para búsqueda consistente de iconos y recursos
 * Unifica la lógica de normalización entre SkillPill y skillResources
 */

export interface NormalizedSkill {
  /** Nombre normalizado con guiones, sin espacios ni caracteres especiales */
  normalized: string;
  /** Versión canónica sin separadores para matching de iconos */
  canonical: string;
  /** Nombre original sin modificar */
  original: string;
}

/**
 * Normaliza un nombre de skill para búsqueda consistente
 * @param raw - Nombre original del skill
 * @returns Objeto con versiones normalizadas del nombre
 */
export const normalizeSkillName = (raw: string): NormalizedSkill => {
  const name = (raw || '').toString().trim().toLowerCase();

  // Normalizar: espacios y + a guiones, quitar caracteres no válidos
  const normalized = name.replace(/\s|\+/g, '-').replace(/[^a-z0-9.-]/g, '');

  // Canónico: sin separadores, manejo especial para .js
  const canonical = normalized.replace(/js$/, 'dotjs').replace(/[._-]/g, '');

  return {
    normalized,
    canonical,
    original: raw,
  };
};

/**
 * Genera variantes de un nombre normalizado para búsqueda de iconos
 * @param normalized - Nombre normalizado
 * @returns Array de variantes para buscar
 */
export const generateSkillVariants = (normalized: string): string[] => {
  const variants = new Set<string>([
    normalized,
    // sin separadores
    normalized.replace(/[-_.]/g, ''),
    // sin guiones
    normalized.replace(/-/g, ''),
    // sin puntos
    normalized.replace(/\./g, ''),
    // lowercase original
    normalized.toLowerCase(),
    normalized.toLowerCase().replace(/\s+/g, ''),
  ]);

  return Array.from(variants).filter(Boolean);
};
