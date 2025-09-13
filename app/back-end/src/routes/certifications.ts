import express, { Router } from 'express';
import { certificationsController } from '../controllers/certificationsController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router: Router = express.Router();

// Rutas públicas
router.get('/', certificationsController.getCertifications);

// Rutas de administración
router.post('/', authenticateAdmin, certificationsController.createCertification);
router.put('/:id', authenticateAdmin, certificationsController.updateCertification);
router.delete('/:id', authenticateAdmin, certificationsController.deleteCertification);

export default router;
