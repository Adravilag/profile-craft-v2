import React from 'react';
import { render, screen } from '@testing-library/react';
import CertificationsSection from './CertificationsSection';
import { ModalProvider } from '../../../../contexts/ModalContext';
import { MemoryRouter } from 'react-router-dom';

describe('CertificationsSection', () => {
  it('renderiza el encabezado de certificaciones', () => {
    render(
      <MemoryRouter>
        <ModalProvider>
          <CertificationsSection isAdminMode={false} showAdminFAB={false} />
        </ModalProvider>
      </MemoryRouter>
    );
    const heading = screen.getByRole('heading', { name: /Certificaciones/i });
    expect(heading).toBeInTheDocument();
  });
});
