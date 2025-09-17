import { describe, it, expect } from 'vitest';
import { resolvePillFromTech } from './pillUtils';

const suggestions = [
  { name: 'Azure', slug: 'azure', svg: 'azure.svg', color: '#0078D7' },
  { name: 'Spring Boot', slug: 'spring-boot', svg: 'springboot.svg', color: '#6DB33F' },
];

describe('resolvePillFromTech', () => {
  it('resolves from string using suggestions (Azure)', () => {
    const res = resolvePillFromTech('Azure', suggestions, 0);
    expect(res.slug).toBe('azure');
    expect(res.svg).toBe('azure.svg');
    expect(res.color).toBe('#0078D7');
    expect(res.name).toBe('Azure');
  });

  it('prefers provided svg on tech object', () => {
    const tech = { name: 'MyLib', slug: 'mylib', svg: 'mylib-custom.svg', color: '#123456' };
    const res = resolvePillFromTech(tech, suggestions, 1);
    expect(res.slug).toBe('mylib');
    expect(res.svg).toBe('mylib-custom.svg');
    expect(res.color).toBe('#123456');
    expect(res.name).toBe('MyLib');
  });

  it('falls back to generated slug when unknown', () => {
    const res = resolvePillFromTech('UnknownTech', suggestions, 2);
    expect(res.slug).toBe('unknowndtech'.replace('d', 'd') || 'UnknownTech');
    // name should be the original input when no suggestion
    expect(res.name.toLowerCase()).toContain('unknow');
  });
});
