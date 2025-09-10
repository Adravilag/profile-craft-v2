import {
  getAboutSection as getAboutSectionImpl,
  updateAboutSection as updateAboutSectionImpl,
  addAboutHighlight as addAboutHighlightImpl,
  updateAboutHighlight as updateAboutHighlightImpl,
  deleteAboutHighlight as deleteAboutHighlightImpl,
} from '../api';

// Tipos para la API de About
export interface AboutHighlightData {
  _id?: string;
  icon: string;
  title: string;
  descriptionHtml: string;
  tech: string;
  imageSrc: string;
  imageCloudinaryId: string;
  order: number;
  isActive: boolean;
}

export interface AboutSectionData {
  _id: string;
  aboutText: string;
  highlights: AboutHighlightData[];
  collaborationNote: {
    title: string;
    description: string;
    icon: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AboutResponse {
  success: boolean;
  data: AboutSectionData;
  message?: string;
}

/**
 * Obtener la información completa de la sección About
 */
export const getAboutSection = async (): Promise<AboutResponse> => {
  const response = await getAboutSectionImpl();
  return response.data as AboutResponse;
};

/**
 * Actualizar la información de la sección About (Admin)
 */
export const updateAboutSection = async (
  data: Partial<Pick<AboutSectionData, 'aboutText' | 'collaborationNote'>>
): Promise<AboutResponse> => {
  const response = await updateAboutSectionImpl(data);
  return response.data as AboutResponse;
};

/**
 * Agregar un nuevo highlight (Admin)
 */
export const addHighlight = async (
  data: Omit<AboutHighlightData, '_id' | 'isActive'>
): Promise<AboutResponse> => {
  const response = await addAboutHighlightImpl(data);
  return response.data as AboutResponse;
};

/**
 * Actualizar un highlight específico (Admin)
 */
export const updateHighlight = async (
  highlightId: string,
  data: Partial<AboutHighlightData>
): Promise<AboutResponse> => {
  const response = await updateAboutHighlightImpl(highlightId, data);
  return response.data as AboutResponse;
};

/**
 * Eliminar un highlight (Admin)
 */
export const deleteHighlight = async (highlightId: string): Promise<AboutResponse> => {
  const response = await deleteAboutHighlightImpl(highlightId);
  return response.data as AboutResponse;
};
