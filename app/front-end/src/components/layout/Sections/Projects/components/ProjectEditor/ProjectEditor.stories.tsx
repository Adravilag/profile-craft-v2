import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import ProjectEditor from './ProjectEditor';

// Mock the hooks for Storybook
const mockHooks = () => {
  // This will be handled by the component's actual hooks in Storybook
  return {};
};

const meta: Meta<typeof ProjectEditor> = {
  title: 'Features/ProjectEditor',
  component: ProjectEditor,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Editor de proyectos con soporte para HTML, Markdown y vista previa. Incluye funcionalidades de formato, biblioteca de medios y vista previa externa.',
      },
    },
  },
  argTypes: {
    content: {
      control: 'text',
      description: 'Contenido del editor',
    },
    placeholder: {
      control: 'text',
      description: 'Texto de placeholder para el editor',
    },
    onChange: {
      action: 'content-changed',
      description: 'Callback cuando el contenido cambia',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProjectEditor>;

// Wrapper component to handle state
const EditorWrapper = ({
  initialContent = '',
  ...props
}: { initialContent?: string } & Partial<React.ComponentProps<typeof ProjectEditor>>) => {
  const [content, setContent] = useState(initialContent);

  return (
    <div style={{ height: '100vh', padding: '1rem' }}>
      <ProjectEditor
        content={content}
        onChange={setContent}
        placeholder="Escribe el contenido de tu proyecto aquí..."
        {...props}
      />
    </div>
  );
};

export const Default: Story = {
  render: () => <EditorWrapper />,
  parameters: {
    docs: {
      description: {
        story: 'Editor básico en modo HTML sin contenido.',
      },
    },
  },
};

export const WithHTMLContent: Story = {
  render: () => (
    <EditorWrapper
      initialContent={`<h1>Mi Proyecto Increíble</h1>
<p>Este es un proyecto desarrollado con <strong>React</strong> y <em>TypeScript</em>.</p>
<h2>Características</h2>
<ul>
  <li>Interfaz moderna y responsive</li>
  <li>Componentes reutilizables</li>
  <li>Testing completo</li>
</ul>
<h2>Tecnologías</h2>
<ol>
  <li>React 19</li>
  <li>TypeScript</li>
  <li>Vite</li>
  <li>Vitest</li>
</ol>
<p>Puedes ver el código en <a href="https://github.com/usuario/proyecto">GitHub</a>.</p>`}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Editor con contenido HTML completo mostrando diferentes elementos.',
      },
    },
  },
};

export const WithMarkdownContent: Story = {
  render: () => (
    <EditorWrapper
      initialContent={`# Mi Proyecto Increíble

Este es un proyecto desarrollado con **React** y *TypeScript*.

## Características

- Interfaz moderna y responsive
- Componentes reutilizables
- Testing completo

## Tecnologías

1. React 19
2. TypeScript
3. Vite
4. Vitest

Puedes ver el código en [GitHub](https://github.com/usuario/proyecto).

\`\`\`javascript
const proyecto = {
  nombre: 'Mi Proyecto',
  tecnologias: ['React', 'TypeScript']
};
\`\`\``}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Editor con contenido Markdown mostrando sintaxis completa.',
      },
    },
  },
};

export const EmptyState: Story = {
  render: () => <EditorWrapper />,
  parameters: {
    docs: {
      description: {
        story: 'Estado vacío del editor mostrando placeholder.',
      },
    },
  },
};

