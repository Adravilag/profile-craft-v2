// utils/skillUtils.ts
import type { SkillIconData } from '../types/skills';
import { findSkillIcon } from '@/features/skills/utils/iconLoader';

export const GENERIC_ICON_FILE = '/assets/svg/generic-code.svg';
export let GENERIC_ICON_URL = GENERIC_ICON_FILE;

// Aplica BASE_URL a rutas absolutas
const applyBaseUrl = (path: string): string => {
  const base = (import.meta as any)?.env?.BASE_URL ?? '/';
  return path.startsWith('/') ? `${base.replace(/\/$/, '')}${path}` : path;
};

// Inicializar URL genérica
GENERIC_ICON_URL = applyBaseUrl(GENERIC_ICON_FILE);

// Normaliza nombre de skill a CSS válido
export const getSkillCssClass = (skillName: string): string =>
  `skill-${skillName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')}`;

// Normaliza rutas SVG
export const normalizeSvgPath = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('blob:') || path.includes('://')) return path;
  const file = path.split('/').pop() || '';
  const base = file.replace(/\.svg$/i, '').toLowerCase();
  const normalized = base
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return applyBaseUrl(`/assets/svg/${normalized}.svg`);
};

// Obtener SVG de una skill
export const getSkillSvg = (
  skillName: string,
  existingSvg: string | null | undefined,
  skillsIcons: SkillIconData[]
): string => {
  if (!skillName) return GENERIC_ICON_URL;

  const isValidSvgPath = (p: string) =>
    !!p && (p.includes('.svg') || p.startsWith('data:') || p.startsWith('blob:'));

  if (existingSvg && isValidSvgPath(existingSvg)) return normalizeSvgPath(existingSvg);

  const lookup = findSkillIcon(skillName);
  if (lookup) {
    if (typeof lookup === 'string') return normalizeSvgPath(lookup);
    if (typeof lookup === 'object' && (lookup as any).svg_path)
      return normalizeSvgPath((lookup as any).svg_path);
  }

  const csvIcon = skillsIcons.find(icon => icon.name.toLowerCase() === skillName.toLowerCase());
  if (csvIcon && csvIcon.svg_path && isValidSvgPath(csvIcon.svg_path))
    return normalizeSvgPath(csvIcon.svg_path);

  // Fallback a ruta generada por el nombre
  const baseName = skillName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return applyBaseUrl(`/assets/svg/${baseName}.svg`);
};

// Parsear CSV de iconos de skills
export function parseSkillsIcons(csv: string): SkillIconData[] {
  return csv
    .split('\n')
    .slice(1)
    .map(line => {
      const [name, svg_path, category = 'technology', type = 'svg'] = line
        .split(',')
        .map(v => v.trim());
      return name && svg_path ? { name, svg_path, category, type } : null;
    })
    .filter(Boolean) as SkillIconData[];
}

// ==========================
// Compatibility exports
// ==========================
// Env guard to avoid external network calls during tests or when disabled
const DISABLE_EXTERNAL_FETCH =
  (typeof (import.meta as any)?.env !== 'undefined' &&
    ((import.meta as any).env.VITE_DISABLE_EXTERNAL_FETCH === 'true' ||
      (import.meta as any).env.DISABLE_EXTERNAL_FETCH === 'true')) ||
  false;

/**
 * Convert a difficulty label or numeric value into 1-5 stars.
 * Accepts strings like 'beginner', 'easy', 'intermediate', 'difficult', 'expert'
 * or numbers 0-100 (percent) -> scaled to 1-5.
 */
export function getDifficultyStars(source: string | number | undefined | null): number {
  if (source == null) return 3;
  if (typeof source === 'number') {
    const n = Math.max(0, Math.min(100, Math.round(source)));
    if (n <= 10) return 1;
    if (n <= 30) return 2;
    if (n <= 60) return 3;
    if (n <= 85) return 4;
    return 5;
  }
  const s = String(source).toLowerCase();
  if (['beginner', 'basic', 'básico', 'principiante', 'novice'].includes(s)) return 1;
  if (['easy', 'fácil', 'low'].includes(s)) return 2;
  if (['intermediate', 'medio', 'medium'].includes(s)) return 3;
  if (['difficult', 'hard', 'difícil'].includes(s)) return 4;
  if (['expert', 'advanced', 'experto'].includes(s)) return 5;
  // try parse numeric string
  const parsed = Number(s.replace(/[^0-9.]/g, ''));
  if (!Number.isNaN(parsed)) return getDifficultyStars(parsed);
  return 3;
}

/**
 * Test availability of an SVG path. This is intentionally conservative:
 * - If external fetches are disabled, we assume external URLs are unavailable and
 *   local `/assets/svg/...` are considered available to avoid noisy network calls in tests.
 */
export async function testSvgAvailability(path: string): Promise<boolean> {
  if (!path) return false;
  const trimmed = path.trim();
  // Data/blob URLs are considered available
  if (/^(data:|blob:)/i.test(trimmed)) return true;

  // Absolute/remote URLs
  if (/^(https?:\/\/|\/\/)/i.test(trimmed) || /^https?:/i.test(trimmed)) {
    if (DISABLE_EXTERNAL_FETCH) return false;
    try {
      const res = await fetch(trimmed, { method: 'HEAD', cache: 'no-store' } as any);
      return !!res && res.ok;
    } catch (e) {
      return false;
    }
  }

  // Local public assets (like /assets/svg/foo.svg) — assume present when fetch is unavailable
  if (
    trimmed.startsWith('/assets/svg/') ||
    /^assets\/svg\//i.test(trimmed) ||
    /\.svg$/i.test(trimmed)
  ) {
    if (typeof fetch === 'undefined' || DISABLE_EXTERNAL_FETCH) return true;
    try {
      const url = trimmed.startsWith('/') ? trimmed : `/${trimmed.replace(/^\/+/, '')}`;
      const res = await fetch(url, { method: 'HEAD', cache: 'no-store' } as any);
      return !!res && res.ok;
    } catch (e) {
      return true; // be permissive if HEAD fails due to CORS in tests/dev
    }
  }

  return false;
}

/**
 * Test availability for an array of SkillIconData and return missing entries.
 */
export async function testAllSvgAvailability(icons: SkillIconData[]) {
  const missing: { name: string; path: string }[] = [];
  if (!Array.isArray(icons)) return { missing };
  for (const icon of icons) {
    const p = (icon as any).svg_path || (icon as any).svg || '';
    try {
      const ok = await testSvgAvailability(String(p || ''));
      if (!ok)
        missing.push({
          name: icon.name || String((icon as any).slug || ''),
          path: String(p || ''),
        });
    } catch (e) {
      missing.push({ name: icon.name || '', path: String(p || '') });
    }
  }
  return { missing };
}
