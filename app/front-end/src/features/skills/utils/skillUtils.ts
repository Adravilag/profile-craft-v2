// utils/skillUtils.ts
import type { SkillIconData, LogoHubResult } from '../types/skills';
import { debugLog } from '@/utils/debugConfig';
// Fallback empaquetado por Vite para usar cuando no se encuentre un icono
import genericIconUrl from '@/assets/svg/generic-code.svg?url';
// Exponer la URL genérica para que otros módulos puedan compararla
export const GENERIC_ICON_URL = genericIconUrl;

// Mapa de todos los SVG de assets resueltos a URL por Vite
// Usamos as:'url' para obtener directamente la URL final servida por Vite
// Nota: el tipo lo forzamos a Record<string, string> para simplicidad
// use a relative glob from project root that Vite accepts in tests
const svgModules =
  ((import.meta.glob &&
    import.meta.glob('/src/assets/svg/*.svg', {
      eager: true,
      as: 'url',
    })) as unknown as Record<string, string>) || {};

// Índices para búsqueda por nombre de archivo (con y sin extensión)
const svgByFileName: Record<string, string> = {};
const svgByBaseName: Record<string, string> = {};

for (const modPath in svgModules) {
  const url = svgModules[modPath];
  const file = modPath.split('/').pop() || '';
  const fileLower = file.toLowerCase();
  const base = fileLower.replace(/\.svg$/i, '');
  svgByFileName[fileLower] = url;
  svgByBaseName[base] = url;
}

// Resolver por nombre/archivo usando el globo de Vite
const resolveSvgViaGlob = (input: string): string | undefined => {
  if (!input) return undefined;
  const raw = input.toLowerCase().trim();
  const file = raw.includes('/') ? raw.split('/').pop()! : raw;
  // 1) Match directo de filename con extensión
  if (svgByFileName[file]) return svgByFileName[file];
  // 2) Quitar extensión si viene incluida o si no existe
  const base = file.replace(/\.svg$/i, '');
  if (svgByBaseName[base]) return svgByBaseName[base];
  // 3) Normalizar a kebab simple (coincidir con convención de archivos)
  const normalized = base
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  if (svgByBaseName[normalized]) return svgByBaseName[normalized];

  // 4) Alias conocidos entre nombres y archivos
  const aliasMap: Record<string, string> = {
    // Web core y typos comunes
    html: 'html5',
    html5: 'html5',
    css: 'css3',
    css3: 'css3',
    js: 'javascript',
    javascript: 'javascript',
    boostrap: 'bootstrap',
    bootstrap: 'bootstrap',

    nextjs: 'next-js',
    vuejs: 'vue-js',
    nodejs: 'node-js',
    node: 'node-js',
    reactjs: 'react',
    tailwindcss: 'tailwind-css',
    'tailwind-css': 'tailwind-css',
    'material ui': 'material-ui',
    'material-ui': 'material-ui',
    'c#': 'csharp',
    csharp: 'csharp',
    'c++': 'c-plus-plus',
    cplusplus: 'c-plus-plus',
    cpp: 'c-plus-plus',
    aws: 'amazonwebservices',
    gcp: 'googlecloud',
    'google gemini': 'googlegemini',
    'spring boot': 'springboot',
    wordpress: 'wordpress',
    'vue js': 'vue-js',
    'vue.js': 'vue-js',
    'next.js': 'next-js',
  };
  const aliasTarget = aliasMap[normalized];
  if (aliasTarget && svgByBaseName[aliasTarget]) return svgByBaseName[aliasTarget];
  return undefined;
};

// Aplica import.meta.env.BASE_URL a rutas absolutas de '/assets/...'
const applyBaseUrl = (path: string): string => {
  try {
    if (!path || !path.startsWith('/')) return path;
    const base = (import.meta as any)?.env?.BASE_URL ?? '/';
    // Normalizar base y evitar doble prefijo
    const baseNorm = String(base).endsWith('/') ? String(base) : `${String(base)}/`;
    if (baseNorm === '/' || path.startsWith(baseNorm)) return path;
    // Unir evitando dobles '/'
    return `${baseNorm.replace(/\/$/, '')}${path}`;
  } catch {
    return path;
  }
};

