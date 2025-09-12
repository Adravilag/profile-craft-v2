import ProjectWidget from './ProjectWidget';

const meta: any = { title: 'Legacy/Projects/ProjectWidget', component: ProjectWidget };
export default meta;

const project = {
  id: 'p1',
  title: 'Sample Project',
  short_description: 'Una descripción corta del proyecto',
  thumbnail: '/vite.svg',
  technologies: ['React', 'TypeScript', 'Vite'],
};

export const Thumb = () => <ProjectWidget project={project} variant="thumb" />;
export const Compact = () => <ProjectWidget project={project} variant="compact" />;
