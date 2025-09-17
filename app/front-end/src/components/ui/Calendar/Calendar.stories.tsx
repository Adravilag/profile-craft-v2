import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import Calendar from './Calendar';

const meta: Meta<typeof Calendar> = {
  title: 'Componentes/Calendario',
  component: Calendar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [],
};

export default meta;
type Story = StoryObj<typeof Calendar>;

// Stateful wrapper so stories can be interactive and show the selected date
const StatefulTemplate = (args: Record<string, any>) => {
  const [date, setDate] = useState<Date | null>(
    args.selectedDate ? new Date(args.selectedDate) : null
  );

  return (
    <div style={{ padding: 12 }}>
      <Calendar {...(args as any)} selectedDate={date} onChange={(d: Date | null) => setDate(d)} />
      <div style={{ marginTop: 8, color: 'var(--md-sys-color-on-surface-variant, #a1a1a1)' }}>
        Selected: {date ? date.toISOString().slice(0, 10) : 'none'}
      </div>
    </div>
  );
};

export const Completo: Story = {
  render: args => <StatefulTemplate {...(args as Record<string, any>)} />,
  args: {
    selectedDate: null,
    dateFormat: 'dd-MM-yyyy',
    placeholderText: 'DD-MM-YYYY',
    showMonthYearPicker: false,
    disabled: false,
  },
};

export const WithSelectedDate: Story = {
  render: args => <StatefulTemplate {...(args as Record<string, any>)} />,
  args: {
    selectedDate: new Date().toISOString(),
    dateFormat: 'dd-MM-yyyy',
    placeholderText: 'DD-MM-YYYY',
  },
};

export const MonthYearPicker: Story = {
  render: args => <StatefulTemplate {...(args as Record<string, any>)} />,
  args: {
    selectedDate: '2025-09-01',
    showMonthYearPicker: true,
    dateFormat: 'MM-yyyy',
    placeholderText: 'MM-YYYY',
  },
};

export const DarkTheme: Story = {
  render: args => (
    <div style={{ background: '#111', padding: 16 }}>
      <StatefulTemplate {...(args as Record<string, any>)} />
    </div>
  ),
  args: {
    selectedDate: null,
  },
};

export const PickerCompact: Story = {
  render: () => {
    const CalendarPicker = require('./CalendarPicker').default;
    return (
      <div style={{ padding: 8 }}>
        <CalendarPicker />
      </div>
    );
  },
  args: {},
};
