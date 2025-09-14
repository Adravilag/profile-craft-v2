// Placeholder for skill resources data
// Historically this file exported auxiliary resources used by the skills feature.
// It was removed/missing which caused the barrel export in `features/skills/index.ts`
// to fail during import analysis in Vite (404). Provide a minimal safe export so
// the dev server and builds won't break. Replace or extend with real data when
// a real implementation is required.

export type SkillResource = {
  id: string;
  slug: string;
  name: string;
  category?: string;
  color?: string;
  svg?: string; // filename or path as provided in JSON
  url?: string; // optional external documentation link
  description?: string;
};

// Importar el JSON canónico que contiene la configuración de skills.
// Vite / TS permiten importar JSON directamente.
import skillSettings from '@/config/skill_setings.json';
import { resolveSkillIconFromJson } from '@/features/skills/utils/iconLoader';

// Mapear entries del JSON a un mapa indexado por slug.
export const SKILL_RESOURCES: Record<string, SkillResource> = Array.isArray(skillSettings)
  ? skillSettings.reduce((acc: Record<string, SkillResource>, entry: any) => {
      const slug = String(entry.slug || entry.name || '').toLowerCase();
      if (!slug) return acc;
      const resolvedSvg = resolveSkillIconFromJson(entry as any) || undefined;
      acc[slug] = {
        id: slug,
        slug,
        name: entry.name || slug,
        category: entry.category,
        color: entry.color,
        svg: entry.svg,
        svg_path: resolvedSvg,
        url: entry.url,
        description: entry.description,
      } as any;
      return acc;
    }, {})
  : {};

export function getSkillResource(slug: string): SkillResource | undefined {
  if (!slug) return undefined;
  return SKILL_RESOURCES[slug.toLowerCase()];
}

export default SKILL_RESOURCES;
