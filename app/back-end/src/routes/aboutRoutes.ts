import express, { Router } from 'express';
import { body } from 'express-validator';
import {
  getAboutSection,
  updateAboutSection,
  addHighlight,
  updateHighlight,
  deleteHighlight,
} from '../controllers/aboutController.js';
import { authenticate } from '../middleware/auth.js';

const router: Router = express.Router();

/**
 * @route GET /api/about
 * @desc Obtener la información de la sección About
 * @access Public
 */
router.get('/', getAboutSection);

/**
 * @route PUT /api/about
 * @desc Actualizar la información de la sección About
 * @access Private (Admin)
 */
router.put(
  '/',
  authenticate,
  [
    // aboutText can be a string (legacy) or a localized object { es, en }
    body('aboutText')
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
      .withMessage('El texto About debe ser una cadena o un objeto localizado { es, en }'),
    // collaborationNote.title/description can be string or localized object
    body('collaborationNote.title')
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
      .withMessage(
        'El título de la nota de colaboración debe ser una cadena o un objeto localizado { es, en }'
      ),
    body('collaborationNote.description')
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
      .withMessage(
        'La descripción de la nota de colaboración debe ser una cadena o un objeto localizado { es, en }'
      ),
  ],
  updateAboutSection
);

/**
 * @route POST /api/about/highlights
 * @desc Agregar un nuevo highlight
 * @access Private (Admin)
 */
router.post(
  '/highlights',
  authenticate,
  [
    body('icon')
      .notEmpty()
      .withMessage('El icono es requerido')
      .isString()
      .withMessage('El icono debe ser una cadena'),
    body('title')
      .notEmpty()
      .withMessage('El título es requerido')
      .isString()
      .withMessage('El título debe ser una cadena')
      .isLength({ max: 100 })
      .withMessage('El título no puede exceder 100 caracteres'),
    body('descriptionHtml')
      .notEmpty()
      .withMessage('La descripción es requerida')
      .isString()
      .withMessage('La descripción debe ser una cadena'),
    body('tech')
      .notEmpty()
      .withMessage('Las tecnologías son requeridas')
      .isString()
      .withMessage('Las tecnologías deben ser una cadena'),
    body('imageSrc')
      .notEmpty()
      .withMessage('La URL de la imagen es requerida')
      .isURL()
      .withMessage('Debe ser una URL válida'),
    body('imageCloudinaryId')
      .notEmpty()
      .withMessage('El ID de Cloudinary es requerido')
      .isString()
      .withMessage('El ID de Cloudinary debe ser una cadena'),
    body('order')
      .optional()
      .isInt({ min: 1 })
      .withMessage('El orden debe ser un número entero positivo'),
  ],
  addHighlight
);

/**
 * @route PUT /api/about/highlights/:highlightId
 * @desc Actualizar un highlight específico
 * @access Private (Admin)
 */
router.put(
  '/highlights/:highlightId',
  authenticate,
  [
    body('icon').optional().isString().withMessage('El icono debe ser una cadena'),
    body('title')
      .optional()
      .isString()
      .withMessage('El título debe ser una cadena')
      .isLength({ max: 100 })
      .withMessage('El título no puede exceder 100 caracteres'),
    body('descriptionHtml').optional().isString().withMessage('La descripción debe ser una cadena'),
    body('tech').optional().isString().withMessage('Las tecnologías deben ser una cadena'),
    body('imageSrc').optional().isURL().withMessage('Debe ser una URL válida'),
    body('imageCloudinaryId')
      .optional()
      .isString()
      .withMessage('El ID de Cloudinary debe ser una cadena'),
    body('order')
      .optional()
      .isInt({ min: 1 })
      .withMessage('El orden debe ser un número entero positivo'),
    body('isActive').optional().isBoolean().withMessage('isActive debe ser un booleano'),
  ],
  updateHighlight
);

/**
 * @route DELETE /api/about/highlights/:highlightId
 * @desc Eliminar un highlight
 * @access Private (Admin)
 */
router.delete('/highlights/:highlightId', authenticate, deleteHighlight);

export default router;
