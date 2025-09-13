import express, { Router } from 'express';
import { projectsController } from '../controllers/projectsController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router: Router = express.Router();

// Rutas públicas de proyectos (sin duplicar /projects ya que el router se monta en /api/projects)
router.get('/', projectsController.getProjects);
router.get('/:id', projectsController.getProjectById);

// Rutas de administración
router.get('/admin', authenticateAdmin, projectsController.getAdminProjects);
router.get('/admin/:id/stats', authenticateAdmin, projectsController.getProjectStats);
router.post('/admin', authenticateAdmin, projectsController.createProject);
router.put('/admin/:id', authenticateAdmin, projectsController.updateProject);
router.delete('/admin/:id', authenticateAdmin, projectsController.deleteProject);

export default router;
