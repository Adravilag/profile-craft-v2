// src/app/RootLayout.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import {
  RouterProvider,
  createMemoryRouter,
  createRoutesFromElements,
  Route,
  Link,
} from 'react-router-dom';
import RootLayout from './RootLayout';

// --- Páginas de ejemplo para el <Outlet /> ---
function HomePage() {
  return (
    <section style={{ display: 'grid', gap: 12 }}>
      <h1>Home</h1>
      <p>Esta es una página de ejemplo. Usa los enlaces para navegar.</p>
      <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Link to="/">Inicio</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/dashboard/users">Usuarios</Link>
        <Link to="/settings/profile">Perfil</Link>
        <Link to="/lorem-ipsum">Ruta sin mapping</Link>
      </nav>
    </section>
  );
}

function LongContentPage() {
  return (
    <section>
      <h1>Contenido Largo</h1>
      <p>
        Generamos bastante texto para comprobar el comportamiento del main y el scroll dentro del
        contenedor.
      </p>
      <div style={{ display: 'grid', gap: 12 }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <p key={i}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante
            venenatis dapibus posuere velit aliquet. (#{i + 1})
          </p>
        ))}
      </div>
    </section>
  );
}

function UsersPage() {
  return (
    <section style={{ display: 'grid', gap: 8 }}>
      <h1>Usuarios</h1>
      <p>Listado de usuarios de ejemplo.</p>
      <ul>
        <li>Jane Doe</li>
        <li>John Smith</li>
        <li>Foo Bar</li>
      </ul>
    </section>
  );
}

// --- Helper para crear un Router con RootLayout como layout raíz ---
function makeRouter(initialEntries: string[]) {
  const routes = createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<HomePage />} />
      <Route path="dashboard" element={<HomePage />} />
      <Route path="dashboard/users" element={<UsersPage />} />
      <Route path="settings/profile" element={<HomePage />} />
      <Route path="lorem-ipsum" element={<LongContentPage />} />
      <Route path="*" element={<HomePage />} />
    </Route>
  );

  return createMemoryRouter(routes, { initialEntries });
}

// --- Decorador para inyectar el RouterProvider ---
const withRouter =
  (initialPath = '/') =>
  (Story: React.ComponentType) => {
    const router = makeRouter([initialPath]);
    return (
      <div style={{ minHeight: '100vh' }}>
        <RouterProvider router={router} />
      </div>
    );
  };

const meta: Meta<typeof RootLayout> = {
  title: 'App/Layout/RootLayout',
  component: RootLayout,
  parameters: {
    layout: 'fullscreen',
  },
};
export default meta;

type Story = StoryObj<typeof RootLayout>;

export const Default: Story = {
  name: 'Default (Home)',
  decorators: [withRouter('/')],
};

export const WithLongContent: Story = {
  name: 'Contenido largo en main',
  decorators: [withRouter('/lorem-ipsum')],
};

export const DashboardUsers: Story = {
  name: 'Ruta anidada: /dashboard/users',
  decorators: [withRouter('/dashboard/users')],
};

export const MobileView: Story = {
  name: 'Vista móvil',
  decorators: [withRouter('/dashboard')],
  parameters: {
    viewport: {
      defaultViewport: 'mobile1', // usa el addon viewport de Storybook
    },
  },
};
