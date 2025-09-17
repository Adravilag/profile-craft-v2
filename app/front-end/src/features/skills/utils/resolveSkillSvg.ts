import { getIconMap, getSkillIconEntry } from './iconLoader';
import { normalizeSvgPath } from './skillUtils';

/**
 * resolveSkillSvg - helper compatible para resolver la ruta pública de un SVG
 * a partir de un nombre/slug de tecnología. Intenta, en orden:
 * 1. Buscar entrada completa via getSkillIconEntry (json cargado)
 * 2. Buscar en el mapa de iconos (getIconMap)
 * 3. Normalizar un fallback basado en el nombre
 */
export function resolveSkillSvg(name?: string | null, existingSvg?: string | null): string {
  if (!name) return normalizeSvgPath('/assets/svg/generic-code.svg');

  // prefer explicit existingSvg if it looks like an svg path or data/blob
  if (
    existingSvg &&
    (existingSvg.includes('.svg') ||
      existingSvg.startsWith('data:') ||
      existingSvg.startsWith('blob:'))
  ) {
    return normalizeSvgPath(existingSvg);
  }

  // try full entry
  try {
    const entry = getSkillIconEntry(name);
    if (entry) {
      const p = (entry as any).svg_path || (entry as any).svg;
      if (p) return normalizeSvgPath(p);
    }
  } catch (e) {
    // noop
  }

  // try map
  try {
    const map = getIconMap();
    if (map) {
      const key = (name || '')
        .toString()
        .replace(/[^a-z0-9]/gi, '')
        .toLowerCase();
      const found =
        map.get(key) ||
        map.get(name.toString().toLowerCase()) ||
        map.get(name.toString().toLowerCase().replace(/\s+/g, '-'));
      if (found) return found.startsWith('/') ? found : `/${found}`;
    }
  } catch (e) {
    // noop
  }

  // fallback normalized
  return normalizeSvgPath(name);
}

export default resolveSkillSvg;
