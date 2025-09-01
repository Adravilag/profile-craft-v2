import type { Meta, StoryObj } from '@storybook/react';
import { TextArea } from './TextArea';

const meta: Meta<typeof TextArea> = {
  title: 'UI/TextArea',
  component: TextArea,
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
    showCharacterCount: { control: 'boolean' },
    autoResize: { control: 'boolean' },
    placeholder: { control: 'text' },
    maxLength: { control: 'number' },
    value: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof TextArea>;

export const Default: Story = {
  args: {
    placeholder: 'Escribe tu mensaje aquí...',
    variant: 'default',
    size: 'md',
  },
};

export const WithCharacterCount: Story = {
  args: {
    placeholder: 'Máximo 200 caracteres...',
    maxLength: 200,
    showCharacterCount: true,
    value: 'Este es un ejemplo de texto para mostrar el contador de caracteres.',
  },
};

export const Error: Story = {
  args: {
    placeholder: 'Campo con error',
    error: true,
    value: 'Contenido inválido',
  },
};

export const Success: Story = {
  args: {
    placeholder: 'Campo válido',
    success: true,
    value: 'Contenido válido y correcto.',
  },
};

export const Outlined: Story = {
  args: {
    placeholder: 'Variante outlined',
    variant: 'outlined',
  },
};

export const Filled: Story = {
  args: {
    placeholder: 'Variante filled',
    variant: 'filled',
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
    value: 'Este contenido no se puede editar',
  },
};

export const AutoResize: Story = {
  args: {
    placeholder: 'Este textarea se redimensiona automáticamente...',
    autoResize: true,
    value:
      'Escribe más texto y verás cómo se expande automáticamente.\n\nPuedes agregar múltiples líneas y el componente se ajustará al contenido.',
  },
};

export const LongContent: Story = {
  args: {
    placeholder: 'Contenido largo con límite...',
    maxLength: 500,
    showCharacterCount: true,
    value:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  },
};
