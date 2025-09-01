// Project modules exports
// Módulos de artículos deshabilitados temporalmente
// Se habilitarán cuando se implementen los componentes correspondientes
/*
export { default as ProjectBreadcrumb } from './ProjectBreadcrumb';
export { default as ProjectAuthor } from './ProjectAuthor';
export { default as ProjectTableOfContents } from './ProjectTableOfContents';
export { default as ProjectReadingProgress } from './ProjectReadingProgress';
export { default as ProjectLikeSystem } from './ProjectLikeSystem';
export { default as ProjectShare } from './ProjectShare';
export { default as ProjectRelated } from './ProjectRelated';
export { default as ProjectComments } from './ProjectComments';
*/

// Types
export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface AuthorData {
  name: string;
  avatar?: string;
  bio?: string;
  email?: string;
  website?: string;
  social?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}