// Función para convertir nombre de skill a clase CSS válida
export const getSkillCssClass = (skillName: string): string => {
  return `skill-${skillName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')}`;
};

// Función para normalizar rutas SVG devolviendo URLs válidas de Vite
export const normalizeSvgPath = (path: string): string => {
  if (!path) return '';

  debugLog.dataLoading(`🔧 normalizeSvgPath input:`, path);

  // Si es una ruta data: o blob: URL, usarla directamente
  if (path.startsWith('data:') || path.startsWith('blob:')) {
    debugLog.dataLoading(`🔧 normalizeSvgPath output (data/blob):`, path);
    return path;
  }

  // Intentar resolver vía globo de Vite antes que cualquier reescritura
  const viaGlob = resolveSvgViaGlob(path);
  if (viaGlob) {
    // Algunas veces el glob de Vite puede devolver rutas de desarrollo que
    // incluyen '/src/assets/svg/' o rutas absolutas dentro del proyecto.
    // Para mantener una salida consistente (y acorde a los tests),
    // normalizamos estas variantes a '/assets/svg/<file>'. Si viaGlob ya
    // es una URL pública válida diferente (p. ej. empieza por 'http'),
    // la devolvemos tal cual.
    debugLog.dataLoading(`🔧 normalizeSvgPath output (vite glob raw):`, viaGlob);

    try {
      const viaLower = String(viaGlob).toLowerCase();

      const inputLower = String(path).toLowerCase().trim();
      // Derivar nombre de archivo desde la entrada: si viene con extensión, usarla;
      // si viene sin extensión, añadir .svg
      const rawFile = inputLower.includes('/') ? inputLower.split('/').pop()! : inputLower;
      const baseName = rawFile.replace(/\.svg$/i, '');
      const inputFileName = `${baseName}.svg`;

      const devPathIndicators = [
        '/src/assets/svg/',
        '/profile-craft/src/assets/svg/',
        '/profile-craft/public/assets/svg/',
        '/public/assets/svg/',
      ];
      const isInputLocalAsset =
        devPathIndicators.some(p => inputLower.includes(p)) ||
        inputLower.startsWith('/assets/svg/') ||
        (!inputLower.includes('://') && (inputLower.endsWith('.svg') || !inputLower.includes('/')));

      // Si el glob devolvió un data: o blob: (inlining) pero la entrada viene
      // de un asset local (nombre de archivo o ruta /src/...), preferimos
      // devolver la forma canónica /assets/svg/<file> para consistencia en tests.
      if ((viaLower.startsWith('data:') || viaLower.startsWith('blob:')) && isInputLocalAsset) {
        const out = applyBaseUrl(`/assets/svg/${inputFileName}`);
        debugLog.dataLoading(`🔧 normalizeSvgPath output (vite glob inlined -> canonical):`, out);
        return out;
      }

      // Si el glob devuelve una ruta dentro del repo (/src/... o /public/'),
      // normalizar a /assets/svg/<file> también usando el nombre derivado de la entrada
      const matchesDevPath = devPathIndicators.some(p => viaLower.includes(p));
      if (matchesDevPath || viaLower.includes('/assets/svg/')) {
        const out = applyBaseUrl(`/assets/svg/${inputFileName}`);
        debugLog.dataLoading(`🔧 normalizeSvgPath output (vite glob normalized):`, out);
        return out;
      }

      // En cualquier otro caso (URLs externas, http, etc.) devolvemos viaGlob
    } catch (e) {
      debugLog.warn('normalizeSvgPath: error normalizing viaGlob', e);
      return viaGlob;
    }

    return viaGlob;
  }

  // Si ya está normalizada, devolverla
  if (path.startsWith('/assets/svg/')) {
    const out = applyBaseUrl(path);
    debugLog.dataLoading(`🔧 normalizeSvgPath output (already normalized):`, out);
    return out;
  }

  // Normalizar rutas de Vite development que incluyen el path completo del proyecto
  if (path.includes('/profile-craft/src/assets/svg/') || path.includes('/src/assets/svg/')) {
    const fileName = path.split('/').pop();
    const normalizedPath = `/assets/svg/${fileName}`;
    const out = applyBaseUrl(normalizedPath);
    debugLog.dataLoading(`🔧 normalizeSvgPath output (vite dev path):`, out);
    return out;
  }

  // Si es solo el nombre del archivo sin ruta
  if (!path.includes('/') && path.endsWith('.svg')) {
    const via = resolveSvgViaGlob(path) || applyBaseUrl(`/assets/svg/${path}`);
    debugLog.dataLoading(`🔧 normalizeSvgPath output (filename only):`, via);
    return via;
  }

  // Si no tiene extensión, agregarla
  if (!path.includes('/') && !path.endsWith('.svg')) {
    const via = resolveSvgViaGlob(`${path}.svg`) || applyBaseUrl(`/assets/svg/${path}.svg`);
    debugLog.dataLoading(`🔧 normalizeSvgPath output (no extension):`, via);
    return via;
  }

  debugLog.dataLoading(`🔧 normalizeSvgPath output (fallback):`, path);
  return path;
};

