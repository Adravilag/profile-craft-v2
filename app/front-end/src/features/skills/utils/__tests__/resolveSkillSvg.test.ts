import { resolveSkillSvg } from '../resolveSkillSvg';
import * as loader from '../iconLoader';
import { vi } from 'vitest';

describe('resolveSkillSvg', () => {
  it('returns normalized path from icon map entry', async () => {
    // mock getIconMap and getSkillIconEntry
    vi.spyOn(loader, 'getIconMap').mockImplementation(
      () => new Map([['react', '/assets/svg/react.svg']]) as any
    );
    vi.spyOn(loader, 'getSkillIconEntry').mockImplementation(
      () => ({ name: 'React', svg: '/assets/svg/react.svg' }) as any
    );

    const r = resolveSkillSvg('React');
    expect(r).toMatch(/react\.svg$/);
  });
});
