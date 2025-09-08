// Utilidades para resolver íconos de skills mediante SVG locales o fallback a clases de iconos
// Carga todos los SVG de src/assets/svg y construye un mapa de búsqueda robusto

// Nota: ruta relativa desde src/utils a src/assets
const svgModules = import.meta.glob('../assets/svg/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

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

// Construir mapa key -> url con variantes para facilitar el lookup
const svgMap: Record<string, string> = Object.entries(svgModules).reduce(
  (acc, [path, url]) => {
    const m = path.match(/([^/]+)\.svg$/i);
    if (!m) return acc;
    const base = m[1].toLowerCase();
    const variants = new Set<string>([
      base,
      base.replace(/[-_.]/g, ''),
      base.replace(/-/g, ''),
      base.replace(/\./g, ''),
      base.replace(/js$/, 'dotjs'),
    ]);
    for (const k of variants) acc[k] = url;
    return acc;
  },
  {} as Record<string, string>
);

// Devuelve la URL del SVG si existe para el nombre dado, si no null
export function findSvgForName(name: string): string | null {
  if (!name) return null;
  const normalized = normalize(String(name));
  const candidates = [
    normalized,
    normalized.replace(/-/g, ''),
    normalized.replace(/[.\-_]/g, ''),
    normalized.replace(/js$/, 'dotjs'),
    `${normalized}js`,
  ];
  for (const key of candidates) {
    const hit = svgMap[key];
    if (hit) return hit;
  }
  return null;
}

export type {};
