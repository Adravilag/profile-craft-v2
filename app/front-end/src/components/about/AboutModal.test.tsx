import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AboutModal } from './AboutModal';

// Mock del contexto de modal
const mockCloseModal = vi.fn();

// Mock de endpoints
const mockGetAboutSection = vi.fn();
const mockUpdateAboutSection = vi.fn();

vi.mock('@/services/endpoints', () => ({
  about: {
    getAboutSection: () => mockGetAboutSection(),
    updateAboutSection: (data: any) => mockUpdateAboutSection(data),
  },
}));

describe('AboutModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock de datos por defecto
    mockGetAboutSection.mockResolvedValue({
      success: true,
      data: {
        _id: '1',
        aboutText: '<p>Texto de about actual</p>',
        collaborationNote: {
          title: 'Título de colaboración',
          description: 'Descripción de colaboración',
          icon: '🤝',
        },
        highlights: [],
        isActive: true,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
      },
    });
  });

  describe('[TEST] Renderizado del Modal', () => {
    it('debería renderizar el modal cuando isOpen es true', async () => {
      render(<AboutModal isOpen={true} onClose={mockCloseModal} />);

      await waitFor(() => {
        expect(screen.getByText('Editar Sección About')).toBeInTheDocument();
      });
    });

    it('no debería renderizar nada cuando isOpen es false', () => {
      render(<AboutModal isOpen={false} onClose={mockCloseModal} />);

      expect(screen.queryByText('Editar Sección About')).not.toBeInTheDocument();
    });
  });

  describe('[TEST] Carga de datos', () => {
    it('debería cargar los datos de about al abrir el modal', async () => {
      render(<AboutModal isOpen={true} onClose={mockCloseModal} />);

      await waitFor(() => {
        expect(mockGetAboutSection).toHaveBeenCalledTimes(1);
      });
    });

    it('debería mostrar los datos cargados en los campos del formulario', async () => {
      render(<AboutModal isOpen={true} onClose={mockCloseModal} />);

      await waitFor(() => {
        const textArea = screen.getByDisplayValue('<p>Texto de about actual</p>');
        expect(textArea).toBeInTheDocument();
      });
    });
  });

  describe('[TEST] Interacciones del formulario', () => {
    it('debería permitir editar el texto de about', async () => {
      render(<AboutModal isOpen={true} onClose={mockCloseModal} />);

      await waitFor(() => {
        const textArea = screen.getByDisplayValue(
          '<p>Texto de about actual</p>'
        ) as HTMLTextAreaElement;
        fireEvent.change(textArea, { target: { value: 'Nuevo texto de about' } });
        expect(textArea.value).toBe('Nuevo texto de about');
      });
    });

    it('debería enviar los datos al hacer submit', async () => {
      mockUpdateAboutSection.mockResolvedValue({
        success: true,
        data: {},
      });

      render(<AboutModal isOpen={true} onClose={mockCloseModal} />);

      await waitFor(() => {
        const textArea = screen.getByDisplayValue(
          '<p>Texto de about actual</p>'
        ) as HTMLTextAreaElement;
        fireEvent.change(textArea, { target: { value: 'Nuevo texto actualizado' } });
      });

      const saveButton = screen.getByText('Guardar Cambios');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateAboutSection).toHaveBeenCalledWith({
          aboutText: 'Nuevo texto actualizado',
          collaborationNote: {
            title: 'Título de colaboración',
            description: 'Descripción de colaboración',
            icon: '🤝',
          },
        });
      });
    });
  });

  describe('[TEST] Manejo de errores', () => {
    it('debería manejar errores de carga de datos', async () => {
      mockGetAboutSection.mockRejectedValue(new Error('Error de carga'));

      render(<AboutModal isOpen={true} onClose={mockCloseModal} />);

      await waitFor(() => {
        expect(screen.getByText('Error al cargar datos')).toBeInTheDocument();
      });
    });
  });
});
