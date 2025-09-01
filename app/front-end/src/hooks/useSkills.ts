import { useEffect, useMemo, useState } from 'react';
import type { Skill } from '@/types/api';
import { debugLog } from '@/utils/debugConfig';

export interface UseSkillsOptions {
  minLevel?: number; // umbral para filtrar
  sortBy?: 'level' | 'order_index' | 'name';
  desc?: boolean;
  // Fallback local en caso de error o lista vacía
  fallback?: Skill[];
}

export function useSkills(options: UseSkillsOptions = {}) {
  const { minLevel = 80, sortBy = 'level', desc = true, fallback = [] } = options;

  const [skills, setSkills] = useState<Skill[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const m = await import('@/services/endpoints');
        const list = await m.skills.getSkills();
        if (!mounted) return;
        setSkills(Array.isArray(list) ? list : []);
      } catch (err) {
        debugLog.error('Failed to load skills:', err);
        if (mounted) {
          setError('Failed to load skills');
          setSkills([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const displayed = useMemo(() => {
    const base = skills && skills.length ? skills : fallback;
    const filtered = base.filter(s => {
      const lvl = typeof (s as any).level === 'number' ? (s as any).level : 0;
      return lvl > minLevel;
    });
    const sorted = [...filtered].sort((a, b) => {
      const av = (a as any)[sortBy] ?? 0;
      const bv = (b as any)[sortBy] ?? 0;
      if (typeof av === 'string' && typeof bv === 'string') {
        return desc ? bv.localeCompare(av) : av.localeCompare(bv);
      }
      return desc ? Number(bv) - Number(av) : Number(av) - Number(bv);
    });
    return sorted;
  }, [skills, fallback, minLevel, sortBy, desc]);

  return { skills, displayed, loading, error } as const;
}

export default useSkills;
