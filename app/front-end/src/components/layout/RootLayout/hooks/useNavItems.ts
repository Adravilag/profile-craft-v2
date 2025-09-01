import { useMemo } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';

interface UseNavItemsProps {
  isCheckingUsers: boolean;
}

export function useNavItems({ isCheckingUsers }: UseNavItemsProps) {
  const { getText, t } = useTranslation();
  // Generar dinámicamente los elementos de navegación
  const navItems = useMemo(() => {
    return [
      {
        id: 'home',
        label: getText('navigation.home', 'Inicio'),
        icon: 'fas fa-home',
      },
      {
        id: 'about',
        label: getText('navigation.about', 'Sobre mí'),
        icon: 'fas fa-user',
      },
      {
        id: 'experience',
        label: getText('navigation.experience', 'Experiencia'),
        icon: 'fas fa-briefcase',
      },
      {
        id: 'projects',
        label: getText('navigation.projects', 'Proyectos'),
        icon: 'fas fa-project-diagram',
      },
      {
        id: 'skills',
        label: getText('navigation.skills', 'Habilidades'),
        icon: 'fas fa-tools',
      },
      {
        id: 'certifications',
        label: getText('navigation.certifications', 'Certificaciones'),
        icon: 'fas fa-certificate',
      },
      {
        id: 'testimonials',
        label: getText('navigation.testimonials', 'Testimonios'),
        icon: 'fas fa-comments',
      },
      {
        id: 'contact',
        label: getText('navigation.contact', 'Contacto'),
        icon: 'fas fa-envelope',
      },
    ];
  }, [getText]);

  return { navItems };
}