// Función para obtener el SVG de una skill
export const getSkillSvg = (
  skillName: string,
  existingSvg: string | null | undefined,
  skillsIcons: SkillIconData[]
): string => {
  debugLog.dataLoading(`🔍 getSkillSvg called for: "${skillName}"`, {
    existingSvg,
    skillsIconsLength: skillsIcons.length,
  });

  if (!skillName || skillName.trim() === '') {
    console.warn('getSkillSvg: nombre de habilidad vacío');
    return genericIconUrl;
  }

  // Función auxiliar para validar URLs SVG
  const isValidSvgPath = (path: string): boolean => {
    if (!path) return false;
    // Aceptar data: y blob: URLs además de rutas .svg
    const isSvgFile = path.includes('.svg');
    const isDataOrBlob = path.startsWith('data:') || path.startsWith('blob:');
    const isFontAwesome = path.includes('fa-') || path.includes('fas ') || path.includes('fab ');
    return (isSvgFile || isDataOrBlob) && !isFontAwesome;
  };

  // Si ya tiene un SVG válido (no FontAwesome), normalizarlo y usarlo primero
  if (existingSvg && existingSvg.trim() !== '' && isValidSvgPath(existingSvg)) {
    const normalizedPath = normalizeSvgPath(existingSvg);
    debugLog.dataLoading(`✅ Using existing SVG for "${skillName}":`, normalizedPath);
    return normalizedPath;
  }

  // Buscar en el CSV por nombre exacto (prioridad alta)
  const csvIconExact = skillsIcons.find(
    icon => icon.name.toLowerCase() === skillName.toLowerCase()
  );

  debugLog.dataLoading(`🔍 Exact match for "${skillName}":`, csvIconExact);

  if (csvIconExact && csvIconExact.svg_path && isValidSvgPath(csvIconExact.svg_path)) {
    const normalizedPath = normalizeSvgPath(csvIconExact.svg_path);
    debugLog.dataLoading(`✅ Found exact match for "${skillName}":`, normalizedPath);
    return normalizedPath;
  }

  // Si no se encuentra exacto, buscar por coincidencia parcial más agresiva
  const csvIconPartial = skillsIcons.find(icon => {
    const iconNameLower = icon.name.toLowerCase();
    const skillNameLower = skillName.toLowerCase();

    // Busquedas más flexibles
    return (
      iconNameLower.includes(skillNameLower) ||
      skillNameLower.includes(iconNameLower) ||
      iconNameLower.replace(/\s/g, '') === skillNameLower.replace(/\s/g, '') ||
      iconNameLower.replace(/[.-]/g, '') === skillNameLower.replace(/[.-]/g, '')
    );
  });

  debugLog.dataLoading(`🔍 Partial match for "${skillName}":`, csvIconPartial);

  if (csvIconPartial && csvIconPartial.svg_path && isValidSvgPath(csvIconPartial.svg_path)) {
    const normalizedPath = normalizeSvgPath(csvIconPartial.svg_path);
    debugLog.dataLoading(`✅ Found partial match for "${skillName}":`, normalizedPath);
    return normalizedPath;
  }

  // Fallback: generar ruta basada en el nombre de la skill
  const cleanSkillName = skillName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  // Intentar resolver con el globo
  const viaGlob = resolveSvgViaGlob(`${cleanSkillName}.svg`);
  if (viaGlob) {
    debugLog.dataLoading(`🔧 Generated fallback via glob for "${skillName}" (raw):`, viaGlob);
    // Normalizar usando el nombre limpio para asegurar una ruta canónica
    // (por ejemplo '/assets/svg/vue-js.svg') en vez de devolver data: URIs
    return normalizeSvgPath(`${cleanSkillName}.svg`);
  }

  // Último recurso: icono genérico estable
  debugLog.warn(`⚠️ Fallback genérico para "${skillName}":`, genericIconUrl);
  return genericIconUrl;
};

