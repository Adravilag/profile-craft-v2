import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as loader from '@/features/skills/utils/iconLoader';

describe('iconLoader utils', () => {
  const ORIGINAL_SVG_MAP = { ...loader.svgMap };

  beforeEach(() => {
    // Clear existing map and set deterministic test data
    Object.keys(loader.svgMap).forEach(k => delete (loader.svgMap as any)[k]);
    (loader.svgMap as any)['react'] = 'https://cdn.test/react.svg';
    (loader.svgMap as any)['vue'] = 'https://cdn.test/vue.svg';
    (loader.svgMap as any)['generic-code'] = 'https://cdn.test/generic-code.svg';
  });

  afterEach(() => {
    // Restore original map
    Object.keys(loader.svgMap).forEach(k => delete (loader.svgMap as any)[k]);
    Object.entries(ORIGINAL_SVG_MAP).forEach(([k, v]) => ((loader.svgMap as any)[k] = v));
  });

  it('resolves explicit svg filename from entry.svg', () => {
    const entry = { svg: 'react.svg', slug: 'react', name: 'React' };
    const url = loader.findIconForSeedEntry(entry as any);
    expect(url).toBe('https://cdn.test/react.svg');
  });

  it('falls back to slug when svg missing', () => {
    const entry = { slug: 'vue', name: 'Vue' };
    const url = loader.findIconForSeedEntry(entry as any);
    expect(url).toBe('https://cdn.test/vue.svg');
  });

  it('returns null when not found', () => {
    const entry = { slug: 'unknown', name: 'Unknown' };
    const url = loader.findIconForSeedEntry(entry as any);
    expect(url).toBeNull();
  });

  it('resolveSkillIconFromJson returns null for invalid input', () => {
    const url = loader.resolveSkillIconFromJson(null as any);
    expect(url).toBeNull();
  });

  it('findSkillIcon resolves canonical/normalized values', () => {
    const url = loader.findSkillIcon('react', 'react');
    expect(url).toBe('https://cdn.test/react.svg');
  });
});
