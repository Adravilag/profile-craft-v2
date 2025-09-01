import type { Certification } from '@/types/api';
import {
  getCertifications as getCertificationsImpl,
  createCertification as createCertificationImpl,
  updateCertification as updateCertificationImpl,
  deleteCertification as deleteCertificationImpl,
} from '../api';

/**
 * Obtiene certificaciones del usuario.
 */
export const getCertifications = () => getCertificationsImpl();

/**
 * Crea una certificación.
 */
export const createCertification = (certification: Omit<Certification, 'id'>) =>
  createCertificationImpl(certification);

/**
 * Actualiza una certificación.
 */
export const updateCertification = (id: number | string, certification: Partial<Certification>) =>
  updateCertificationImpl(id, certification);

/**
 * Elimina una certificación.
 */
export const deleteCertification = (id: string | number) => deleteCertificationImpl(id);

export type { Certification };
