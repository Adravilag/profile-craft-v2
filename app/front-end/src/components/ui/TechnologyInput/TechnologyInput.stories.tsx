import type { Meta, StoryObj } from '@storybook/react';
import { TechnologyInput } from './TechnologyInput';
import { useState } from 'react';

const meta: Meta<typeof TechnologyInput> = {
  title: 'UI/TechnologyInput',
  component: TechnologyInput,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'object' },
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
    maxTechnologies: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof TechnologyInput>;

const techSuggestions = [
  'React',
  'Vue.js',
  'Angular',
  'JavaScript',
  'TypeScript',
  'Node.js',
  'Express.js',
  'Next.js',
  'Nuxt.js',
  'Python',
  'Django',
  'Flask',
  'Java',
  'Spring Boot',
  'C#',
  '.NET',
  'PHP',
  'Laravel',
  'HTML5',
  'CSS3',
  'SASS',
  'SCSS',
  'Tailwind CSS',
  'Bootstrap',
  'Material-UI',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'Google Cloud',
  'MongoDB',
  'PostgreSQL',
  'MySQL',
  'Redis',
  'GraphQL',
  'REST API',
  'Git',
  'GitHub',
  'GitLab',
  'Jenkins',
  'Webpack',
  'Vite',
  'ESLint',
  'Prettier',
];

// Wrapper component para manejar el estado
const TechnologyInputWrapper = (args: any) => {
  const [technologies, setTechnologies] = useState<string[]>(args.value || []);

  return <TechnologyInput {...args} value={technologies} onChange={setTechnologies} />;
};

export const Default: Story = {
  render: args => <TechnologyInputWrapper {...args} />,
  args: {
    suggestions: techSuggestions,
    placeholder: 'Escribe y presiona Enter para agregar...',
  },
};

export const WithInitialValues: Story = {
  render: args => <TechnologyInputWrapper {...args} />,
  args: {
    value: ['React', 'TypeScript', 'Node.js'],
    suggestions: techSuggestions,
    placeholder: 'Agregar más tecnologías...',
  },
};

export const WithMaxLimit: Story = {
  render: args => <TechnologyInputWrapper {...args} />,
  args: {
    value: ['React', 'TypeScript'],
    suggestions: techSuggestions,
    maxTechnologies: 5,
    placeholder: 'Máximo 5 tecnologías...',
  },
};

export const Error: Story = {
  render: args => <TechnologyInputWrapper {...args} />,
  args: {
    value: ['InvalidTech'],
    suggestions: techSuggestions,
    error: true,
    placeholder: 'Campo con error...',
  },
};

export const Disabled: Story = {
  render: args => <TechnologyInputWrapper {...args} />,
  args: {
    value: ['React', 'TypeScript'],
    suggestions: techSuggestions,
    disabled: true,
    placeholder: 'Campo deshabilitado...',
  },
};

export const NoSuggestions: Story = {
  render: args => <TechnologyInputWrapper {...args} />,
  args: {
    value: ['CustomTech1', 'CustomTech2'],
    suggestions: [],
    placeholder: 'Sin sugerencias, escribe libremente...',
  },
};

export const LongTechnologyNames: Story = {
  render: args => <TechnologyInputWrapper {...args} />,
  args: {
    value: [
      'React with TypeScript',
      'Spring Boot Framework',
      'Amazon Web Services (AWS)',
      'PostgreSQL Database',
      'Docker Containerization',
    ],
    suggestions: techSuggestions,
    placeholder: 'Tecnologías con nombres largos...',
  },
};

export const ManyTechnologies: Story = {
  render: args => <TechnologyInputWrapper {...args} />,
  args: {
    value: [
      'React',
      'TypeScript',
      'Node.js',
      'Express.js',
      'MongoDB',
      'PostgreSQL',
      'Docker',
      'AWS',
      'Git',
      'Webpack',
      'SASS',
      'Jest',
    ],
    suggestions: techSuggestions,
    placeholder: 'Muchas tecnologías...',
  },
};
