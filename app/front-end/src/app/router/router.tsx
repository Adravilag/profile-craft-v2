// src/app/router.tsx
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import ScrollToTop from '@/components/utils/ScrollToTop';
import { NORMALIZED_BASE } from '@/config/basePath';
import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { QueryErrorBoundary } from '@/components/layout/ErrorBoundary/QueryErrorBoundary';
import RouteError from '@/components/layout/RouteError/RouteError';

// Lazy layout + pages
const RootLayout = lazy(() => import('@/components/layout/RootLayout/RootLayout'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage/NotFoundPage'));
const ProjectPage = lazy(
  () => import('@/components/layout/Sections/Projects/pages/ProjectPage/ProjectPage')
);
const ProjectAdminPage = lazy(
  () => import('@/components/layout/Sections/Projects/pages/ProjectAdminPage/ProjectAdminPage')
);

const OverlayFallback: React.FC = () => (
  <div
    className="setup-loading setup-loading--overlay"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <div className="setup-loading-content">
      <div className="setup-loading-spinner" aria-hidden="true"></div>
      <p>Verificando sistema...</p>
    </div>
  </div>
);

const HomeSkeleton: React.FC = () => (
  <main className="home-skeleton">
    <header className="home-skeleton__hero" />
    <section className="home-skeleton__grid">
      <div className="card-skeleton" />
      <div className="card-skeleton" />
      <div className="card-skeleton" />
    </section>
  </main>
);

const withSuspense = (node: ReactNode, fallback?: React.ReactNode) => (
  <Suspense fallback={fallback ?? <OverlayFallback />}>{node}</Suspense>
);

export const router = createBrowserRouter(
  [
    {
      path: '/',
      // Include ScrollToTop inside the root so child routes scroll to top on navigation
      element: withSuspense(
        <>
          <ScrollToTop />
          <Outlet />
        </>
      ),
      errorElement: withSuspense(<NotFoundPage />),
      children: [
        {
          index: true,
          element: withSuspense(<RootLayout initialSection="home" />, <HomeSkeleton />),
        },
        { path: 'about', element: withSuspense(<RootLayout initialSection="about" />) },
        { path: 'experience', element: withSuspense(<RootLayout initialSection="experience" />) },
        { path: 'projects', element: withSuspense(<RootLayout initialSection="projects" />) },
        { path: 'skills', element: withSuspense(<RootLayout initialSection="skills" />) },
        {
          path: 'certifications',
          element: withSuspense(<RootLayout initialSection="certifications" />),
        },
        {
          path: 'testimonials',
          element: withSuspense(<RootLayout initialSection="testimonials" />),
        },
        { path: 'terminal', element: withSuspense(<RootLayout initialSection="terminal" />) },
        { path: 'contact', element: withSuspense(<RootLayout initialSection="contact" />) },
        { path: '*', element: withSuspense(<NotFoundPage />) },
      ],
    },
    // Páginas independientes para proyectos (no renderizadas dentro del layout de secciones)
    {
      path: '/projects/:id',
      element: withSuspense(
        <>
          <ScrollToTop /> <ProjectPage />
        </>
      ),
    },
    // Admin pages for projects (list, create, edit)
    {
      path: '/projects/admin',
      element: withSuspense(
        <>
          <ScrollToTop /> <ProjectAdminPage />
        </>
      ),
      errorElement: <RouteError />,
    },
    {
      path: '/projects/new',
      element: withSuspense(
        <>
          <ScrollToTop /> <ProjectAdminPage />
        </>
      ),
      errorElement: <RouteError />,
    },
    {
      path: '/projects/edit/:id',
      element: withSuspense(
        <>
          <ScrollToTop /> <ProjectAdminPage />
        </>
      ),
      errorElement: <RouteError />,
    },
    // Rutas legacy/compatibilidad
    {
      path: '/project/:id',
      element: withSuspense(
        <>
          <ScrollToTop /> <ProjectPage />
        </>
      ),
    },
  ],
  {
    // Use configured base path when available (keeps production/CI behavior).
    basename: NORMALIZED_BASE || '/',
  }
);

export function Router() {
  return (
    <QueryErrorBoundary>
      {/* ScrollToTop debe vivir dentro del contexto del router */}
      <RouterProvider router={router} />
    </QueryErrorBoundary>
  );
}
