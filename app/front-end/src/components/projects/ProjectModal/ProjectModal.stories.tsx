import type { Meta, StoryObj } from '@storybook/react';
import ProjectModal from './ProjectModal';
import type { Project } from '../../layout/Sections/Projects/components/ProjectCard/ProjectCard';

const meta: Meta<typeof ProjectModal> = {
  title: 'Legacy/Projects/ProjectModal',
  component: ProjectModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Modal refactorizado que utiliza ModalShell y botones configurables para mostrar detalles de proyectos.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    project: {
      description: 'Datos del proyecto a mostrar',
    },
    onClose: {
      description: 'Función que se ejecuta al cerrar el modal',
      action: 'onClose',
    },
    isOpen: {
      description: 'Controla si el modal está abierto o cerrado',
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleProject: Project = {
  id: 'sample-project',
  title: 'Profile Craft',
  shortDescription:
    'Una aplicación completa para crear y gestionar perfiles profesionales con tecnologías modernas. Incluye autenticación, gestión de proyectos, y una interfaz elegante construida con React y Material Design.',
  technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Material Design', 'Vite'],
  media: {
    type: 'image',
    src: 'https://via.placeholder.com/800x600/4f46e5/ffffff?text=Profile+Craft',
    poster: 'https://via.placeholder.com/800x600/4f46e5/ffffff?text=Profile+Craft',
  },
  demoUrl: 'https://profile-craft-demo.com',
  repoUrl: 'https://github.com/user/profile-craft',
};

const videoProject: Project = {
  id: 'video-project',
  title: 'Video Demo Project',
  shortDescription:
    'Un proyecto que incluye demo en video para mostrar las capacidades multimedia del modal.',
  technologies: ['React', 'Video.js', 'WebRTC'],
  media: {
    type: 'video',
    src: 'https://www.w3schools.com/html/mov_bbb.mp4',
    poster: 'https://via.placeholder.com/800x600/059669/ffffff?text=Video+Demo',
  },
  demoUrl: 'https://video-project-demo.com',
  repoUrl: 'https://github.com/user/video-project',
};

const minimalProject: Project = {
  id: 'minimal-project',
  title: 'Proyecto Minimalista',
  shortDescription:
    'Un proyecto simple sin enlaces externos para demostrar el comportamiento cuando no hay botones de acción.',
  technologies: ['HTML', 'CSS', 'JavaScript'],
  media: {
    type: 'image',
    src: 'https://via.placeholder.com/800x600/dc2626/ffffff?text=Minimal+Project',
  },
};

export const Default: Story = {
  args: {
    project: sampleProject,
    isOpen: true,
  },
};

export const WithVideo: Story = {
  args: {
    project: videoProject,
    isOpen: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal con contenido de video en lugar de imagen.',
      },
    },
  },
};

export const MinimalProject: Story = {
  args: {
    project: minimalProject,
    isOpen: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Proyecto sin enlaces externos - no muestra botones de acción.',
      },
    },
  },
};

export const Closed: Story = {
  args: {
    project: sampleProject,
    isOpen: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal cerrado - no renderiza contenido.',
      },
    },
  },
};

export const ManyTechnologies: Story = {
  args: {
    project: {
      ...sampleProject,
      technologies: [
        'React',
        'TypeScript',
        'Node.js',
        'MongoDB',
        'Material Design',
        'Vite',
        'ESLint',
        'Prettier',
        'Jest',
        'Cypress',
        'Docker',
        'AWS',
        'GraphQL',
        'Redis',
        'WebSocket',
      ],
    },
    isOpen: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Proyecto con muchas tecnologías para probar el wrap de badges.',
      },
    },
  },
};