// Intentar obtener un SVG desde LogoHub (https://api.logohub.dev)
export const fetchLogoHubSvg = async (skillName: string): Promise<string | null> => {
  try {
    const base = 'https://api.logohub.dev/v1/logos';
    const q = encodeURIComponent(String(skillName).trim());
    const url = `${base}?search=${q}&limit=1`;
    debugLog.dataLoading('🔗 fetchLogoHubSvg fetching', url);
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) {
      debugLog.warn('fetchLogoHubSvg non-ok response', { status: res.status });
      return null;
    }
    const data = await res.json();
    const first = data?.logos?.[0];
    if (first && first.files && first.files.svg) {
      debugLog.dataLoading('🔗 fetchLogoHubSvg found svg', first.files.svg);
      return first.files.svg as string;
    }
    return null;
  } catch (error) {
    debugLog.warn('fetchLogoHubSvg error', error);
    return null;
  }
};

/**
 * Búsqueda avanzada en LogoHub usando la API oficial completa
 * @param query Término de búsqueda
 * @param limit Número máximo de resultados (default: 8)
 * @param category Filtro por categoría (opcional)
 * @returns Array de resultados de LogoHub con metadatos completos
 */
export const searchLogoHub = async (
  query: string,
  limit: number = 8,
  category?: string
): Promise<LogoHubResult[]> => {
  try {
    console.log(
      `🔍 [LogoHub] Búsqueda avanzada: "${query}" (límite: ${limit}${category ? `, categoría: ${category}` : ''})`
    );

    // Construir URL con parámetros
    const params = new URLSearchParams({
      search: query,
      limit: limit.toString(),
    });

    if (category) {
      params.append('category', category);
    }

    const apiUrl = `https://api.logohub.dev/v1/logos?${params.toString()}`;
    const startTime = performance.now();

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    if (!response.ok) {
      console.error(`❌ [LogoHub] Error HTTP ${response.status}: ${response.statusText}`);

      // Intentar parsear el error de LogoHub
      try {
        const errorData = await response.json();
        console.error(`❌ [LogoHub] Error detallado:`, errorData.error);
        throw new Error(`LogoHub API Error: ${errorData.error?.message || response.statusText}`);
      } catch {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }

    const data = await response.json(); // Log detallado de los primeros 3 resultados
    if (data.logos && data.logos.length > 0) {
      console.log(
        `📋 [LogoHub] Primeros resultados:`,
        data.logos.slice(0, 3).map((logo: any) => ({
          id: logo.id,
          name: logo.name,
          category: logo.category,
          tags: logo.tags?.slice(0, 3),
          colors: logo.colors,
          svg: logo.files?.svg,
        }))
      );
    }

    return data.logos || [];
  } catch (error) {
    console.error(`❌ [LogoHub] Error en búsqueda avanzada para "${query}":`, error);

    // En caso de error, retornar array vacío para no romper la funcionalidad
    return [];
  }
};

// Función para testear la disponibilidad de un SVG
export const testSvgAvailability = async (svgPath: string, skillName: string): Promise<boolean> => {
  try {
    debugLog.dataLoading(`🧪 Testing SVG availability for ${skillName}:`, svgPath);

    const response = await fetch(svgPath);
    const isAvailable = response.ok;

    if (isAvailable) {
      const contentType = response.headers.get('content-type');
      const isSvg = contentType?.includes('svg') || contentType?.includes('xml');

      debugLog.dataLoading(`✅ SVG test SUCCESS for ${skillName}:`, {
        status: response.status,
        contentType,
        isSvg,
        path: svgPath,
      });

      return true;
    } else {
      debugLog.warn(`❌ SVG test FAILED for ${skillName}:`, {
        status: response.status,
        statusText: response.statusText,
        path: svgPath,
      });

      // Intentar con rutas alternativas
      await testAlternativePaths(svgPath, skillName);
      return false;
    }
  } catch (error) {
    debugLog.warn(`🚨 SVG test ERROR for ${skillName}:`, {
      error: error instanceof Error ? error.message : String(error),
      path: svgPath,
    });
    return false;
  }
};

// Función para testear rutas alternativas
const testAlternativePaths = async (originalPath: string, skillName: string) => {
  const fileName = originalPath.split('/').pop();
  if (!fileName) return;

  const alternativePaths = [
    `/src/assets/svg/${fileName}`,
    `/public/assets/svg/${fileName}`,
    `./assets/svg/${fileName}`,
    `/profile-craft/src/assets/svg/${fileName}`,
    `/profile-craft/public/assets/svg/${fileName}`,
  ];

  debugLog.dataLoading(`🔍 Testing alternative paths for ${skillName}:`, alternativePaths);

  for (const altPath of alternativePaths) {
    try {
      const response = await fetch(altPath);
      if (response.ok) {
        debugLog.dataLoading(`✅ Alternative path found for ${skillName}:`, altPath);
        return altPath;
      }
    } catch (error) {
      // Silently continue to next path
    }
  }

  debugLog.warn(`❌ No alternative paths found for ${skillName}`);
  return null;
};

// Función para testear todos los SVG disponibles
export const testAllSvgAvailability = async (
  skillsIcons: SkillIconData[]
): Promise<{ available: string[]; missing: string[]; total: number }> => {
  debugLog.dataLoading('🧪 Starting comprehensive SVG availability test...');

  const results = await Promise.allSettled(
    skillsIcons.map(async icon => {
      const isAvailable = await testSvgAvailability(icon.svg_path, icon.name);
      return { icon, isAvailable };
    })
  );

  const available: string[] = [];
  const missing: string[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const { icon, isAvailable } = result.value;
      if (isAvailable) {
        available.push(icon.name);
      } else {
        missing.push(icon.name);
      }
    } else {
      missing.push(skillsIcons[index].name);
    }
  });

  const report = {
    available,
    missing,
    total: skillsIcons.length,
  };

  debugLog.dataLoading('📊 SVG Availability Test Results:', {
    totalTested: report.total,
    available: report.available.length,
    missing: report.missing.length,
    availabilityRate: `${((report.available.length / report.total) * 100).toFixed(1)}%`,
  });

  if (report.missing.length > 0) {
    debugLog.warn('❌ Missing SVGs:', report.missing);
  }

  return report;
};

