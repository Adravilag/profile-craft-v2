import express, { Router } from 'express';
import { contactController } from '../controllers/contactController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router: Router = express.Router();

// Rutas públicas
router.post('/', contactController.sendMessage);

// Rutas de administración
router.get('/admin/messages', authenticateAdmin, contactController.getAllMessages);
router.put('/admin/messages/:id/read', authenticateAdmin, contactController.markAsRead);
router.delete('/admin/messages/:id', authenticateAdmin, contactController.deleteMessage);

export default router;
