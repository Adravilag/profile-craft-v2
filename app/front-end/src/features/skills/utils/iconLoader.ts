/**
 * Cargador centralizado de iconos SVG para skills
 * Maneja import.meta.glob con alias absolutos y mapeo de tecnologías
 */

import { generateSkillVariants } from './normalizeSkillName';

// Cargar todos los SVGs con ruta absoluta (evita problemas al mover archivos)
const svgModules = import.meta.glob('/src/assets/svg/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

/**
 * Mapa de SVGs disponibles indexado por nombre normalizado
 */
export const svgMap: Record<string, string> = Object.entries(svgModules).reduce(
  (acc, [path, url]) => {
    const match = path.match(/([^\/]+)\.svg$/i);
    if (!match) return acc;

    const rawName = match[1];
    // Normalizar igual que en runtime
    const normalized = rawName
      .trim()
      .toLowerCase()
      .replace(/\s|\+/g, '-')
      .replace(/[^a-z0-9\-\.]/g, '');

    const variants = generateSkillVariants(normalized);

    // Registrar todas las variantes
    for (const variant of variants) {
      if (variant && !acc[variant]) {
        acc[variant] = url;
      }
    }

    return acc;
  },
  {} as Record<string, string>
);

/**
 * Alias manuales para tecnologías que no tienen SVG directo o necesitan mapeo especial
 * Actualizado después de la limpieza de SVGs duplicados
 */
export const TECH_ALIASES: Record<string, string[]> = {
  // Frameworks y librerías
  jpa: ['hibernate', 'java', 'springboot'],
  'github-actions': ['github-actions'],
  githubactions: ['github-actions'],

  // CSS y variantes
  css: ['css3'],

  // Build tools
  lerna: ['lerna'],

  // Testing (nombres actualizados)
  jest: ['jest'],
  cypress: ['cypress'],

  // Cloud y servicios (nombres actualizados)
  azure: ['azure'],
  amazonwebservices: ['amazonwebservices'],
  aws: ['amazonwebservices'], // alias para AWS

  // Office y productividad
  excel: ['excel'],
  microsoftexcel: ['excel'],
  'microsoft-excel': ['excel'],
  msexcel: ['excel'],

  // Control de versiones
  svn: ['svn', 'source-control-svgrepo-com'],
  subversion: ['svn'],

  // Base de datos
  access: ['access'],
  microsoftaccess: ['access'],
  'microsoft-access': ['access'],
  msaccess: ['access'],
  postgresql: ['postgresql'],
  postgres: ['postgresql'],

  // Lenguajes y frameworks (nombres actualizados)
  net: ['dotnet'],
  dotnet: ['dotnet'],
  'dot-net': ['dotnet'],
  csharp: ['csharp'],
  'c#': ['csharp'],
  c: ['csharp'], // C# se normaliza a 'c'
  'c++': ['c-plus-plus'],
  cplusplus: ['c-plus-plus'],
  cpp: ['c-plus-plus'],

  // JavaScript frameworks (nombres actualizados)
  'react.js': ['react'],
  reactjs: ['react'],
  'vue.js': ['vue-js'],
  vuejs: ['vue-js'],
  'next.js': ['next-js'],
  nextjs: ['next-js'],
  'node.js': ['node-js'],
  nodejs: ['node-js'],

  // CSS frameworks (nombres actualizados)
  tailwind: ['tailwind-css'],
  'tailwind-css': ['tailwind-css'],
  tailwindcss: ['tailwind-css'],

  // Editors y herramientas (nombres actualizados)
  vscode: ['visual-studio-code'],
  'visual-studio-code': ['visual-studio-code'],
  'vs-code': ['visual-studio-code'],

  // UI libraries (nombres actualizados)
  mui: ['material-ui'],
  'material-ui': ['material-ui'],
  materialui: ['material-ui'],

  // DevOps (nombres actualizados)
  terraform: ['hashicorp-terraform', 'terraform'],
  'hashicorp-terraform': ['hashicorp-terraform'],

  // Otros marcos (nombres actualizados)
  rails: ['ruby-on-rails'],
  'ruby-on-rails': ['ruby-on-rails'],
  rubyonrails: ['ruby-on-rails'],

  // Búsqueda (nombres actualizados)
  elasticsearch: ['elastic-search'],
  'elastic-search': ['elastic-search'],

  // Java/JVM
  jsp: ['jsp'],
};

/**
 * Busca el icono para un skill dado
 * @param canonical - Nombre canónico del skill
 * @param normalized - Nombre normalizado del skill
 * @returns URL del SVG o null si no se encuentra
 */
export const findSkillIcon = (canonical: string, normalized: string): string | null => {
  // 1. Comprobar aliases primero
  const aliasCandidates = TECH_ALIASES[canonical] || TECH_ALIASES[normalized.replace(/[-_.]/g, '')];
  if (aliasCandidates) {
    for (const alias of aliasCandidates) {
      const found = svgMap[alias];
      if (found) return found;
    }
  }

  // 2. Buscar en mapa directo
  const directVariants = [
    canonical,
    normalized,
    normalized.replace(/[-_.]/g, ''),
    normalized.replace(/-/g, ''),
    normalized.replace(/\./g, ''),
    normalized.replace(/js$/, 'dotjs'),
    `${normalized}js`,
    normalized.replace(/-/g, '_'),
  ];

  for (const variant of directVariants) {
    const found = svgMap[variant];
    if (found) return found;
  }

  return null;
};

/**
 * Estadísticas del cargador de iconos (útil para debugging)
 */
export const getIconLoaderStats = () => {
  return {
    totalIcons: Object.keys(svgMap).length,
    totalAliases: Object.keys(TECH_ALIASES).length,
    availableIcons: Object.values(svgMap).length,
  };
};
