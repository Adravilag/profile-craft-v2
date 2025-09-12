// Storybook story kept as placeholder for the removed ProjectModal.
import type { Meta } from '@storybook/react';
import ProjectModal from './ProjectModal';

const meta: Meta<typeof ProjectModal> = {
  title: 'Projects/ProjectModal',
  component: ProjectModal,
};

export default meta;

export const Default = () => <ProjectModal />;
