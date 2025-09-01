import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import TimelineCard from './TimelineCard';

describe('TimelineCard', () => {
  it('should have all required CSS classes defined in camelCase', () => {
    const mockExperience = {
      id: 1,
      company: 'Test Company',
      position: 'Developer',
      start_date: '2023-01-01',
      end_date: '2023-12-31',
      description: 'Test description',
      technologies: ['React', 'TypeScript'],
      achievements: [],
      responsibilities: [],
    };

    const { container } = render(
      <TimelineCard experience={mockExperience} index={0} animationDelay={0} />
    );

    // Verificar que no hay clases undefined en el HTML
    const htmlContent = container.innerHTML;
    expect(htmlContent).not.toContain('undefined');

    // Verificar que las clases principales existen
    const timelineItem = container.querySelector('[class*="timelineItem"]');
    expect(timelineItem).toBeInTheDocument();

    // Verificar que las clases específicas problemáticas tienen equivalentes camelCase
    const cardMediaHero = container.querySelector('[class*="cardMediaHero"]');
    if (cardMediaHero) {
      expect(cardMediaHero.className).not.toContain('undefined');
    }
  });

  it('should render without CSS class errors', () => {
    const { container } = render(
      <TimelineCard
        title="Test Title"
        placeName="Test Place"
        startDate="2023"
        index={0}
        animationDelay={0}
      />
    );

    // No debería haber clases undefined en ninguna parte
    const allElements = container.querySelectorAll('*');
    allElements.forEach(element => {
      expect(element.className).not.toContain('undefined');
    });
  });
});