export const LongContent: Story = {
  render: () => (
    <EditorWrapper
      initialContent={`<h1>Proyecto de Gran Escala</h1>
<p>Este es un proyecto muy extenso que demuestra cómo el editor maneja contenido largo.</p>

<h2>Introducción</h2>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>

<h2>Desarrollo</h2>
<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

<h3>Fase 1: Planificación</h3>
<ul>
  <li>Análisis de requisitos</li>
  <li>Diseño de arquitectura</li>
  <li>Selección de tecnologías</li>
  <li>Planificación de sprints</li>
</ul>

<h3>Fase 2: Desarrollo</h3>
<ol>
  <li>Configuración del entorno</li>
  <li>Desarrollo de componentes base</li>
  <li>Implementación de funcionalidades</li>
  <li>Testing y debugging</li>
</ol>

<h2>Tecnologías Utilizadas</h2>
<p>El proyecto utiliza un stack moderno de tecnologías:</p>
<ul>
  <li><strong>Frontend:</strong> React 19, TypeScript, Vite</li>
  <li><strong>Styling:</strong> CSS Modules, PostCSS, Tailwind</li>
  <li><strong>Testing:</strong> Vitest, Testing Library, Storybook</li>
  <li><strong>Build:</strong> Vite, ESLint, Prettier</li>
</ul>

<h2>Conclusiones</h2>
<p>Este proyecto demuestra la capacidad del editor para manejar contenido extenso manteniendo un buen rendimiento y experiencia de usuario.</p>`}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Editor con contenido extenso para probar el rendimiento y scroll.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  render: () => (
    <EditorWrapper initialContent="<h1>Demo Interactivo</h1><p>Prueba las diferentes funcionalidades del editor.</p>" />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demo interactivo que muestra el cambio entre diferentes modos del editor.',
      },
    },
  },
};

// Mode-specific stories
export const HTMLMode: Story = {
  render: () => (
    <EditorWrapper initialContent="<h1>Modo HTML</h1><p>Editando en <strong>HTML</strong> puro.</p>" />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Editor en modo HTML con toolbar de formateo HTML.',
      },
    },
  },
};

export const MarkdownMode: Story = {
  render: () => (
    <EditorWrapper initialContent="# Modo Markdown\n\nEditando en **Markdown** con sintaxis simplificada." />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Editor en modo Markdown con toolbar de formateo Markdown.',
      },
    },
  },
};

export const PreviewMode: Story = {
  render: () => (
    <EditorWrapper initialContent="<h1>Vista Previa</h1><p>Solo visualización del contenido renderizado.</p>" />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Editor en modo vista previa mostrando solo el contenido renderizado.',
      },
    },
  },
};

export const SplitHorizontal: Story = {
  render: () => (
    <EditorWrapper initialContent="<h1>Vista Dividida Horizontal</h1><p>Editor y vista previa lado a lado.</p>" />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Editor en modo vista dividida horizontal.',
      },
    },
  },
};

export const SplitVertical: Story = {
  render: () => (
    <EditorWrapper initialContent="<h1>Vista Dividida Vertical</h1><p>Editor arriba y vista previa abajo.</p>" />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Editor en modo vista dividida vertical.',
      },
    },
  },
};

// Responsive stories
export const MobileView: Story = {
  render: () => (
    <EditorWrapper initialContent="<h1>Vista Móvil</h1><p>Editor optimizado para dispositivos móviles.</p>" />
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Editor optimizado para vista móvil con controles adaptados.',
      },
    },
  },
};

export const TabletView: Story = {
  render: () => (
    <EditorWrapper initialContent="<h1>Vista Tablet</h1><p>Editor en dispositivos tablet con espacio intermedio.</p>" />
  ),
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Editor en vista tablet con layout adaptado.',
      },
    },
  },
};

// Accessibility stories
export const AccessibilityDemo: Story = {
  render: () => (
    <EditorWrapper initialContent="<h1>Demo de Accesibilidad</h1><p>Navega con el teclado para probar la accesibilidad.</p>" />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demo de características de accesibilidad incluyendo navegación por teclado.',
      },
    },
  },
};

// Error states
export const ErrorState: Story = {
  render: () => (
    <EditorWrapper initialContent="<h1>Estado de Error</h1><p>Simulación de manejo de errores.</p>" />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Manejo de estados de error en el editor.',
      },
    },
  },
};

// Performance testing
export const PerformanceTest: Story = {
  render: () => {
    const largeContent = Array.from(
      { length: 100 },
      (_, i) =>
        `<h2>Sección ${i + 1}</h2><p>Contenido de prueba para la sección ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>`
    ).join('\n');

    return <EditorWrapper initialContent={largeContent} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Test de rendimiento con contenido muy extenso.',
      },
    },
  },
};

// Dark theme (if applicable)
export const DarkTheme: Story = {
  render: () => (
    <div style={{ backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
      <EditorWrapper initialContent="<h1>Tema Oscuro</h1><p>Editor en tema oscuro para desarrolladores.</p>" />
    </div>
  ),
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story: 'Editor en tema oscuro optimizado para desarrolladores.',
      },
    },
  },
};
