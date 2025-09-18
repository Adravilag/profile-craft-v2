import { useState, useEffect, useCallback } from 'react';
import type { SkillIconData } from '../types/skills';
import { parseSkillsIcons, getSkillSvg, testAllSvgAvailability } from '../utils/skillUtils';
import { loadSkillIconMap } from '@/features/skills/utils/iconLoader';
import type { Skill } from '@/types/api';
import { debugLog } from '@/utils/debugConfig';

// Singleton cache to avoid repeated fetches
let cachedIcons: SkillIconData[] | null = null;
let cachedNames: string[] | null = null;

export const useSkillsIcons = () => {
  const [skillsIcons, setSkillsIcons] = useState<SkillIconData[]>(cachedIcons || []);
  const [skillNames, setSkillNames] = useState<string[]>(cachedNames || []);
  const [loadingIcons, setLoadingIcons] = useState<boolean>(
    !(cachedIcons && cachedIcons.length > 0)
  );

  useEffect(() => {
    if (cachedIcons && cachedIcons.length > 0) {
      debugLog.dataLoading(`[SkillsIcons] Usando caché: ${cachedIcons.length} habilidades`);
      setSkillsIcons(cachedIcons);
      setSkillNames(cachedNames || []);
      setLoadingIcons(false);
      return;
    }

    const loadSVGIcons = async () => {
      try {
        debugLog.dataLoading(
          '[SkillsIcons] Construyendo lista de iconos desde el map central (public assets)...'
        );
        setLoadingIcons(true);

        const entries = await loadSkillIconMap();

        const icons: SkillIconData[] = (entries || []).map(e => {
          const svgPath = (e as any).svg_path
            ? String((e as any).svg_path)
            : e.svg
              ? `/${String(e.svg).replace(/^\/+/, '')}`
              : `/assets/svg/${String(e.name || '')
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, '-')}.svg`;

          return {
            name: e.name || String(e.slug || ''),
            svg_path: svgPath,
            category: e.category || 'technology',
            type: 'svg',
            ...(e.color ? { color: e.color } : {}),
            ...(e.slug ? { slug: e.slug } : {}),
          } as SkillIconData;
        });

        debugLog.dataLoading(`[SkillsIcons] SVG entries loaded: ${icons.length}`);

        setSkillsIcons(icons);
        setSkillNames(icons.map(icon => icon.name));
        cachedIcons = icons;
        cachedNames = icons.map(icon => icon.name);
        setLoadingIcons(false);

        if (import.meta.env.DEV && icons.length > 0) {
          testAllSvgAvailability(icons)
            .then(results => {
              if (results.missing.length > 0) {
                console.warn(`⚠️ ${results.missing.length} SVG no encontrados:`, results.missing);
              }
            })
            .catch(e => console.error('SVG availability test failed', e));
        }
      } catch (error) {
        console.error('[SkillsIcons] Error building icons list from map:', error);
        loadCSVIcons();
      }
    };

    const loadCSVIcons = () => {
      const getCSVUrl = () => {
        if (import.meta.env.DEV) return '/profile-craft/data/skills-icons.csv';
        return './data/skills-icons.csv';
      };

      debugLog.dataLoading('[SkillsIcons] Fallback: intentando cargar CSV de iconos...');
      setLoadingIcons(true);
      fetch(getCSVUrl())
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.text();
        })
        .then(csv => {
          const icons = parseSkillsIcons(csv);
          debugLog.dataLoading(`[SkillsIcons] CSV cargado: ${icons.length} habilidades`);

          setSkillsIcons(icons);
          setSkillNames(icons.map(icon => icon.name));

          cachedIcons = icons;
          cachedNames = icons.map(icon => icon.name);
        })
        .catch(error => {
          console.error('[SkillsIcons] Error loading CSV (fallback):', error);
        })
        .finally(() => setLoadingIcons(false));
    };

    loadSVGIcons();
  }, []);

  const enrichExistingSkills = useCallback(
    (_skills: Skill[], setSkills: React.Dispatch<React.SetStateAction<Skill[]>>) => {
      if (skillsIcons.length > 0) {
        debugLog.dataLoading('[SkillsIcons] Enriqueciendo skills existentes con iconos cargados');

        setSkills(prevSkills => {
          let hasChanges = false;
          const updatedSkills = prevSkills.map(skill => {
            const currentSvg = (skill as any).svg_path || '';

            // If we already have a valid svg_path, keep it. We no longer rely on
            // the legacy `icon_class` field to decide enrichment.
            if (currentSvg && String(currentSvg).trim() !== '') {
              return skill;
            }

            // Find the best svg for this skill using available name/slug and the
            // loaded `skillsIcons` map. getSkillSvg remains responsible for
            // searching by name/slug or falling back to a default SVG.
            const bestIconSvg = getSkillSvg(skill.name, undefined, skillsIcons);
            if (bestIconSvg && String(bestIconSvg).trim() !== '') {
              debugLog.dataLoading(
                `[SkillsIcons] Actualizando icono para: ${skill.name} - Nuevo: ${bestIconSvg}`
              );
              hasChanges = true;
              return { ...skill, svg_path: bestIconSvg } as any;
            }

            return skill;
          });

          return hasChanges ? updatedSkills : prevSkills;
        });
      } else {
        console.warn('[SkillsIcons] No hay iconos cargados para enriquecer skills existentes');
      }
    },
    [skillsIcons]
  );

  // External data state kept for compatibility but external fetching is disabled
  const [externalData, setExternalData] = useState<Record<string, any>>({});
  const [loadingExternalData, setLoadingExternalData] = useState<Record<string, boolean>>({});

  // No-op enrich function: kept to preserve the hook API but external enrichment is disabled
  const enrichSkillWithExternalData = async (skillName: string) => {
    // Intentionally a no-op. Keeping signature so callers don't break.
    return Promise.resolve();
  };

  return {
    skillsIcons,
    skillNames,
    externalData,
    loadingExternalData,
    loadingIcons,

    // compatibility functions
    enrichSkillWithExternalData,
    enrichExistingSkills,
  };
};
