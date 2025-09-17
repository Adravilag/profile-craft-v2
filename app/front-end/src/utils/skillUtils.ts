// utils/skillUtils.ts
import type { SkillIconData } from '../features/skills/types/skills';
import { debugLog } from '@/utils/debugConfig';
import { findSvgForName } from '@/utils/skillIcons';

// Función para convertir nombre de skill a clase CSS válida
export const getSkillCssClass = (skillName: string): string => {
  return `skill-${skillName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')}`;
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
    return '/assets/svg/generic-code.svg';
  }

  // Función auxiliar para validar URLs SVG mínimamente
  const isValidSvgPath = (path: string): boolean =>
    !!path && typeof path === 'string' && path.includes('.svg');

  // Primero buscar en el CSV por nombre exacto (prioridad alta)
  const csvIconExact = skillsIcons.find(
    icon => icon.name.toLowerCase() === skillName.toLowerCase()
  );

  debugLog.dataLoading(`🔍 Exact match for "${skillName}":`, csvIconExact);

  if (csvIconExact && csvIconExact.svg_path && isValidSvgPath(csvIconExact.svg_path)) {
    // Normalizar la ruta del SVG
    let finalPath = csvIconExact.svg_path;

    // Si es una ruta data: o blob: URL, usarla directamente
    if (finalPath.startsWith('data:') || finalPath.startsWith('blob:')) {
      debugLog.dataLoading(`✅ Found exact match for "${skillName}":`, finalPath);
      return finalPath;
    }

    // Normalizar rutas relativas a /assets/svg/
    if (
      !finalPath.startsWith('/assets/svg/') &&
      !finalPath.startsWith('http') &&
      !finalPath.startsWith('data:') &&
      !finalPath.startsWith('blob:')
    ) {
      if (finalPath.startsWith('/src/assets/svg/')) {
        finalPath = finalPath.replace('/src/assets/svg/', '/assets/svg/');
      } else if (!finalPath.startsWith('/')) {
        finalPath = `/assets/svg/${finalPath}`;
      }
    }

    debugLog.dataLoading(`✅ Found exact match for "${skillName}":`, finalPath);
    return finalPath;
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
    let finalPath = csvIconPartial.svg_path;

    // Si es una ruta data: o blob: URL, usarla directamente
    if (finalPath.startsWith('data:') || finalPath.startsWith('blob:')) {
      debugLog.dataLoading(`✅ Found partial match for "${skillName}":`, finalPath);
      return finalPath;
    }

    // Normalizar rutas relativas a /assets/svg/
    if (
      !finalPath.startsWith('/assets/svg/') &&
      !finalPath.startsWith('http') &&
      !finalPath.startsWith('data:') &&
      !finalPath.startsWith('blob:')
    ) {
      if (finalPath.startsWith('/src/assets/svg/')) {
        finalPath = finalPath.replace('/src/assets/svg/', '/assets/svg/');
      } else if (!finalPath.startsWith('/')) {
        finalPath = `/assets/svg/${finalPath}`;
      }
    }

    debugLog.dataLoading(`✅ Found partial match for "${skillName}":`, finalPath);
    return finalPath;
  }

  // Si ya tiene un SVG válido (no FontAwesome), usarlo
  if (existingSvg && existingSvg.trim() !== '' && isValidSvgPath(existingSvg)) {
    debugLog.dataLoading(`✅ Using existing SVG for "${skillName}":`, existingSvg);
    return existingSvg.startsWith('/') ? existingSvg : `/${existingSvg}`;
  }

  // Fallback: generar ruta basada en el nombre de la skill
  const cleanSkillName = skillName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  // Try findSvgForName from central map first
  const fromMap = findSvgForName(skillName);
  if (fromMap) return fromMap;

  const fallbackPath = `/assets/svg/${cleanSkillName}.svg`;
  debugLog.dataLoading(`🔧 Generated fallback path for "${skillName}":`, fallbackPath);
  return fallbackPath;
};

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
