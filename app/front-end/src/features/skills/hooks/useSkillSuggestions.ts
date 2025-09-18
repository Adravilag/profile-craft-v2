import { useEffect, useState } from 'react';
import { useSkillSettings } from '@/features/skills/utils/skillSettingsLoader';

export type SkillSuggestion = { name?: string; slug?: string; svg?: string; color?: string };

let cached: SkillSuggestion[] | null = null;

export function useSkillSuggestions() {
  const settings = useSkillSettings();
  const [suggestions, setSuggestions] = useState<SkillSuggestion[] | null>(cached ?? null);

  useEffect(() => {
    let mounted = true;
    if (cached) {
      setSuggestions(cached);
      return;
    }

    const mapped = settings
      ? settings.map((it: any) => ({
          name: it?.name ? String(it.name) : undefined,
          slug: it?.slug ? String(it.slug) : undefined,
          svg: it?.svg ? String(it.svg) : undefined,
          color: it?.color ? String(it.color) : undefined,
        }))
      : [];

    if (mounted) {
      cached = mapped;
      setSuggestions(mapped);
    }

    return () => {
      mounted = false;
    };
  }, [settings]);

  return suggestions ?? [];
}

export default useSkillSuggestions;
