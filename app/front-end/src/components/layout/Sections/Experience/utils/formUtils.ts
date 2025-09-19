import { Experience } from 'src/types/api';

export interface FormData {
  title: string;
  company: string;
  start_date: string;
  end_date: string;
  description: string;
  technologies: string;
  order_index: number;
  is_current: boolean;
}

export const normalizeTechnologies = (tech: any): string => {
  if (!tech) return '';
  if (Array.isArray(tech)) return tech.join(', ');
  if (typeof tech === 'string') return tech;
  return '';
};

const localizedToString = (val: string | { es?: string; en?: string } | undefined): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val.es ?? val.en ?? '';
};

export const getInitialFormData = (
  editing?: Experience,
  initial: Partial<FormData> = {}
): FormData => ({
  title: localizedToString(editing?.position) || initial.title || '',
  company: localizedToString(editing?.company) || initial.company || '',
  start_date: editing?.start_date || initial.start_date || '',
  end_date: editing?.end_date || initial.end_date || '',
  description: localizedToString(editing?.description) || initial.description || '',
  technologies:
    normalizeTechnologies(editing?.technologies) || normalizeTechnologies(initial.technologies),
  order_index: editing?.order_index || initial.order_index || 0,
  is_current: initial.is_current || false,
});
