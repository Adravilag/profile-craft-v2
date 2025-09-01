// src/app/providers.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { AppProviders } from './providers';

// 1. Mock the @tanstack/react-query-devtools library.
// We do this to prevent the Devtools component from trying to render
// and to avoid any real lazy-loading side effects in the test environment.
const DevtoolsMock = vi.fn(() => <div>Devtools Mock</div>);
vi.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: DevtoolsMock,
}));

// 2. Capture original environment variables so tests can restore them.
// This controls conditional rendering of Devtools and React Query.
const originalEnv = import.meta.env.DEV;
const originalViteEnable = import.meta.env.VITE_ENABLE_REACT_QUERY;

describe('AppProviders', () => {
  // 3. Create a mock QueryClient for testing.
  const queryClient = new QueryClient();

  beforeEach(() => {
    // Clear the Devtools mock before each test to reset its call count.
    DevtoolsMock.mockClear();
  });

  afterEach(() => {
    // Restore the original environment variable after each test.
    vi.stubEnv('DEV', originalEnv);
    vi.stubEnv('VITE_ENABLE_REACT_QUERY', originalViteEnable);
  });

  it('should render children within QueryClientProvider', () => {
    // Ensure React Query is enabled for this test
    vi.stubEnv('VITE_ENABLE_REACT_QUERY', 'true');
    // Render the component with a child element.
    render(
      <AppProviders client={queryClient}>
        <div>Test Child</div>
      </AppProviders>
    );

    // Verify that the child component is present in the document.
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should render ReactQueryDevtools in a development environment', () => {
    // Use vi.stubEnv to simulate a development environment.
    vi.stubEnv('DEV', true);
    // Also enable React Query so Devtools can mount
    vi.stubEnv('VITE_ENABLE_REACT_QUERY', 'true');

    // Render the component with the mocked dev environment.
    render(
      <AppProviders client={queryClient}>
        <div>Child</div>
      </AppProviders>
    );

    // Expect the mocked Devtools component to have been called once.
    expect(DevtoolsMock).toHaveBeenCalledTimes(1);

    // Expect the mock Devtools element to be in the document.
    expect(screen.getByText('Devtools Mock')).toBeInTheDocument();
  });

  it('should not render ReactQueryDevtools in a production environment', () => {
    // Use vi.stubEnv to simulate a production environment.
    vi.stubEnv('DEV', false);
    // Ensure React Query is enabled/disabled as in production (doesn't matter here but keep explicit)
    vi.stubEnv('VITE_ENABLE_REACT_QUERY', 'true');

    // Render the component with the mocked production environment.
    render(
      <AppProviders client={queryClient}>
        <div>Child</div>
      </AppProviders>
    );

    // Expect the Devtools component to NOT have been called.
    expect(DevtoolsMock).not.toHaveBeenCalled();

    // Expect the Devtools mock element to NOT be in the document.
    expect(screen.queryByText('Devtools Mock')).not.toBeInTheDocument();
  });
});
