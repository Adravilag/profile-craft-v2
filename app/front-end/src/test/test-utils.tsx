/**
 * Utilidades de testing para componentes que usan el sistema centralizado de loading
 */

import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { SectionsLoadingProvider } from '@/contexts/SectionsLoadingContext';
import { ModalProvider } from '@/contexts/ModalContext';

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return (
    <SectionsLoadingProvider>
      <ModalProvider>{children}</ModalProvider>
    </SectionsLoadingProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): ReturnType<typeof render> => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
