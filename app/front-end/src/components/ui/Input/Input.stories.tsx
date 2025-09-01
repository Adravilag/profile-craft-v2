import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'outlined', 'filled'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    error: { control: 'boolean' },
    success: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
    value: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Escribe algo...',
    variant: 'default',
    size: 'md',
  },
};

export const WithStartIcon: Story = {
  args: {
    placeholder: 'Buscar...',
    startIcon: <i className="fas fa-search" />,
    variant: 'default',
    size: 'md',
  },
};

export const WithEndIcon: Story = {
  args: {
    placeholder: 'Contraseña',
    type: 'password',
    endIcon: <i className="fas fa-eye" />,
    variant: 'default',
    size: 'md',
  },
};

export const Error: Story = {
  args: {
    placeholder: 'Email inválido',
    value: 'invalid-email',
    error: true,
    variant: 'default',
    size: 'md',
  },
};

export const Success: Story = {
  args: {
    placeholder: 'Email válido',
    value: 'user@example.com',
    success: true,
    variant: 'default',
    size: 'md',
  },
};

export const Outlined: Story = {
  args: {
    placeholder: 'Variante outlined',
    variant: 'outlined',
    size: 'md',
  },
};

export const Filled: Story = {
  args: {
    placeholder: 'Variante filled',
    variant: 'filled',
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    placeholder: 'Tamaño pequeño',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    placeholder: 'Tamaño grande',
    size: 'lg',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Campo deshabilitado',
    disabled: true,
    value: 'No editable',
  },
};

export const FullWidth: Story = {
  args: {
    placeholder: 'Ancho completo',
    fullWidth: true,
  },
};
