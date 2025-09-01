import { describe, it, expect } from 'vitest';
import { normalizeSvgPath, getSkillSvg } from '../../utils/skillUtils';

type SkillIconData = {
  name: string;
  svg_path: string;
  category?: string;
  type?: string;
};

describe('skillUtils.normalizeSvgPath', () => {
  it('debe dejar intactas data: y blob: URLs', () => {
    const dataUrl = 'data:image/svg+xml,<svg></svg>';
    expect(normalizeSvgPath(dataUrl)).toBe(dataUrl);

    const blobUrl = 'blob:http://localhost/123';
    expect(normalizeSvgPath(blobUrl)).toBe(blobUrl);
  });

  it('debe mantener rutas ya normalizadas /assets/svg/', () => {
    expect(normalizeSvgPath('/assets/svg/react.svg')).toBe('/assets/svg/react.svg');
  });

  it('debe normalizar rutas de dev con /profile-craft/src/assets/svg/', () => {
    expect(normalizeSvgPath('/profile-craft/src/assets/svg/react.svg')).toBe(
      '/assets/svg/react.svg'
    );
  });

  it('debe normalizar rutas /src/assets/svg/ a /assets/svg/', () => {
    expect(normalizeSvgPath('/src/assets/svg/redux.svg')).toBe('/assets/svg/redux.svg');
  });

  it('debe agregar prefijo y extensión cuando es solo nombre con .svg', () => {
    expect(normalizeSvgPath('javascript.svg')).toBe('/assets/svg/javascript.svg');
  });

  it('debe agregar .svg cuando es solo nombre sin extensión', () => {
    expect(normalizeSvgPath('react')).toBe('/assets/svg/react.svg');
  });
});

describe('skillUtils.getSkillSvg', () => {
  const icons: SkillIconData[] = [
    {
      name: 'HTML5',
      svg_path: "data:image/svg+xml,<svg id='html5'></svg>",
      category: 'technology',
      type: 'svg',
    },
    {
      name: 'Restapi',
      svg_path: '/src/assets/svg/restapi.svg',
      category: 'technology',
      type: 'svg',
    },
    { name: 'React', svg_path: '/src/assets/svg/react.svg', category: 'technology', type: 'svg' },
  ];

  it('usa existingSvg válido priorizando y lo normaliza', () => {
    const result = getSkillSvg('React', '/profile-craft/src/assets/svg/react.svg', icons as any);
    expect(result).toBe('/assets/svg/react.svg');
  });

  it('devuelve data URL si el icono exacto del CSV es data:', () => {
    const result = getSkillSvg('HTML5', undefined, icons as any);
    expect(result.startsWith('data:')).toBe(true);
  });

  it('encuentra coincidencia parcial y normaliza la ruta', () => {
    const result = getSkillSvg('REST API', undefined, icons as any);
    expect(result).toBe('/assets/svg/restapi.svg');
  });

  it('ignora clases de FontAwesome y genera fallback', () => {
    const result = getSkillSvg('Vue.js', 'fab fa-vuejs', [] as any);
    expect(result).toBe('/assets/svg/vue-js.svg');
  });
});
