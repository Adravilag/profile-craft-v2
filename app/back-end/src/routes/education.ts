import express, { Router } from 'express';
import { educationController } from '../controllers/educationController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { body } from 'express-validator';

const router: Router = express.Router();

// Rutas públicas
router.get('/', educationController.getEducation);

// Rutas de administración
router.post(
  '/',
  authenticateAdmin,
  [
    body('title')
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
      .withMessage('title must be string or localized object { es, en }'),
    body('institution')
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
      .withMessage('institution must be string or localized object { es, en }'),
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
  educationController.createEducation
);

router.put(
  '/:id',
  authenticateAdmin,
  [
    body('title')
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
      .withMessage('title must be string or localized object { es, en }'),
    body('institution')
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
      .withMessage('institution must be string or localized object { es, en }'),
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
  educationController.updateEducation
);
router.delete('/:id', authenticateAdmin, educationController.deleteEducation);

export default router;
