import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CertificationsSection from './CertificationsSection';
import { ModalProvider } from '../../../../contexts/ModalContext';
import { MemoryRouter } from 'react-router-dom';

// Mock del servicio de certificaciones
vi.mock('@/services/endpoints', () => ({
  certifications: {
    getCertifications: vi.fn(() =>
      Promise.resolve([
        {
          id: 1,
          title: 'AWS Certified Solutions Architect',
          issuer: 'Amazon Web Services',
          date: 'septiembre de 2025',
          credentialId: 'ABC123DEF45',
          image_url: 'https://example.com/aws-cert.png',
          verify_url: 'https://www.credly.com/badges/ABC123DEF45',
        },
        {
          id: 2,
          title: 'Google Cloud Professional',
          issuer: 'Google Cloud',
          date: 'agosto de 2025',
          credentialId: 'GCP456XYZ78',
          image_url: 'https://example.com/gcp-cert.png',
          verify_url: 'https://www.credential.net/GCP456XYZ78',
        },
      ])
    ),
    createCertification: vi.fn(),
    updateCertification: vi.fn(),
    deleteCertification: vi.fn(),
  },
}));

// Mock de hooks
vi.mock('@/hooks/useNotification', () => ({
  useNotification: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

vi.mock('@/components/layout/RootLayout/hooks/useFABActions', () => ({
  useFABActions: () => ({
    certificationsFABActions: [],
  }),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <ModalProvider>{component}</ModalProvider>
    </MemoryRouter>
  );
};

describe('[TEST] CertificationsSection - Botones de administración', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('🔴 Rojo - Tests que deben fallar inicialmente', () => {
    it('[TEST] debe mostrar botones de editar/eliminar cuando isAdminMode es true', async () => {
      renderWithProviders(<CertificationsSection isAdminMode={true} showAdminFAB={false} />);

      // Esperar a que se carguen las certificaciones
      await waitFor(() => {
        expect(screen.getByText('AWS Certified Solutions Architect')).toBeInTheDocument();
      });

      // Verificar que aparecen los botones de editar y eliminar
      const editButtons = screen.getAllByTitle('Editar certificación');
      const deleteButtons = screen.getAllByTitle('Eliminar certificación');

      expect(editButtons).toHaveLength(2); // Una para cada certificación
      expect(deleteButtons).toHaveLength(2);

      // Verificar que los iconos están presentes
      editButtons.forEach(button => {
        expect(button.querySelector('.fas.fa-edit')).toBeInTheDocument();
      });

      deleteButtons.forEach(button => {
        expect(button.querySelector('.fas.fa-trash')).toBeInTheDocument();
      });
    });

    it('[TEST] NO debe mostrar botones de editar/eliminar cuando isAdminMode es false', async () => {
      renderWithProviders(<CertificationsSection isAdminMode={false} showAdminFAB={false} />);

      // Esperar a que se carguen las certificaciones
      await waitFor(() => {
        expect(screen.getByText('AWS Certified Solutions Architect')).toBeInTheDocument();
      });

      // Verificar que NO aparecen los botones de editar y eliminar
      expect(screen.queryByTitle('Editar certificación')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Eliminar certificación')).not.toBeInTheDocument();
    });

    it('[TEST] debe abrir modal de edición al hacer clic en el botón editar', async () => {
      renderWithProviders(<CertificationsSection isAdminMode={true} showAdminFAB={false} />);

      // Esperar a que se carguen las certificaciones
      await waitFor(() => {
        expect(screen.getByText('AWS Certified Solutions Architect')).toBeInTheDocument();
      });

      // Hacer clic en el primer botón de editar
      const editButton = screen.getAllByTitle('Editar certificación')[0];
      fireEvent.click(editButton);

      // Verificar que se abre el modal de edición
      await waitFor(() => {
        expect(screen.getByText('Editar Certificación')).toBeInTheDocument();
      });
    });

    it('[TEST] debe confirmar eliminación al hacer clic en el botón eliminar', async () => {
      // Mock window.confirm
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      renderWithProviders(<CertificationsSection isAdminMode={true} showAdminFAB={false} />);

      // Esperar a que se carguen las certificaciones
      await waitFor(() => {
        expect(screen.getByText('AWS Certified Solutions Architect')).toBeInTheDocument();
      });

      // Hacer clic en el primer botón de eliminar
      const deleteButton = screen.getAllByTitle('Eliminar certificación')[0];
      fireEvent.click(deleteButton);

      // Verificar que se muestra el diálogo de confirmación
      expect(confirmSpy).toHaveBeenCalledWith(
        '¿Estás seguro de que quieres eliminar esta certificación?'
      );

      confirmSpy.mockRestore();
    });

    it('[TEST] debe mostrar botones solo cuando el usuario está autenticado', async () => {
      // Simular usuario autenticado usando props
      renderWithProviders(<CertificationsSection isAdminMode={true} showAdminFAB={true} />);

      // Esperar a que se carguen las certificaciones
      await waitFor(() => {
        expect(screen.getByText('AWS Certified Solutions Architect')).toBeInTheDocument();
      });

      // Verificar que aparecen los controles de administración
      expect(screen.getAllByTitle('Editar certificación')).toHaveLength(2);
      expect(screen.getAllByTitle('Eliminar certificación')).toHaveLength(2);
    });
  });

  it('renderiza el encabezado de certificaciones', () => {
    renderWithProviders(<CertificationsSection isAdminMode={false} showAdminFAB={false} />);
    const heading = screen.getByRole('heading', { name: /Certificaciones/i });
    expect(heading).toBeInTheDocument();
  });
});
