import { describe, it, expect } from 'vitest';

describe('skill_settings.json basic validation', () => {
  it('debe existir y contener entradas con campo svg válido', async () => {
    // Cargar JSON desde public
    // Nota: en vitest running under Node, `fetch` may not be defined, so usar fs
    const { promises: fs } = await import('fs');
    const raw = await fs.readFile('public/skill_settings.json', 'utf-8');
    const data = JSON.parse(raw) as Array<{ name?: string; svg?: string }>;

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(10);

    // Todos deben tener nombre y svg que termine en .svg
    for (const item of data) {
      expect(item.name).toBeTruthy();
      expect(typeof item.svg).toBe('string');
      expect(/\.svg$/i.test(item.svg)).toBe(true);
    }
  });
});
