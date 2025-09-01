import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'switch'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    label: { control: 'text' },
    description: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    label: 'Acepto los términos y condiciones',
    variant: 'default',
    size: 'md',
  },
};

export const Checked: Story = {
  args: {
    label: 'Opción seleccionada',
    checked: true,
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Recibir notificaciones por email',
    description: 'Te enviaremos actualizaciones importantes sobre tu cuenta',
  },
};

export const Error: Story = {
  args: {
    label: 'Campo requerido',
    error: true,
    description: 'Debes aceptar este campo para continuar',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Opción deshabilitada',
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: 'Opción deshabilitada y marcada',
    disabled: true,
    checked: true,
  },
};

export const Indeterminate: Story = {
  args: {
    label: 'Estado indeterminado',
    indeterminate: true,
    description: 'Algunas opciones están seleccionadas',
  },
};

export const Small: Story = {
  args: {
    label: 'Checkbox pequeño',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    label: 'Checkbox grande',
    size: 'lg',
  },
};

// Switch variants
export const Switch: Story = {
  args: {
    label: 'Modo oscuro',
    variant: 'switch',
  },
};

export const SwitchChecked: Story = {
  args: {
    label: 'Notificaciones activadas',
    variant: 'switch',
    checked: true,
  },
};

export const SwitchWithDescription: Story = {
  args: {
    label: 'Sincronización automática',
    variant: 'switch',
    description: 'Sincroniza tus datos automáticamente cada 5 minutos',
  },
};

export const SwitchDisabled: Story = {
  args: {
    label: 'Función premium',
    variant: 'switch',
    disabled: true,
    description: 'Actualiza tu plan para acceder a esta función',
  },
};

export const SwitchSmall: Story = {
  args: {
    label: 'Switch pequeño',
    variant: 'switch',
    size: 'sm',
  },
};

export const SwitchLarge: Story = {
  args: {
    label: 'Switch grande',
    variant: 'switch',
    size: 'lg',
  },
};
