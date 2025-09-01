import ProjectCard from './ProjectCard';
import type { Project } from './ProjectCard';

const meta: any = { title: 'Projects/ProjectCard', component: ProjectCard };
export default meta;

const sample: Project = {
  id: 'sample-1',
  title: 'Sample Project',
  shortDescription: 'Una descripción corta del proyecto para la card.',
  technologies: ['React', 'TypeScript', 'Vite'],
  demoUrl: '#',
  repoUrl: '#',
  media: { type: 'image' as const, src: '/vite.svg', poster: '/vite.svg' },
};

export const Default = () => <ProjectCard project={sample} />;
