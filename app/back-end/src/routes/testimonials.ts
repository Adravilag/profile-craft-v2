import express from 'express';
import { testimonialsController } from '../controllers/testimonialsController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas (montadas en /api/testimonials)
router.get('/', testimonialsController.getTestimonials);
router.post('/', testimonialsController.createTestimonial); // Crear testimonio público

// Rutas de administración (montadas en /api/testimonials/admin cuando se acceda con autenticación)
router.get('/admin', authenticateAdmin, testimonialsController.getAdminTestimonials);
router.put('/:id/approve', authenticateAdmin, testimonialsController.approveTestimonial);
router.put('/:id/reject', authenticateAdmin, testimonialsController.rejectTestimonial);

// Rutas CRUD que requieren autenticación de administrador
router.put('/:id', authenticateAdmin, testimonialsController.updateTestimonial);
router.delete('/:id', authenticateAdmin, testimonialsController.deleteTestimonial);

export default router;
