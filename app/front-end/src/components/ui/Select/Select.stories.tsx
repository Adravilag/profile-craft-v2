import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
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
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

const countryOptions = [
  { value: 'es', label: 'España' },
  { value: 'mx', label: 'México' },
  { value: 'ar', label: 'Argentina' },
  { value: 'co', label: 'Colombia' },
  { value: 'pe', label: 'Perú' },
  { value: 'cl', label: 'Chile' },
];

const techOptions = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue.js' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
];

export const Default: Story = {
  args: {
    options: countryOptions,
    placeholder: 'Selecciona un país',
    variant: 'default',
    size: 'md',
  },
};

export const WithIcon: Story = {
  args: {
    options: techOptions,
    placeholder: 'Selecciona una tecnología',
    icon: <i className="fas fa-code" />,
  },
};

export const Error: Story = {
  args: {
    options: countryOptions,
    placeholder: 'Campo requerido',
    error: true,
  },
};

export const Success: Story = {
  args: {
    options: countryOptions,
    placeholder: 'Selección válida',
    success: true,
    value: 'es',
  },
};

export const Outlined: Story = {
  args: {
    options: countryOptions,
    placeholder: 'Variante outlined',
    variant: 'outlined',
  },
};

export const Filled: Story = {
  args: {
    options: countryOptions,
    placeholder: 'Variante filled',
    variant: 'filled',
  },
};

export const Small: Story = {
  args: {
    options: techOptions,
    placeholder: 'Tamaño pequeño',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    options: techOptions,
    placeholder: 'Tamaño grande',
    size: 'lg',
  },
};

export const Disabled: Story = {
  args: {
    options: countryOptions,
    placeholder: 'Campo deshabilitado',
    disabled: true,
  },
};

export const WithDisabledOptions: Story = {
  args: {
    options: [
      { value: 'option1', label: 'Opción habilitada' },
      { value: 'option2', label: 'Opción deshabilitada', disabled: true },
      { value: 'option3', label: 'Otra opción habilitada' },
      { value: 'option4', label: 'Otra opción deshabilitada', disabled: true },
    ],
    placeholder: 'Opciones mixtas',
  },
};

export const FullWidth: Story = {
  args: {
    options: countryOptions,
    placeholder: 'Ancho completo',
    fullWidth: true,
  },
};
