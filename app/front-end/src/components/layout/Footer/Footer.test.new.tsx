import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Footer from './Footer';

// Mock del hook de navegación
vi.mock('@/hooks/useNavigation', () => ({
  default: () => ({
    navigateToSection: vi.fn(),
  }),
}));

// Mock de la API de perfil
vi.mock('@/services/endpoints', () => ({
  profile: {
    getUserProfile: vi.fn().mockResolvedValue({
      id: 1,
      name: 'Adrian Vila',
      email: 'adavilag.contact@gmail.com',
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
  email: 'adavilag.contact@gmail.com',
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

    // [TEST] Verificar que las clases CSS mejoradas están aplicadas
    expect(footer).toHaveClass(expect.stringContaining('footer'));
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

    // [TEST] Verificar que los enlaces tienen las clases correctas para el diseño mejorado
    expect(linkedinLink).toHaveClass(expect.stringContaining('socialLink'));
    expect(githubLink).toHaveClass(expect.stringContaining('socialLink'));
    expect(emailLink).toHaveClass(expect.stringContaining('socialLink'));
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

    // [TEST] Verificar que los enlaces tienen las clases correctas
    expect(homeLink.closest('a')).toHaveClass(expect.stringContaining('quickLink'));
    expect(aboutLink.closest('a')).toHaveClass(expect.stringContaining('quickLink'));
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
});
