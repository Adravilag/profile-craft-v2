// Utilidades para resolver íconos de skills mediante SVG locales o fallback a clases de iconos
// Carga todos los SVG de src/assets/svg y construye un mapa de búsqueda robusto

// Lightweight skillIcons helper that avoids eager glob to prevent bundling all SVGs.
// It uses the centralized `svgMap` exported by the feature loader (which is a
// placeholder map of available keys) and provides the same normalization helpers.
import { getIconMap } from '@/features/skills/utils/iconLoader';

// normaliza un nombre a minúsculas y variantes útiles
const normalize = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/\s|\+/g, '-')
    .replace(/[^a-z0-9.-]/g, '');

// canonical para data-tech (coincide con selectores de skills-colors.css)
export const toDataTech = (name: string) =>
  normalize(name).replace(/js$/, 'dotjs').replace(/[._-]/g, '');

// Devuelve la URL pública normalizada del SVG si existe en el mapa de iconos
export function findSvgForName(name: string): string | null {
  if (!name) return null;
  const map = getIconMap();
  if (!map) return null;
  const normalized = normalize(String(name));
  const candidates = [
    normalized,
    normalized.replace(/-/g, ''),
    normalized.replace(/[.\-_]/g, ''),
    normalized.replace(/js$/, 'dotjs'),
    `${normalized}js`,
  ];
  for (const key of candidates) {
    const hit = map.get(key);
    if (hit) {
      // ensure leading slash for public consumption
      return hit.startsWith('/') ? hit : `/${hit}`;
    }
  }
  return null;
}

export type {};
