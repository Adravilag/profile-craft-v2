// Test utilities for ProjectForm component
import React from 'react';
import { render, RenderOptions, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Mock the contexts that ProjectForm depends on
const MockNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const MockTranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Wrapper component that provides all necessary contexts
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <MockNotificationProvider>
        <MockTranslationProvider>{children}</MockTranslationProvider>
      </MockNotificationProvider>
    </BrowserRouter>
  );
};

// Custom render function that includes providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): ReturnType<typeof render> => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render, act };

// Mock implementations for hooks used in ProjectForm
export const mockUseNotificationContext = () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
  showInfo: vi.fn(),
});

export const mockUseTranslation = () => ({
  t: {
    forms: {
      experience: {
        cancel: 'Cancelar',
        save: 'Guardar',
        saving: 'Guardando...',
      },
    },
  },
});

export const mockUseNavigate = () => vi.fn();

// Helper to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));
