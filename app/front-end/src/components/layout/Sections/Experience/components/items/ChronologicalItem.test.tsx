import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

// Mock date utils to have deterministic outputs
vi.mock('@/utils/dateUtils', () => ({
  formatDateRange: (s: string, e: string) => `${s} - ${e}`,
  calculateDuration: (s: string, e: string) => `Duration: ${s}->${e}`,
  formatDateFromInput: (d: string) => d || 'Presente',
}));

import ChronologicalItem from './ChronologicalItem';

const sampleExperience = {
  _id: 'exp1',
  title: 'Senior Developer',
  start_date: 'Enero 2020',
  end_date: 'Presente',
  description: 'Worked on awesome products',
  type: 'experience' as const,
  company: 'ACME Corp',
  technologies: ['React', 'Node.js'],
};

const sampleEducation = {
  _id: 'edu1',
  title: 'Computer Science BSc',
  start_date: '2015',
  end_date: '2019',
  description: 'Studied computer science',
  type: 'education' as const,
  institution: 'Universidad Ejemplo',
  grade: 'A',
};

describe('ChronologicalItem', () => {
  it('renders experience item with period, duration and technologies', () => {
    render(<ChronologicalItem item={sampleExperience as any} index={0} position="left" />);

    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    expect(screen.getByText('ACME Corp')).toBeInTheDocument();
    expect(screen.getByText('Enero 2020 - Presente')).toBeInTheDocument();
    expect(screen.getByText(/Duration: Enero 2020->Presente/)).toBeInTheDocument();

    // technologies should render as timeline-skill spans
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();

    // classes: should include 'experience' and 'left' in the root element
    const root = screen.getByText('Senior Developer').closest('.chronological-item');
    expect(root).toBeTruthy();
    if (root) {
      expect(root.className).toContain('experience');
      expect(root.className).toContain('left');
    }
  });

  it('renders education item with grade', () => {
    render(<ChronologicalItem item={sampleEducation as any} index={1} position="right" />);

    expect(screen.getByText('Computer Science BSc')).toBeInTheDocument();
    expect(screen.getByText('Universidad Ejemplo')).toBeInTheDocument();
    expect(screen.getByText('2015 - 2019')).toBeInTheDocument();
    expect(screen.getByText('Calificación: A')).toBeInTheDocument();

    const root = screen.getByText('Computer Science BSc').closest('.chronological-item');
    expect(root).toBeTruthy();
    if (root) {
      expect(root.className).toContain('education');
      expect(root.className).toContain('right');
    }
  });
});