// Función global para debugging - disponible en consola del navegador
export const debugSvgPaths = () => {
  const testPaths = [
    '/assets/svg/',
    '/src/assets/svg/',
    '/public/assets/svg/',
    './assets/svg/',
    '/profile-craft/src/assets/svg/',
    '/profile-craft/public/assets/svg/',
    '/profile-craft/assets/svg/',
  ];
  testPaths.forEach(async basePath => {
    try {
      const testPath = `${basePath}react.svg`;
      const response = await fetch(testPath);
    } catch (error) {}
  });

  // También probar algunas rutas absolutas comunes
  const absolutePaths = [
    `${window.location.origin}/assets/svg/react.svg`,
    `${window.location.origin}/src/assets/svg/react.svg`,
    `${window.location.origin}/public/assets/svg/react.svg`,
  ];
  absolutePaths.forEach(async absolutePath => {
    try {
      const response = await fetch(absolutePath);
    } catch (error) {}
  });
};

// Hacer la función disponible globalmente en desarrollo
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).debugSvgPaths = debugSvgPaths;

  // Función para inspeccionar el estado actual de los iconos
  (window as any).inspectSkillIcons = () => {
    // Listar todos los elementos img con src que contenga svg
    const svgImages = Array.from(document.querySelectorAll('img[src*="svg"]'));
    svgImages.forEach((img, index) => {
      const imgElement = img as HTMLImageElement;
    });

    return {
      totalImages: svgImages.length,
      loadedImages: svgImages.filter(img => (img as HTMLImageElement).naturalWidth > 0).length,
      location: window.location.href,
    };
  };
  console.log('- debugSvgPaths() - Test common SVG paths');
  console.log('- inspectSkillIcons() - Inspect current icon state');
}

