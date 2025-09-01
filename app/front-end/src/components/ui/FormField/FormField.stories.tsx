import type { Meta, StoryObj } from '@storybook/react';
import { FormField } from './FormField';
import { Input } from '../Input/Input';
import { TextArea } from '../TextArea/TextArea';
import { Select } from '../Select/Select';

const meta: Meta<typeof FormField> = {
  title: 'UI/FormField',
  component: FormField,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    icon: { control: 'text' },
    error: { control: 'text' },
    helperText: { control: 'text' },
    required: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof FormField>;

export const WithInput: Story = {
  args: {
    label: 'Nombre completo',
    icon: 'fa-user',
    helperText: 'Ingresa tu nombre y apellidos',
    required: true,
    children: <Input placeholder="John Doe" />,
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    icon: 'fa-envelope',
    error: 'Este campo es obligatorio',
    required: true,
    children: <Input placeholder="usuario@email.com" error />,
  },
};

export const WithTextArea: Story = {
  args: {
    label: 'Descripción',
    icon: 'fa-align-left',
    helperText: 'Describe brevemente tu experiencia',
    children: <TextArea placeholder="Escribe aquí..." />,
  },
};

export const WithSelect: Story = {
  args: {
    label: 'País',
    icon: 'fa-globe',
    required: true,
    children: (
      <Select
        placeholder="Selecciona un país"
        options={[
          { value: 'es', label: 'España' },
          { value: 'mx', label: 'México' },
          { value: 'ar', label: 'Argentina' },
          { value: 'co', label: 'Colombia' },
        ]}
      />
    ),
  },
};

export const Valid: Story = {
  args: {
    label: 'Contraseña',
    icon: 'fa-lock',
    helperText: 'La contraseña es válida',
    children: <Input type="password" placeholder="••••••••" value="mypassword123" />,
  },
};
