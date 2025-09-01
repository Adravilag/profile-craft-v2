import React from 'react';
import ProjectModal from './ProjectModal';

const sample = {
  id: 'm1',
  title: 'Modal Project',
  shortDescription: 'Descripción larga del proyecto en modal',
  technologies: ['React', 'CSS'],
  media: { type: 'image' as const, src: '/vite.svg' },
  demoUrl: '#',
  repoUrl: '#',
};

export default { title: 'Projects/ProjectModal', component: ProjectModal } as any;

export const Default = () => <ProjectModal project={sample as any} onClose={() => {}} />;
