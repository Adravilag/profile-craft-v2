// Debug test temporal
import { render, screen, waitFor } from '@testing-library/react';
import { AboutModal } from './src/components/layout/Sections/About/modals/AboutModal';
import * as endpoints from './src/services/endpoints';
import { vi } from 'vitest';

// Mock del endpoint
vi.mock('./src/services/endpoints', () => ({
  about: {
    getAboutSection: vi.fn(),
  },
}));

const mockGetAboutSection = endpoints.about.getAboutSection;

describe('DEBUG AboutModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock exitoso con datos
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
      },
    });
  });

  it('debería mostrar el HTML completo', async () => {
    render(<AboutModal isOpen={true} onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Editar Sección About')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    // Debug: mostrar todo el HTML
    console.log('=== HTML COMPLETO ===');
    console.log(document.body.innerHTML);

    // Verificar qué roles están disponibles
    const allRoles = screen.queryAllByRole(/tab/);
    console.log('=== PESTAÑAS ENCONTRADAS ===');
    console.log('Cantidad de pestañas:', allRoles.length);
    allRoles.forEach((tab, index) => {
      console.log(`Pestaña ${index}:`, tab.textContent, tab.getAttribute('aria-controls'));
    });
  });
});
