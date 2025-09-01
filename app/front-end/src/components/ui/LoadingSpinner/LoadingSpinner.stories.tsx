// src/components/ui/LoadingSpinner/LoadingSpinner.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { LoadingSpinner } from './LoadingSpinner';

const meta: Meta<typeof LoadingSpinner> = {
  title: 'UI/LoadingSpinner',
  component: LoadingSpinner,
  args: {
    size: 'medium',
    variant: 'default',
    label: 'Cargando…',
    fullScreen: false,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large', 'xlarge', 32, 64],
      description: 'Tamaño del spinner',
    },
    variant: {
      control: 'select',
      options: ['default', 'pulse', 'gradient', 'dots'],
      description: 'Variante visual del spinner',
    },
    color: {
      control: 'color',
      description: 'Color personalizado del spinner',
    },
    fullScreen: {
      control: 'boolean',
      description: 'Mostrar como overlay de pantalla completa',
    },
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Componente de spinner de carga con múltiples variantes y opciones de personalización.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof LoadingSpinner>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Spinner básico con configuración por defecto.',
      },
    },
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner variant="default" size="large" />
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>Default</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner variant="pulse" size="large" />
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>Pulse</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner variant="gradient" size="large" />
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>Gradient</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner variant="dots" size="large" />
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>Dots</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Diferentes variantes visuales del spinner.',
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner size="small" />
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>Small (16px)</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner size="medium" />
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>Medium (24px)</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner size="large" />
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>Large (48px)</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner size="xlarge" />
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>XLarge (64px)</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Diferentes tamaños disponibles para el spinner.',
      },
    },
  },
};

export const WithText: Story = {
  render: args => <LoadingSpinner {...args}>Cargando datos…</LoadingSpinner>,
  parameters: {
    docs: {
      description: {
        story: 'Spinner con texto descriptivo personalizado.',
      },
    },
  },
};

export const CustomColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <LoadingSpinner size="large" color="#ff6b6b" />
      <LoadingSpinner size="large" color="#4ecdc4" />
      <LoadingSpinner size="large" color="#45b7d1" />
      <LoadingSpinner size="large" color="#96ceb4" />
      <LoadingSpinner size="large" color="#feca57" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Spinners con colores personalizados.',
      },
    },
  },
};

export const ColoredContext: Story = {
  render: args => (
    <div style={{ color: '#646cff', padding: '1rem' }}>
      <LoadingSpinner {...args}>Color heredado del contexto</LoadingSpinner>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Spinner que hereda el color del contexto padre.',
      },
    },
  },
};

export const FullScreen: Story = {
  args: {
    fullScreen: true,
    size: 'xlarge',
    variant: 'gradient',
  },
  parameters: {
    docs: {
      description: {
        story: 'Spinner mostrado como overlay de pantalla completa con efectos visuales mejorados.',
      },
    },
  },
};

export const LoadingStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <LoadingSpinner size="small" />
        <span>Cargando...</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <LoadingSpinner size="medium" variant="pulse" />
        <span>Procesando datos...</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <LoadingSpinner size="large" variant="gradient" />
        <span>Sincronizando...</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Ejemplos de uso del spinner en diferentes contextos de carga.',
      },
    },
  },
};
