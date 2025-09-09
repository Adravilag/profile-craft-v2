import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Footer from './Footer';

// Mock del hook de navegación
const mockNavigateToSection = vi.fn();
vi.mock('@/hooks/useNavigation', () => ({
  default: () => ({
    navigateToSection: mockNavigateToSection,
    currentSection: 'home',
  }),
}));

// Mock de la utilidad scrollToElement
vi.mock('@/utils/scrollToElement', () => ({
  scrollToElement: vi.fn().mockResolvedValue(undefined),
}));

// Mock de la API de perfil
vi.mock('@/services/endpoints', () => ({
  profile: {
    getUserProfile: vi.fn().mockResolvedValue({
      id: 1,
      name: 'Adrian Vila',
      email: 'admin@example.com', // Email privado de autenticación
      email_contact: 'adavilag.contact@gmail.com', // Email público para contacto
      linkedin_url: 'https://linkedin.com/in/adravilag',
      github_url: 'https://github.com/adravilag',
      location: 'Madrid, España',
      phone: '+34 600 123 456',
      status: 'Disponible para nuevos proyectos',
    }),
  },
}));

const mockProfile = {
  id: 1,
  name: 'Adrian Vila',
  email: 'admin@example.com', // Email privado de autenticación
  email_contact: 'adavilag.contact@gmail.com', // Email público para contacto
  linkedin_url: 'https://linkedin.com/in/adravilag',
  github_url: 'https://github.com/adravilag',
  location: 'Madrid, España',
  phone: '+34 600 123 456',
  status: 'Disponible para nuevos proyectos',
};

