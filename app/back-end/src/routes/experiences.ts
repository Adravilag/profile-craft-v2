import express, { Router } from 'express';
import { experiencesController } from '../controllers/experiencesController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { publicIdMiddleware } from '../middleware/publicId.js';
import { body } from 'express-validator';

const router: Router = express.Router();

// Rutas públicas
router.get('/', publicIdMiddleware.resolveUserIdQuery, experiencesController.getExperiences);

// Rutas de administración
router.post(
  '/',
  authenticateAdmin,
  [
    body('company')
      .optional()
      .custom(value => {
        if (value == null) return true;
        if (typeof value === 'string') return true;
        if (typeof value === 'object' && ('es' in value || 'en' in value)) {
          const es = value.es ?? value.en ?? '';
          const en = value.en ?? value.es ?? '';
          return typeof es === 'string' && typeof en === 'string';
        }
        return false;
      })
      .withMessage('company must be string or localized object { es, en }'),
    body('position')
      .optional()
      .custom(value => {
        if (value == null) return true;
        if (typeof value === 'string') return true;
        if (typeof value === 'object' && ('es' in value || 'en' in value)) {
          const es = value.es ?? value.en ?? '';
          const en = value.en ?? value.es ?? '';
          return typeof es === 'string' && typeof en === 'string';
        }
        return false;
      })
      .withMessage('position must be string or localized object { es, en }'),
    body('description')
      .optional()
      .custom(value => {
        if (value == null) return true;
        if (typeof value === 'string') return true;
        if (typeof value === 'object' && ('es' in value || 'en' in value)) {
          const es = value.es ?? value.en ?? '';
          const en = value.en ?? value.es ?? '';
          return typeof es === 'string' && typeof en === 'string';
        }
        return false;
      })
      .withMessage('description must be string or localized object { es, en }'),
  ],
  experiencesController.createExperience
);

router.put(
  '/:id',
  authenticateAdmin,
  [
    body('company')
      .optional()
      .custom(value => {
        if (value == null) return true;
        if (typeof value === 'string') return true;
        if (typeof value === 'object' && ('es' in value || 'en' in value)) {
          const es = value.es ?? value.en ?? '';
          const en = value.en ?? value.es ?? '';
          return typeof es === 'string' && typeof en === 'string';
        }
        return false;
      })
      .withMessage('company must be string or localized object { es, en }'),
    body('position')
      .optional()
      .custom(value => {
        if (value == null) return true;
        if (typeof value === 'string') return true;
        if (typeof value === 'object' && ('es' in value || 'en' in value)) {
          const es = value.es ?? value.en ?? '';
          const en = value.en ?? value.es ?? '';
          return typeof es === 'string' && typeof en === 'string';
        }
        return false;
      })
      .withMessage('position must be string or localized object { es, en }'),
    body('description')
      .optional()
      .custom(value => {
        if (value == null) return true;
        if (typeof value === 'string') return true;
        if (typeof value === 'object' && ('es' in value || 'en' in value)) {
          const es = value.es ?? value.en ?? '';
          const en = value.en ?? value.es ?? '';
          return typeof es === 'string' && typeof en === 'string';
        }
        return false;
      })
      .withMessage('description must be string or localized object { es, en }'),
  ],
  experiencesController.updateExperience
);
router.delete('/:id', authenticateAdmin, experiencesController.deleteExperience);

export default router;
