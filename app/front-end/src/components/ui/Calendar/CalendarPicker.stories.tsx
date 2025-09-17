import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import CalendarPicker from './CalendarPicker';
// Using a simple console logger instead of addon-actions to avoid addon mismatch in some environments

const meta: Meta<typeof CalendarPicker> = {
  title: 'UI/Calendar/CalendarPicker',
  component: CalendarPicker,
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    onSelect: { action: 'selected' },
  },
};

export default meta;

type Story = StoryObj<typeof CalendarPicker>;

export const Default: Story = {
  args: {
    placeholder: 'DD-MM-YYYY',
    onSelect: (d: Date | null) => console.log('onSelect', d),
  },
};

export const WithSelectedDate: Story = {
  args: {
    initial: new Date(),
    placeholder: 'DD-MM-YYYY',
    onSelect: (d: Date | null) => console.log('onSelect', d),
  },
};
