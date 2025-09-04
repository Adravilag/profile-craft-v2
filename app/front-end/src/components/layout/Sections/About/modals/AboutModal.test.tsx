import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AboutModal } from './AboutModal';
import { withProviders } from '../../../../../../vitest.setup';

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

// Función auxiliar para esperar que el modal esté completamente cargado
const waitForModalLoaded = async () => {
  // Esperar primero por el título principal
  await waitFor(() => {
    expect(screen.getByText('Editar Sección About')).toBeInTheDocument();
  });

  // Esperar directamente por las pestañas
  await waitFor(() => {
    const textTab = screen.queryByRole('tab', { name: /Texto About/ });
    const highlightsTab = screen.queryByRole('tab', { name: /Highlights/ });
    const collabTab = screen.queryByRole('tab', { name: /Nota Colaboración/ });

    expect(textTab).toBeInTheDocument();
    expect(highlightsTab).toBeInTheDocument();
    expect(collabTab).toBeInTheDocument();
  });
};

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

    it('no debería renderizar nada cuando isOpen es false', async () => {
      render(<AboutModal isOpen={false} onClose={mockCloseModal} />);

      // Esperar a que se complete cualquier efecto pendiente
      await waitFor(() => {
        expect(screen.queryByText('Editar Sección About')).not.toBeInTheDocument();
      });
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

      // Buscar el botón con regex para manejar el indicador de cambios sin guardar
      const saveButton = screen.getByText(/Guardar Cambios/);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateAboutSection).toHaveBeenCalledWith({
          aboutText: 'Nuevo texto actualizado',
          highlights: [],
          collaborationNote: {
            title: 'Título de colaboración',
            description: 'Descripción de colaboración',
            icon: '🤝',
          },
          isActive: true,
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

  describe('[TEST] Gestión de Highlights', () => {
    it('debería mostrar la lista de highlights cuando existen', async () => {
      // Mock con highlights
      mockGetAboutSection.mockResolvedValue({
        success: true,
        data: {
          _id: '1',
          aboutText: '<p>Texto de about</p>',
          highlights: [
            {
              _id: 'highlight1',
              icon: 'fas fa-laptop-code',
              title: 'Desarrollo Frontend',
              descriptionHtml: '<p>Especializado en React</p>',
              tech: 'React, TypeScript',
              imageSrc: 'https://example.com/image1.jpg',
              imageCloudinaryId: 'cloudinary_id_1',
              order: 1,
              isActive: true,
            },
            {
              _id: 'highlight2',
              icon: 'fas fa-server',
              title: 'Desarrollo Backend',
              descriptionHtml: '<p>APIs con Node.js</p>',
              tech: 'Node.js, Express',
              imageSrc: 'https://example.com/image2.jpg',
              imageCloudinaryId: 'cloudinary_id_2',
              order: 2,
              isActive: true,
            },
          ],
          collaborationNote: {
            title: 'Colaboración',
            description: 'Descripción de colaboración',
            icon: '🤝',
          },
          isActive: true,
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01',
        },
      });

      render(<AboutModal isOpen={true} onClose={mockCloseModal} />);

      await waitFor(() => {
        expect(screen.getByText('Editar Sección About')).toBeInTheDocument();
      });

      // Esperar a que se complete la carga y aparezcan las pestañas
      await waitFor(() => {
        expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
      });

      // Cambiar al tab de highlights usando role y aria-controls
      const highlightsTab = screen.getByRole('tab', { name: /Highlights/ });
      fireEvent.click(highlightsTab);

      // Esperar a que se carguen los highlights
      await waitFor(() => {
        expect(screen.getByText('Desarrollo Frontend')).toBeInTheDocument();
        expect(screen.getByText('Desarrollo Backend')).toBeInTheDocument();
      });
    });

    it('debería permitir agregar un nuevo highlight', async () => {
      render(<AboutModal isOpen={true} onClose={mockCloseModal} />);

      await waitFor(() => {
        expect(screen.getByText('Editar Sección About')).toBeInTheDocument();
      });

      // Esperar a que se complete la carga y aparezcan las pestañas
      await waitFor(() => {
        expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
      });

      // Cambiar al tab de highlights usando role y aria-controls
      const highlightsTab = screen.getByRole('tab', { name: /Highlights/ });
      fireEvent.click(highlightsTab);

      // Buscar el botón de agregar highlight
      await waitFor(() => {
        const addHighlightButton = screen.getByTestId('add-highlight-button');
        expect(addHighlightButton).toBeInTheDocument();
      });
    });

    it('debería permitir editar un highlight existente', async () => {
      // Mock con un highlight existente
      mockGetAboutSection.mockResolvedValue({
        success: true,
        data: {
          _id: '1',
          aboutText: '<p>Texto de about</p>',
          highlights: [
            {
              _id: 'highlight1',
              icon: 'fas fa-laptop-code',
              title: 'Desarrollo Frontend',
              descriptionHtml: '<p>Especializado en React</p>',
              tech: 'React, TypeScript',
              imageSrc: 'https://example.com/image1.jpg',
              imageCloudinaryId: 'cloudinary_id_1',
              order: 1,
              isActive: true,
            },
          ],
          collaborationNote: {
            title: 'Colaboración',
            description: 'Descripción de colaboración',
            icon: '🤝',
          },
          isActive: true,
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01',
        },
      });

      render(<AboutModal isOpen={true} onClose={mockCloseModal} />);

      await waitFor(() => {
        expect(screen.getByText('Editar Sección About')).toBeInTheDocument();
      });

      // Esperar a que se complete la carga y aparezcan las pestañas
      await waitFor(() => {
        expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
      });

      // Cambiar al tab de highlights usando role y aria-controls
      const highlightsTab = screen.getByRole('tab', { name: /Highlights/ });
      fireEvent.click(highlightsTab);

      // Buscar botón de editar highlight
      await waitFor(() => {
        const editButton = screen.getByTestId('edit-highlight-0');
        expect(editButton).toBeInTheDocument();
      });
    });

    it('debería permitir eliminar un highlight', async () => {
      // Mock con un highlight existente
      mockGetAboutSection.mockResolvedValue({
        success: true,
        data: {
          _id: '1',
          aboutText: '<p>Texto de about</p>',
          highlights: [
            {
              _id: 'highlight1',
              icon: 'fas fa-laptop-code',
              title: 'Desarrollo Frontend',
              descriptionHtml: '<p>Especializado en React</p>',
              tech: 'React, TypeScript',
              imageSrc: 'https://example.com/image1.jpg',
              imageCloudinaryId: 'cloudinary_id_1',
              order: 1,
              isActive: true,
            },
          ],
          collaborationNote: {
            title: 'Colaboración',
            description: 'Descripción de colaboración',
            icon: '🤝',
          },
          isActive: true,
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01',
        },
      });

      render(<AboutModal isOpen={true} onClose={mockCloseModal} />);

      await waitFor(() => {
        expect(screen.getByText('Editar Sección About')).toBeInTheDocument();
      });

      // Esperar a que se complete la carga y aparezcan las pestañas
      await waitFor(() => {
        expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
      });

      // Cambiar al tab de highlights usando role y aria-controls
      const highlightsTab = screen.getByRole('tab', { name: /Highlights/ });
      fireEvent.click(highlightsTab);

      // Buscar botón de eliminar highlight
      await waitFor(() => {
        const deleteButton = screen.getByTestId('delete-highlight-0');
        expect(deleteButton).toBeInTheDocument();
      });
    });
  });

  describe('[TEST] Gestión de Nota de Colaboración', () => {
    it('debería mostrar y permitir editar la nota de colaboración', async () => {
      render(<AboutModal isOpen={true} onClose={mockCloseModal} />);

      await waitFor(() => {
        expect(screen.getByText('Editar Sección About')).toBeInTheDocument();
      });

      // Esperar a que se complete la carga y aparezcan las pestañas
      await waitFor(() => {
        expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
      });

      // Cambiar al tab de colaboración usando role y aria-controls
      const collaborationTab = screen.getByRole('tab', { name: /Nota Colaboración/ });
      fireEvent.click(collaborationTab);

      // Buscar campos de la nota de colaboración
      await waitFor(() => {
        const titleInput = screen.getByTestId('collaboration-title-input');
        const descriptionInput = screen.getByTestId('collaboration-description-input');
        const iconInput = screen.getByTestId('collaboration-icon-input');

        expect(titleInput).toBeInTheDocument();
        expect(descriptionInput).toBeInTheDocument();
        expect(iconInput).toBeInTheDocument();
      });
    });
  });
});
