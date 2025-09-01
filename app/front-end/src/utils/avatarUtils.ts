// src/utils/avatarUtils.ts
import md5 from 'md5';

export interface TestimonialData {
  name: string;
  email?: string;
  avatar?: string;
}

/**
 * Genera una URL de avatar para un testimonio basado en email (Gravatar)
 * con fallback a UI Avatars usando el nombre
 */
export const generateAvatarUrl = (testimonial: TestimonialData): string => {
  // Si ya tiene un avatar personalizado, usarlo
  if (testimonial.avatar && testimonial.avatar.trim() !== '') {
    return testimonial.avatar;
  }

  // Si hay email, intentar Gravatar con fallback automático
  if (testimonial.email && testimonial.email.includes('@')) {
    const hash = md5(testimonial.email.toLowerCase().trim());
    return `https://www.gravatar.com/avatar/${hash}?d=${encodeURIComponent(
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        testimonial.name
      )}&size=150&background=667eea&color=ffffff&format=png&rounded=true&bold=true`
    )}&s=150`;
  }

  // Si no hay email, usar directamente UI Avatars
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    testimonial.name
  )}&size=150&background=667eea&color=ffffff&format=png&rounded=true&bold=true`;
};

/**
 * Maneja errores de carga de imagen con fallback local
 */
export const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  // Fallback a un avatar genérico generado por UI Avatars
  e.currentTarget.src =
    'https://ui-avatars.com/api/?name=Usuario&size=150&background=667eea&color=ffffff&format=png&rounded=true&bold=true';
};
