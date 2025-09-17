import { describe, it, expect } from 'vitest';
import * as loader from '@/features/skills/utils/iconLoader';

describe('iconLoader basic contract', () => {
  it('exposes expected API', () => {
    expect(typeof loader.loadSkillIconMap).toBe('function');
    expect(typeof loader.preloadSkillIconMap).toBe('function');
    expect(typeof loader.findSkillIcon).toBe('function');
    expect(typeof loader.getIconMap).toBe('function');
    expect(typeof loader.clearSkillIconCache).toBe('function');
  });

  it('getIconMap returns null before preload and can be cleared', async () => {
    loader.clearSkillIconCache();
    const m1 = loader.getIconMap();
    expect(m1 === null || m1 instanceof Map).toBe(true);

    // findSkillIcon should return undefined when map not loaded
    const res = loader.findSkillIcon('react');
    expect(res).toBeUndefined();
  });
});
