import * as React from 'react';
import { render } from '@testing-library/react';
import SkillCard from './SkillCard';

// Minimal mock data for the component
const mockSkill = {
  id: '1',
  name: 'React',
  level: 80,
  featured: false,
};

const mockIcons: any[] = [];

it('mounts without throwing and does not cause update loop', () => {
  const { container } = render(
    <SkillCard
      skill={mockSkill as any}
      skillsIcons={mockIcons}
      onEdit={undefined}
      onDelete={undefined}
      onDragStart={() => {}}
      onDragOver={() => {}}
      onDrop={() => {}}
      isDragging={false}
    />
  );

  expect(container).toBeTruthy();
});

export {};
