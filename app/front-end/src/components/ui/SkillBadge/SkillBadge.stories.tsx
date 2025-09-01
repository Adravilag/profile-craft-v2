import React from 'react';
// Evita importar tipos específicos de Storybook para mantener compatibilidad con la versión instalada
import SkillBadge from './SkillBadge';
import type { SkillBadgeProps } from './SkillBadge';

const meta: any = {
  title: 'Common/SkillBadge',
  component: SkillBadge,
  argTypes: {
    size: { control: 'number' },
    className: { control: 'text' },
  },
};

export default meta;

const Wrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div style={{ padding: 16, display: 'inline-block' }}>{children}</div>
);

const Template = (args: SkillBadgeProps) => (
  <Wrapper>
    <SkillBadge {...args} />
  </Wrapper>
);

export const Default = () => (
  <Template
    {...{ skill: { name: 'TypeScript', level: 85, icon_class: 'fab fa-js' } as any, size: 20 }}
  />
);

export const WithLevel = () => (
  <Template
    {...{ skill: { name: 'React', level: 92, icon_class: 'fab fa-react' } as any, size: 20 }}
  />
);

export const Large = () => (
  <Template
    {...{ skill: { name: 'Node.js', level: 75, icon_class: 'fab fa-node-js' } as any, size: 36 }}
  />
);

export const NameOnly = () => <Template {...{ name: 'CustomTechName', size: 24 }} />;

export const FallbackIcon = () => (
  <Template {...{ skill: { name: 'UnknownTech' } as any, size: 20 }} />
);