// Función para obtener nivel de popularidad
export const getPopularityLevel = (
  skill: any,
  externalData?: any
): { level: number; label: string; color: string } => {
  // Determinar popularidad basada en múltiples factores
  let score = 0;

  // Factor 1: Datos externos (GitHub stars, Stack Overflow tags, etc.)
  if (externalData?.popularity) {
    switch (externalData.popularity) {
      case 'very_high':
        score += 5;
        break;
      case 'high':
        score += 4;
        break;
      case 'medium':
        score += 3;
        break;
      case 'medium_low':
        score += 2;
        break;
      case 'low':
        score += 1;
        break;
    }
  }

  // Factor 2: Level de la skill
  if (skill?.level) {
    const level = parseInt(skill.level);
    if (!isNaN(level)) {
      score += Math.min(level / 20, 2); // Máximo 2 puntos por level
    }
  }

  // Factor 3: Si tiene certificaciones o proyectos
  if (skill?.certifications && skill.certifications.length > 0) {
    score += 1;
  }
  if (skill?.projects && skill.projects.length > 0) {
    score += 1;
  }

  // Normalizar score a 1-5
  const normalizedLevel = Math.max(1, Math.min(5, Math.round(score)));

  // Mapear a colores y etiquetas
  const levelMap = {
    1: { label: 'Básico', color: '#94a3b8' }, // gray
    2: { label: 'Intermedio', color: '#60a5fa' }, // blue
    3: { label: 'Competente', color: '#34d399' }, // green
    4: { label: 'Avanzado', color: '#fbbf24' }, // yellow/orange
    5: { label: 'Experto', color: '#f87171' }, // red
  };

  return {
    level: normalizedLevel,
    ...levelMap[normalizedLevel as keyof typeof levelMap],
  };
};

// Función para obtener estrellas de dificultad
export const getDifficultyStars = (difficultyLevel: string | number): number => {
  if (typeof difficultyLevel === 'number') {
    return Math.max(1, Math.min(5, Math.round(difficultyLevel)));
  }

  const level = String(difficultyLevel).toLowerCase();
  const difficultyMap: Record<string, number> = {
    very_easy: 1,
    easy: 1,
    beginner: 1,
    basic: 1,
    medium: 2,
    intermediate: 3,
    advanced: 4,
    hard: 4,
    expert: 5,
    very_hard: 5,
    master: 5,
  };

  return difficultyMap[level] || 3; // Default a 3 estrellas
};

// Función para parsear CSV de iconos de skills
export function parseSkillsIcons(csv: string): SkillIconData[] {
  const lines = csv.split('\n').filter(line => line.trim() !== '');

  if (lines.length === 0) {
    console.warn('CSV vacío o inválido');
    return [];
  }

  const icons: SkillIconData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());

    if (values.length >= 2) {
      const data: SkillIconData = {
        name: values[0] || '',
        svg_path: values[1] || '',
        category: values[2] || 'technology',
        type: values[3] || 'svg',
      };

      // Solo agregar si tiene nombre y ruta válidos
      if (data.name && data.svg_path) {
        icons.push(data);
      }
    }
  }

  return icons;
}
