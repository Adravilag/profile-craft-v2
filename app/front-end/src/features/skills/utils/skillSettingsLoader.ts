import { useEffect, useState } from 'react';
import { loadJson } from './iconLoader';
import { SKILL_SETTINGS_SOURCE } from './skillSettingsConstants';

export type SkillSettingsEntry = {
  name: string;
  slug?: string;
  svg?: string;
  color?: string;
  category?: string;
  aliases?: string[];
};

let cached: SkillSettingsEntry[] | null = null;
let loading: Promise<SkillSettingsEntry[] | null> | null = null;
let cacheTimestamp = 0;
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

export async function loadSkillSettings(
  source = SKILL_SETTINGS_SOURCE,
  options?: { ttlMs?: number; force?: boolean }
) {
  const ttl = options?.ttlMs ?? DEFAULT_TTL;
  if (!options?.force && cached && Date.now() - cacheTimestamp < ttl) return cached;
  if (loading) return loading;

  loading = (async () => {
    try {
      try {
        const data = await loadJson<SkillSettingsEntry[]>(source);
        cached = Array.isArray(data) ? data : [];
        cacheTimestamp = Date.now();
        return cached;
      } catch (e) {
        // fallback to root public file
        try {
          const fallback = await loadJson<SkillSettingsEntry[]>(SKILL_SETTINGS_SOURCE);
          cached = Array.isArray(fallback) ? fallback : [];
          cacheTimestamp = Date.now();
          return cached;
        } catch (err) {
          // give up and return empty
          cached = [];
          cacheTimestamp = Date.now();
          return cached;
        }
      }
    } finally {
      loading = null;
    }
  })();

  return loading;
}

export async function preloadSkillSettings(source?: string, options?: { ttlMs?: number }) {
  await loadSkillSettings(source ?? SKILL_SETTINGS_SOURCE, { ttlMs: options?.ttlMs });
}

export function getCachedSkillSettings() {
  return cached;
}

export function clearSkillSettingsCache() {
  cached = null;
  cacheTimestamp = 0;
}

export function useSkillSettings() {
  const [state, setState] = useState<SkillSettingsEntry[] | null>(cached);

  useEffect(() => {
    let mounted = true;
    if (cached) {
      setState(cached);
      return;
    }
    const load = async () => {
      try {
        const res = await loadSkillSettings();
        if (!mounted) return;
        setState(res ?? []);
      } catch (e) {
        if (!mounted) return;
        setState([]);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return state ?? [];
}

export default loadSkillSettings;
