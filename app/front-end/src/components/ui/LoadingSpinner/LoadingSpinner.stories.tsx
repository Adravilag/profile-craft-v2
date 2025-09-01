// src/components/ui/LoadingSpinner/LoadingSpinner.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { LoadingSpinner } from './LoadingSpinner';

const meta: Meta<typeof LoadingSpinner> = {
  title: 'UI/LoadingSpinner',
  component: LoadingSpinner,
  args: {
    size: 24,
    label: 'Cargando…',
    fullScreen: false,
  },
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj<typeof LoadingSpinner>;

export const Default: Story = {};

export const WithText: Story = {
  render: args => <LoadingSpinner {...args}>Cargando datos…</LoadingSpinner>,
};

export const Large: Story = {
  args: { size: 48 },
};

export const Colored: Story = {
  render: args => (
    <div style={{ color: '#646cff' }}>
      <LoadingSpinner {...args}>Color heredado</LoadingSpinner>
    </div>
  ),
};

export const FullScreen: Story = {
  args: { fullScreen: true, size: 40 },
};
