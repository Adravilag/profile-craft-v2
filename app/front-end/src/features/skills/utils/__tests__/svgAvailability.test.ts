import { describe, it, expect } from 'vitest';

// Nota: Estas pruebas no importan los archivos reales,
// validan que los nombres esperados estén en el globo de Vite en tiempo de test (cuando se ejecuta con Vite+Vitest).

describe('Disponibilidad de SVGs en /src/assets/svg', () => {
  it('debe contener un set mínimo de iconos esperados', async () => {
    const modules = import.meta.glob('/src/assets/svg/*.svg', { eager: false });
    const keys = Object.keys(modules);

    // Aseguramos que hay muchos iconos (81 en tu proyecto real)
    expect(keys.length).toBeGreaterThan(20);

    // Chequeos de algunos iconos clave (permitiendo alias comunes)
    const someExists = (names: string[]) =>
      expect(names.some(name => keys.some(k => k.endsWith(`/src/assets/svg/${name}.svg`)))).toBe(
        true
      );

    someExists(['html', 'html5']);
    someExists(['javascript', 'js']);
    someExists(['react']);
    someExists(['css', 'css3']);
    someExists(['bootstrap']);
    someExists(['typescript', 'ts']);
    someExists(['vuedotjs', 'vue', 'vue-js']);
    someExists(['nextdotjs', 'next', 'next-js']);
    someExists(['redux']);
    someExists(['sass', 'scss']);
  });
});