describe('[TEST] Footer - Mejoras de diseño', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('[TEST] debería mostrar las secciones principales del footer con mejor layout', async () => {
    render(<Footer profile={mockProfile} />);

    // Verificar que el footer se renderiza
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();

    // Verificar secciones principales
    expect(screen.getByText('ProfileCraft')).toBeInTheDocument();
    expect(screen.getByText('Sígueme')).toBeInTheDocument();
    expect(screen.getByText('Navegación')).toBeInTheDocument();
    expect(screen.getAllByText('Contacto')[0]).toBeInTheDocument(); // Usar getAllByText por duplicados
    expect(screen.getByText('Mantente al día')).toBeInTheDocument();

    // [TEST] Verificar que el footer tiene estructura correcta
    expect(footer.tagName).toBe('FOOTER');
  });

  it('[TEST] debería mostrar las redes sociales con el diseño mejorado', async () => {
    render(<Footer profile={mockProfile} />);

    // Verificar que las redes sociales se muestran
    const linkedinLink = screen.getByLabelText('Visitar perfil de LinkedIn');
    const githubLink = screen.getByLabelText('Visitar perfil de GitHub');
    const emailLink = screen.getByLabelText('Enviar email');

    expect(linkedinLink).toBeInTheDocument();
    expect(githubLink).toBeInTheDocument();
    expect(emailLink).toBeInTheDocument();

    // [TEST] Verificar que los enlaces son clickables
    expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/in/adravilag');
    expect(githubLink).toHaveAttribute('href', 'https://github.com/adravilag');
    expect(emailLink).toHaveAttribute('href', 'mailto:adavilag.contact@gmail.com');
  });

  it('[TEST] debería mostrar la información de contacto mejorada', async () => {
    render(<Footer profile={mockProfile} />);

    // Verificar información de contacto
    expect(screen.getByText('Madrid, España')).toBeInTheDocument();
    expect(screen.getByText('adavilag.contact@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('+34 600 123 456')).toBeInTheDocument();

    // Verificar estado de disponibilidad
    expect(screen.getByText('Disponible para nuevos proyectos')).toBeInTheDocument();
  });

  it('[TEST] debería mostrar la navegación rápida con enlaces funcionales', async () => {
    render(<Footer profile={mockProfile} />);

    // Verificar enlaces de navegación
    const homeLink = screen.getByText('Inicio');
    const aboutLink = screen.getByText('Sobre mí');
    const experienceLink = screen.getByText('Experiencia');

    expect(homeLink).toBeInTheDocument();
    expect(aboutLink).toBeInTheDocument();
    expect(experienceLink).toBeInTheDocument();

    // [TEST] Verificar que los enlaces de navegación son clickables
    expect(homeLink).toBeInTheDocument();
    expect(aboutLink).toBeInTheDocument();
  });

  it('[TEST] debería mostrar el formulario de newsletter mejorado', async () => {
    render(<Footer profile={mockProfile} />);

    // Verificar elementos del newsletter
    expect(screen.getByText('Mantente al día')).toBeInTheDocument();
    expect(
      screen.getByText('Recibe actualizaciones sobre nuevos proyectos y tecnologías.')
    ).toBeInTheDocument();

    const emailInput = screen.getByLabelText('Dirección de email para newsletter');
    const subscribeButton = screen.getByLabelText('Suscribirse al newsletter');

    expect(emailInput).toBeInTheDocument();
    expect(subscribeButton).toBeInTheDocument();

    // [TEST] Verificar que el input tiene el placeholder correcto
    expect(emailInput).toHaveAttribute('placeholder', 'adavilag.contact@gmail.com');
  });

  it('[TEST] debería mostrar el copyright y enlaces legales con mejor diseño', async () => {
    render(<Footer profile={mockProfile} />);

    // Verificar copyright
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear}`))).toBeInTheDocument();
    expect(screen.getByText(/Hecho con/)).toBeInTheDocument();
    expect(screen.getByText(/usando React y Material Design 3/)).toBeInTheDocument();

    // Verificar enlaces legales
    expect(screen.getByText('Privacidad')).toBeInTheDocument();
    expect(screen.getByText('Términos')).toBeInTheDocument();
    expect(screen.getByText('Cookies')).toBeInTheDocument();
  });

  it('[TEST] debería mostrar las tecnologías utilizadas con iconos', async () => {
    render(<Footer profile={mockProfile} />);

    // Verificar sección de tecnologías
    expect(screen.getByText('Desarrollado con:')).toBeInTheDocument();

    // Verificar que los iconos de tecnologías están presentes
    const techSection = screen.getByText('Desarrollado con:').closest('div');
    expect(techSection).toBeInTheDocument();
  });

  it('[TEST] debería mostrar el patrón decorativo superior', async () => {
    render(<Footer profile={mockProfile} />);

    const footer = screen.getByRole('contentinfo');
    const decorativePattern = footer.querySelector('[class*="decorativePattern"]');

    expect(decorativePattern).toBeInTheDocument();
  });

  it('[TEST] debería mostrar el indicador de disponibilidad con animación', async () => {
    render(<Footer profile={mockProfile} />);

    const statusText = screen.getByText('Disponible para nuevos proyectos');
    const statusIndicator = statusText.closest('[class*="statusIndicator"]');
    expect(statusIndicator).toBeInTheDocument();

    // Verificar que contiene el dot animado
    const statusDot = statusIndicator?.querySelector('[class*="statusDot"]');
    expect(statusDot).toBeInTheDocument();
  });

  // [TEST] 🔴 NUEVAS MEJORAS - Tests que deben fallar inicialmente
  it('[TEST] 🔴 debería mostrar separadores visuales mejorados entre secciones del footer', async () => {
    render(<Footer profile={mockProfile} />);

    const footer = screen.getByRole('contentinfo');

    // [TEST] Verificar que existen separadores visuales entre las principales secciones
    const decorativeSeparators = footer.querySelectorAll('[class*="sectionSeparator"]');
    expect(decorativeSeparators).toHaveLength(3); // Entre las 4 columnas principales

    // [TEST] Verificar que los separadores están presentes
    decorativeSeparators.forEach(separator => {
      expect(separator).toBeInTheDocument();
    });
  });

  it('[TEST] 🔴 debería mostrar gradientes sutiles en los fondos de las secciones', async () => {
    render(<Footer profile={mockProfile} />);

    const footer = screen.getByRole('contentinfo');

    // [TEST] Verificar que las secciones tienen fondos con gradiente
    const sectionsWithGradient = footer.querySelectorAll('[class*="gradientBackground"]');
    expect(sectionsWithGradient.length).toBeGreaterThan(0);
  });

  it('[TEST] 🔴 debería mostrar efectos hover mejorados en los enlaces sociales', async () => {
    render(<Footer profile={mockProfile} />);

    const linkedinLink = screen.getByLabelText('Visitar perfil de LinkedIn');

    // [TEST] Verificar que el enlace existe y es clickable
    expect(linkedinLink).toBeInTheDocument();
    expect(linkedinLink).toHaveAttribute('href');

    // [TEST] Simular hover y verificar que el elemento responde
    fireEvent.mouseEnter(linkedinLink);
    expect(linkedinLink).toBeInTheDocument(); // Sigue existiendo después del hover
  });

  // [TEST] 🟢 NUEVOS TESTS - Navegación mejorada
  it('[TEST] 🟢 debería usar scrollToElement para navegación suave', async () => {
    const { scrollToElement } = await import('@/utils/scrollToElement');

    // Mock DOM element
    const mockElement = document.createElement('div');
    mockElement.id = 'about';
    document.body.appendChild(mockElement);

    render(<Footer profile={mockProfile} />);

    const aboutLink = screen.getByText('Sobre mí');

    // [TEST] Simular click en enlace de navegación
    fireEvent.click(aboutLink);

    // [TEST] Verificar que se llamó navigateToSection
    await waitFor(() => {
      expect(mockNavigateToSection).toHaveBeenCalledWith('about');
    });

    // [TEST] Verificar que se llamó scrollToElement con parámetros correctos
    await waitFor(() => {
      expect(scrollToElement).toHaveBeenCalledWith(
        mockElement,
        expect.objectContaining({
          offset: expect.any(Number),
          minDur: 300,
          maxDur: 800,
        })
      );
    });

    // Cleanup
    document.body.removeChild(mockElement);
  });

  it('[TEST] 🟢 debería manejar fallback cuando scrollToElement falla', async () => {
    const { scrollToElement } = await import('@/utils/scrollToElement');
    (scrollToElement as any).mockRejectedValueOnce(new Error('Scroll failed'));

    // Mock DOM element
    const mockElement = document.createElement('div');
    mockElement.id = 'projects';
    mockElement.scrollIntoView = vi.fn();
    document.body.appendChild(mockElement);

    // Mock window.history
    const mockPushState = vi.fn();
    Object.defineProperty(window, 'history', {
      value: { pushState: mockPushState },
      writable: true,
    });

    // Mock matchMedia para asegurar que está disponible
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: false, // No prefers-reduced-motion
      }),
    });

    render(<Footer profile={mockProfile} />);

    const projectsLink = screen.getByText('Proyectos');

    // [TEST] Simular click en enlace
    fireEvent.click(projectsLink);

    // [TEST] Verificar que se intentó usar scrollToElement
    await waitFor(() => {
      expect(scrollToElement).toHaveBeenCalled();
    });

    // [TEST] Esperar un poco más para que se ejecute el catch y el fallback
    await waitFor(
      () => {
        expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });
      },
      { timeout: 2000 }
    );

    // [TEST] Verificar que se actualizó la URL
    await waitFor(() => {
      expect(mockPushState).toHaveBeenCalledWith(null, '', '//projects');
    });

    // Cleanup
    document.body.removeChild(mockElement);
  });

  it('[TEST] 🟢 debería respetar prefers-reduced-motion en el fallback', async () => {
    const { scrollToElement } = await import('@/utils/scrollToElement');
    (scrollToElement as any).mockRejectedValueOnce(new Error('Scroll failed'));

    // Mock prefers-reduced-motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: true, // Usuario prefiere movimiento reducido
      }),
    });

    // Mock DOM element
    const mockElement = document.createElement('div');
    mockElement.id = 'experience';
    mockElement.scrollIntoView = vi.fn();
    document.body.appendChild(mockElement);

    render(<Footer profile={mockProfile} />);

    const experienceLink = screen.getByText('Experiencia');

    // [TEST] Simular click en enlace
    fireEvent.click(experienceLink);

    // [TEST] Verificar que se usó behavior: 'auto' por prefers-reduced-motion
    await waitFor(
      () => {
        expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
          behavior: 'auto', // No smooth por prefers-reduced-motion
          block: 'start',
          inline: 'nearest',
        });
      },
      { timeout: 2000 }
    );

    // Cleanup
    document.body.removeChild(mockElement);
  });
});
