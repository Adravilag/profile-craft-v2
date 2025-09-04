// src/features/skills/contexts/SkillsFilterContext.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SkillsFilterProvider, useSkillsFilter } from './SkillsFilterContext';

// Componente de prueba para usar el context
const TestComponent = () => {
  const { selectedCategory, setSelectedCategory, skillsGrouped, categories } = useSkillsFilter();

  return (
    <div>
      <div data-testid="selected-category">{selectedCategory}</div>
      <div data-testid="categories-count">{categories.length}</div>
      <div data-testid="skills-count">{Object.keys(skillsGrouped).length}</div>
      <button onClick={() => setSelectedCategory('Frontend')} data-testid="change-category">
        Cambiar a Frontend
      </button>
    </div>
  );
};

describe('[TEST] SkillsFilterContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('🔴 [TEST] debe proporcionar datos fallback en desarrollo cuando se usa fuera del provider', () => {
    // Configurar NODE_ENV para desarrollo
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    // Mock console.warn para verificar que se llama
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    try {
      // Renderizar el componente FUERA del provider
      render(<TestComponent />);

      // Debe mostrar datos fallback sin errores
      expect(screen.getByTestId('selected-category')).toHaveTextContent('All');
      expect(screen.getByTestId('categories-count')).toHaveTextContent('1');
      expect(screen.getByTestId('skills-count')).toHaveTextContent('0');

      // Debe mostrar warning
      expect(warnSpy).toHaveBeenCalledWith(
        '[SkillsFilter] useSkillsFilter used outside provider - returning fallback data'
      );
    } finally {
      // Restaurar NODE_ENV
      process.env.NODE_ENV = originalEnv;
      warnSpy.mockRestore();
    }
  });

  it('🔴 [TEST] debe lanzar error en producción cuando se usa fuera del provider', () => {
    // Configurar NODE_ENV para producción
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    try {
      // Renderizar debería fallar
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useSkillsFilter must be used within a SkillsFilterProvider');
    } finally {
      // Restaurar NODE_ENV
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('🔴 [TEST] debe proporcionar el estado inicial del filtro', () => {
    render(
      <SkillsFilterProvider>
        <TestComponent />
      </SkillsFilterProvider>
    );

    expect(screen.getByTestId('selected-category')).toHaveTextContent('All');
    expect(screen.getByTestId('categories-count')).toHaveTextContent('1'); // Al menos 'All'
  });

  it('🔴 [TEST] debe permitir cambiar la categoría seleccionada', async () => {
    render(
      <SkillsFilterProvider>
        <TestComponent />
      </SkillsFilterProvider>
    );

    const button = screen.getByTestId('change-category');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByTestId('selected-category')).toHaveTextContent('Frontend');
  });

  it('🔴 [TEST] debe compartir el estado entre múltiples componentes', () => {
    const Component1 = () => {
      const { selectedCategory } = useSkillsFilter();
      return <div data-testid="component1-category">{selectedCategory}</div>;
    };

    const Component2 = () => {
      const { selectedCategory, setSelectedCategory } = useSkillsFilter();
      return (
        <div>
          <div data-testid="component2-category">{selectedCategory}</div>
          <button onClick={() => setSelectedCategory('Backend')} data-testid="component2-button">
            Set Backend
          </button>
        </div>
      );
    };

    render(
      <SkillsFilterProvider>
        <Component1 />
        <Component2 />
      </SkillsFilterProvider>
    );

    // Ambos componentes deben mostrar la misma categoría inicial
    expect(screen.getByTestId('component1-category')).toHaveTextContent('All');
    expect(screen.getByTestId('component2-category')).toHaveTextContent('All');

    // Cambiar desde el componente 2
    act(() => {
      fireEvent.click(screen.getByTestId('component2-button'));
    });

    // Ambos componentes deben reflejar el cambio
    expect(screen.getByTestId('component1-category')).toHaveTextContent('Backend');
    expect(screen.getByTestId('component2-category')).toHaveTextContent('Backend');
  });
});
