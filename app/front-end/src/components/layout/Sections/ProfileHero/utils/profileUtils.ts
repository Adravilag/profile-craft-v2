import React from 'react';
import type { UserProfile } from '@/types/api';

interface ContactInfo {
  type: 'email' | 'linkedin' | 'github' | 'location';
  icon: string;
  value: string;
  action?: () => void;
  color: string;
}

/**
 * Extrae y formatea los datos de contacto del perfil de usuario
 */
export const getContactData = (userProfile?: UserProfile): ContactInfo[] => {
  if (!userProfile) return [];

  const contacts: ContactInfo[] = [];

  // Email (using public contact email instead of private auth email)
  if (userProfile.email_contact) {
    contacts.push({
      type: 'email',
      icon: 'fas fa-envelope',
      value: userProfile.email_contact,
      color: '#ea4335',
    });
  }

  // LinkedIn
  if (userProfile.linkedin_url) {
    contacts.push({
      type: 'linkedin',
      icon: 'fab fa-linkedin',
      value: userProfile.linkedin_url,
      color: '#0077b5',
    });
  }

  // GitHub
  if (userProfile.github_url) {
    contacts.push({
      type: 'github',
      icon: 'fab fa-github',
      value: userProfile.github_url,
      color: '#333',
    });
  }

  // Location
  if (userProfile.location) {
    contacts.push({
      type: 'location',
      icon: 'fas fa-map-marker-alt',
      value: userProfile.location,
      color: '#4285f4',
    });
  }

  return contacts;
};

/**
 * Formatea el título del rol con resaltado de tecnologías
 */
export const getRoleTitle = (
  roleTitle?: string,
  techHighlightClass?: string
): React.ReactElement | string => {
  if (!roleTitle) return '';

  // Lista de tecnologías comunes para resaltar
  const techKeywords = [
    'React',
    'Vue',
    'Angular',
    'JavaScript',
    'TypeScript',
    'Node.js',
    'Python',
    'Java',
    'PHP',
    'C#',
    'Go',
    'Rust',
    'Swift',
    'Kotlin',
    'Flutter',
    'React Native',
    'MongoDB',
    'PostgreSQL',
    'MySQL',
    'Redis',
    'Docker',
    'Kubernetes',
    'AWS',
    'Azure',
    'GraphQL',
    'REST',
    'API',
    'Frontend',
    'Backend',
    'Full Stack',
    'DevOps',
    'Machine Learning',
    'AI',
    'Data Science',
    'Blockchain',
    'Web3',
    'Cloud',
    'Microservices',
    'Serverless',
    'Progressive Web App',
    'PWA',
    'SPA',
  ];

  // Si no hay clase de resaltado, retornar el texto tal como está
  if (!techHighlightClass) {
    return roleTitle;
  }

  // Crear un patrón regex para encontrar las tecnologías
  const pattern = new RegExp(`\\b(${techKeywords.join('|')})\\b`, 'gi');
  const parts = roleTitle.split(pattern);

  // Si no se encontraron tecnologías, retornar el texto original
  if (parts.length === 1) {
    return roleTitle;
  }

  // Crear JSX con las tecnologías resaltadas
  return React.createElement(
    React.Fragment,
    null,
    ...parts.map((part, index) => {
      const isTech = techKeywords.some(tech => tech.toLowerCase() === part.toLowerCase());

      return isTech
        ? React.createElement('span', { key: index, className: techHighlightClass }, part)
        : React.createElement('span', { key: index }, part);
    })
  );
};
