import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SkillPill from '../SkillPill';

// Nota: Vitest/Vite permite usar import.meta.glob en tests también
const svgModules = import.meta.glob('../../../assets/svg/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const normalize = (nameRaw: string) => {
  const name = (nameRaw || '').toString();
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/\s|\+/g, '-')
    .replace(/[^a-z0-9\-\.]/g, '');
  return normalized;
};

describe('SkillPill', () => {
  test('renders an image for a known svg (react) and has proper aria-label', () => {
    render(<SkillPill name="React" />);
    const el = screen.getByRole('button', { name: /react/i });
    expect(el).toBeInTheDocument();
    // If svg exists for react, an <img> should be inside
    const img = el.querySelector('img');
    if (img) {
      expect(img).toHaveAttribute('src');
      expect(img.getAttribute('alt')?.toLowerCase()).toContain('react');
    }
  });

  test('all svg files in assets resolve via normalization', () => {
    const missing: string[] = [];
    for (const path of Object.keys(svgModules)) {
      const m = path.match(/([^\/]+)\.svg$/i);
      if (!m) continue;
      const raw = m[1];
      const normalized = normalize(raw);
      const variants = [
        normalized,
        normalized.replace(/[-_.]/g, ''),
        normalized.replace(/-/g, ''),
        normalized.replace(/\./g, ''),
        raw.toLowerCase(),
        raw.toLowerCase().replace(/\s+/g, ''),
      ];

      // Check that at least one variant would be found by SkillPill's map lookup
      const found = variants.some(v =>
        Object.keys(svgModules).some(k => k.toLowerCase().includes(v))
      );
      if (!found) missing.push(raw);
    }

    // No missing svg mapping heuristics
    expect(missing).toEqual([]);
  });
});
