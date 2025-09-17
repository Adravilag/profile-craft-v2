import { normalizeSkillName, generateSkillVariants } from '../normalizeSkillName';
import { describe, it, expect } from 'vitest';

describe('normalizeSkillName', () => {
  it('should normalize basic skill names', () => {
    const result = normalizeSkillName('JavaScript');
    expect(result.normalized).toBe('javascript');
    expect(result.canonical).toBe('javascript');
    expect(result.original).toBe('JavaScript');
  });

  it('should handle spaces and special characters', () => {
    const result = normalizeSkillName('C# Programming');
    expect(result.normalized).toBe('c-programming');
    expect(result.canonical).toBe('cprogramming');
    expect(result.original).toBe('C# Programming');
  });

  it('should handle plus signs', () => {
    const result = normalizeSkillName('C++');
    expect(result.normalized).toBe('c--');
    expect(result.canonical).toBe('c');
    expect(result.original).toBe('C++');
  });

  it('should handle .js extension special case', () => {
    const result = normalizeSkillName('React.js');
    expect(result.normalized).toBe('react.js');
    expect(result.canonical).toBe('reactdotjs');
    expect(result.original).toBe('React.js');
  });

  it('should handle edge cases from real world', () => {
    const testCases = [
      {
        input: 'GitHub Actions',
        expected: { normalized: 'github-actions', canonical: 'githubactions' },
      },
      { input: 'PostgresSQL', expected: { normalized: 'postgressql', canonical: 'postgressql' } },
      { input: 'Tailwind CSS', expected: { normalized: 'tailwind-css', canonical: 'tailwindcss' } },
      {
        input: 'Visual Studio Code',
        expected: { normalized: 'visual-studio-code', canonical: 'visualstudiocode' },
      },
      {
        input: 'Ruby on Rails',
        expected: { normalized: 'ruby-on-rails', canonical: 'rubyonrails' },
      },
      { input: 'Next.js', expected: { normalized: 'next.js', canonical: 'nextdotjs' } },
    ];

    testCases.forEach(({ input, expected }) => {
      const result = normalizeSkillName(input);
      expect(result.normalized).toBe(expected.normalized);
      expect(result.canonical).toBe(expected.canonical);
    });
  });

  it('should handle empty and null inputs', () => {
    expect(normalizeSkillName('').original).toBe('');
    expect(normalizeSkillName(' ').normalized).toBe('');
    expect(normalizeSkillName(null as any).original).toBe(null);
  });
});

describe('generateSkillVariants', () => {
  it('should generate multiple variants for a normalized name', () => {
    const variants = generateSkillVariants('react-native');
    expect(variants).toContain('react-native');
    expect(variants).toContain('reactnative');
    expect(variants).toContain('reactnative'); // sin guiones
    expect(variants.length).toBeGreaterThan(1);
  });

  it('should filter out empty variants', () => {
    const variants = generateSkillVariants('test');
    expect(variants.every(v => v.length > 0)).toBe(true);
  });
});
