import { useEffect, useState } from 'react';

export type SkillSuggestion = { name?: string; slug?: string; svg?: string; color?: string };

let cached: SkillSuggestion[] | null = null;

export function useSkillSuggestions() {
  const [suggestions, setSuggestions] = useState<SkillSuggestion[] | null>(cached);

  useEffect(() => {
    let mounted = true;
    if (cached) {
      setSuggestions(cached);
      return;
    }

    const load = async () => {
      try {
        const res = await fetch('/skill_settings.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!mounted) return;
        if (Array.isArray(data)) {
          const items: SkillSuggestion[] = data.map((it: any) => ({
            name: it?.name ? String(it.name) : undefined,
            slug: it?.slug ? String(it.slug) : undefined,
            svg: it?.svg ? String(it.svg) : undefined,
            color: it?.color ? String(it.color) : undefined,
          }));
          cached = items;
          setSuggestions(items);
        } else {
          cached = [];
          setSuggestions([]);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        if (process.env.NODE_ENV === 'development')
          console.warn('Could not load skill suggestions:', e);
        if (mounted) {
          cached = [];
          setSuggestions([]);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return suggestions ?? [];
}

export default useSkillSuggestions;
