import type { Meta, StoryObj } from '@storybook/react';
import SkillPill from './SkillPill';

const meta: Meta<typeof SkillPill> = {
  title: 'UI/SkillPill',
  component: SkillPill,
  tags: ['autodocs'],
  args: {
    slug: 'TypeScript',
    colored: false,
    forceActive: false,
  },
  argTypes: {
    slug: { control: 'text' },
    level: { control: { type: 'number', min: 0, max: 100, step: 1 } },
    colored: { control: 'boolean' },
    forceActive: { control: 'boolean' },
    className: { control: 'text' },
    closable: { control: 'boolean' },
    onClose: { action: 'onClose' },
  },
};

export default meta;
type Story = StoryObj<typeof SkillPill>;

export const Default: Story = {
  args: {},
};

export const Colored: Story = {
  args: {
    slug: 'React',
    colored: true,
  },
};

export const WithLevel: Story = {
  args: {
    slug: 'Node.js',
    level: 76,
    colored: true,
  },
};

export const Closable: Story = {
  args: {
    slug: 'Vue.js',
    level: 78,
    colored: true,
    closable: true,
    onClose: (skillName: string) => console.log('Cerrar skill:', skillName),
  },
};

export const ClosableWithoutLevel: Story = {
  args: {
    slug: 'Angular',
    colored: true,
    closable: true,
    onClose: (skillName: string) => console.log('Cerrar skill:', skillName),
  },
};

export const HoverOnly: Story = {
  args: {
    slug: 'Docker',
    colored: false,
  },
};

export const Multiple: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <SkillPill slug="TypeScript" colored />
      <SkillPill slug="React" colored closable onClose={name => console.log('Cerrar:', name)} />
      <SkillPill slug="Node.js" level={70} />
      <SkillPill slug="GraphQL" />
      <SkillPill slug="Docker" colored forceActive />
    </div>
  ),
};

export const ClosableGroup: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <SkillPill slug="React" colored closable onClose={name => console.log('Cerrar:', name)} />
      <SkillPill
        slug="Vue.js"
        name="Vue.js"
        level={85}
        colored
        closable
        onClose={name => console.log('Cerrar:', name)}
      />
      <SkillPill slug="Angular" colored closable onClose={name => console.log('Cerrar:', name)} />
      <SkillPill
        slug="Svelte"
        name="Svelte"
        level={70}
        colored
        closable
        onClose={name => console.log('Cerrar:', name)}
      />
    </div>
  ),
};
