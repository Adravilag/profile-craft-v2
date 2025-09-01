// src/app/RootLayout.test.tsx
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router-dom';

// Importar contextos necesarios
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { UnifiedThemeProvider } from '@/contexts/UnifiedThemeContext';
import { TranslationProvider } from '@/contexts/TranslationContext';

// jsdom no implementa scrollTo y lo usa ScrollRestoration
beforeAll(() => {
  window.scrollTo = vi.fn();
});

// Mock de hooks que no necesitan contextos completos
vi.mock('@/hooks/useNotification', () => ({
  useNotificationContext: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

// ---- mock useNavigation con estado mutable ----
let navState: 'idle' | 'loading' = 'idle';
vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigation: () => ({ state: navState }),
  };
});

// Páginas dummy
function Home() {
  return <div>Home content</div>;
}
function About() {
  return <div>About content</div>;
}

// Wrapper con todos los proveedores necesarios
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NotificationProvider>
    <AuthProvider>
      <UnifiedThemeProvider>
        <TranslationProvider>{children}</TranslationProvider>
      </UnifiedThemeProvider>
    </AuthProvider>
  </NotificationProvider>
);

// SUT
import RootLayout from '@/components/layout/RootLayout/RootLayout';

// Helper para crear un router con RootLayout y rutas hijas dummy

function makeRouter(initialPath = '/') {
  const routes: RouteObject[] = [
    {
      path: '/',
      element: <RootLayout />,
      children: [
        { index: true, element: <Home /> },
        { path: 'about', element: <About /> },
      ],
    },
  ];
  return createMemoryRouter(routes, { initialEntries: [initialPath] });
}

describe('RootLayout', () => {
  it('renderiza header, sidebar, footer y el contenido del Outlet', () => {
    navState = 'idle';
    const router = makeRouter('/');
    render(
      <TestWrapper>
        <RouterProvider router={router} />
      </TestWrapper>
    );

    // Header: hay 2 'banner' (wrapper y el Header). Nos quedamos con el interior (último).
    const banners = screen.getAllByRole('banner');
    const header = banners[banners.length - 1];
    expect(within(header).getByRole('heading', { name: /mi app/i })).toBeInTheDocument();

    // Sidebar (navigation)
    expect(screen.getByRole('navigation', { name: /navegación principal/i })).toBeInTheDocument();

    // Main + contenido
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByText(/home content/i)).toBeInTheDocument();

    // Footer: también hay 2 'contentinfo' (wrapper y Footer). Tomamos el último.
    const contentinfos = screen.getAllByRole('contentinfo');
    const footer = contentinfos[contentinfos.length - 1];
    expect(within(footer).getByText(/mi app/i)).toBeInTheDocument();
  });

  it('marca <main> con aria-busy cuando navigation=loading y muestra el top loader', () => {
    navState = 'loading';
    const router = makeRouter('/');
    const { container } = render(
      <TestWrapper>
        <RouterProvider router={router} />
      </TestWrapper>
    );

    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
    // El top loader usa aria-hidden en el contenedor
    expect(container.querySelector('div[aria-hidden="true"]')).toBeTruthy();
  });

  it('quita aria-busy y el top loader cuando vuelve a idle (remontando)', () => {
    // 1) Montamos en loading
    navState = 'loading';
    const router1 = makeRouter('/');
    const { container, unmount } = render(
      <TestWrapper>
        <RouterProvider router={router1} />
      </TestWrapper>
    );
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
    expect(container.querySelector('div[aria-hidden="true"]')).toBeTruthy();

    // 2) Desmontamos y volvemos a montar en idle
    unmount();
    navState = 'idle';
    const router2 = makeRouter('/');
    const { container: container2 } = render(
      <TestWrapper>
        <RouterProvider router={router2} />
      </TestWrapper>
    );

    expect(screen.getByRole('main')).not.toHaveAttribute('aria-busy', 'true');
    expect(container2.querySelector('div[aria-hidden="true"]')).toBeNull();
  });
});
