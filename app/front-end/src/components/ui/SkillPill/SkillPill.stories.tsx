import type { Meta, StoryObj } from '@storybook/react';
import SkillPill from './SkillPill';

const meta: Meta<typeof SkillPill> = {
  title: 'UI/SkillPill',
  component: SkillPill,
  tags: ['autodocs'],
  args: {
    name: 'TypeScript',
    colored: false,
    forceActive: false,
  },
  argTypes: {
    name: { control: 'text' },
    level: { control: { type: 'number', min: 0, max: 100, step: 1 } },
    colored: { control: 'boolean' },
    forceActive: { control: 'boolean' },
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof SkillPill>;

export const Default: Story = {
  args: {},
};

export const Colored: Story = {
  args: {
    name: 'React',
    colored: true,
  },
};

export const WithLevel: Story = {
  args: {
    name: 'Node.js',
    level: 76,
    colored: true,
  },
};

export const HoverOnly: Story = {
  args: {
    name: 'Docker',
    colored: false,
  },
};

export const Multiple: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <SkillPill name="TypeScript" colored />
      <SkillPill name="React" colored />
      <SkillPill name="Node.js" level={70} />
      <SkillPill name="GraphQL" />
      <SkillPill name="Docker" colored forceActive />
    </div>
  ),
};
