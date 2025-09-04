// src/features/skills/components/integration/SkillsFilterIntegration.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SkillsFilterProvider, useSkillsFilter } from '../../contexts/SkillsFilterContext';
import '@testing-library/jest-dom';

// Componente de prueba que usa el contexto
const TestFilterConsumer: React.FC = () => {
  const { selectedCategory, setSelectedCategory, categories, filteredGrouped } = useSkillsFilter();

  return (
    <div>
      <div data-testid="current-category">{selectedCategory}</div>
      <div data-testid="categories-count">{categories.length}</div>
      <div data-testid="filtered-groups">{Object.keys(filteredGrouped).join(', ')}</div>
      {categories.map(category => (
        <button
          key={category}
          data-testid={`category-${category.toLowerCase()}`}
          onClick={() => setSelectedCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

// Componente que muestra las habilidades filtradas (simula SkillsGrid)
const TestSkillsDisplay: React.FC = () => {
  const { filteredGrouped } = useSkillsFilter();

  return (
    <div data-testid="skills-display">
      {Object.entries(filteredGrouped).map(([category, skills]) => (
        <div key={category} data-testid={`category-section-${category.toLowerCase()}`}>
          <h3>{category}</h3>
          <div data-testid={`skills-count-${category.toLowerCase()}`}>{skills.length} skills</div>
          {skills.map((skill: any) => (
            <div key={skill.id} data-testid={`skill-${skill.name.toLowerCase()}`}>
              {skill.name}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <SkillsFilterProvider>{component}</SkillsFilterProvider>
    </BrowserRouter>
  );
};

describe('[TEST] Skills Filter Integration - Context Updates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('🔴 [TEST] debería actualizar filteredGrouped cuando cambia selectedCategory', async () => {
    renderWithProvider(
      <div>
        <TestFilterConsumer />
        <TestSkillsDisplay />
      </div>
    );

    // Verificar estado inicial
    expect(screen.getByTestId('current-category')).toHaveTextContent('All');

    // Cambiar a una categoría específica
    const frontendButton = screen.getByTestId('category-frontend');
    fireEvent.click(frontendButton);

    // Verificar que el contexto se actualiza
    await waitFor(() => {
      expect(screen.getByTestId('current-category')).toHaveTextContent('Frontend');
    });

    // Verificar que el display de skills se actualiza
    await waitFor(() => {
      const skillsDisplay = screen.getByTestId('skills-display');
      expect(skillsDisplay).toBeInTheDocument();
    });
  });

  it('🔴 [TEST] debería sincronizar estado entre múltiples consumidores del contexto', async () => {
    renderWithProvider(
      <div>
        <TestFilterConsumer />
        <TestSkillsDisplay />
        <TestFilterConsumer />
      </div>
    );

    const frontendButtons = screen.getAllByTestId('category-frontend');
    const categoryDisplays = screen.getAllByTestId('current-category');

    // Verificar estado inicial en ambos consumidores
    categoryDisplays.forEach(display => {
      expect(display).toHaveTextContent('All');
    });

    // Cambiar categoría desde el primer consumidor
    fireEvent.click(frontendButtons[0]);

    // Verificar que ambos consumidores se actualizan
    await waitFor(() => {
      categoryDisplays.forEach(display => {
        expect(display).toHaveTextContent('Frontend');
      });
    });
  });

  it('🔴 [TEST] debería mantener consistencia al cambiar entre categorías', async () => {
    renderWithProvider(
      <div>
        <TestFilterConsumer />
        <TestSkillsDisplay />
      </div>
    );

    // Cambiar a Backend
    fireEvent.click(screen.getByTestId('category-backend'));

    await waitFor(() => {
      expect(screen.getByTestId('current-category')).toHaveTextContent('Backend');
    });

    // Cambiar a DevOps
    fireEvent.click(screen.getByTestId('category-devops & tools'));

    await waitFor(() => {
      expect(screen.getByTestId('current-category')).toHaveTextContent('DevOps & Tools');
    });

    // Volver a All
    fireEvent.click(screen.getByTestId('category-all'));

    await waitFor(() => {
      expect(screen.getByTestId('current-category')).toHaveTextContent('All');
    });
  });
});
