import express from 'express';
import { skillsController } from '../controllers/skillsController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.get('/', skillsController.getSkills);

// Rutas de administración
router.post('/', authenticateAdmin, skillsController.createSkill);
router.put('/:id', authenticateAdmin, skillsController.updateSkill);
router.delete('/:id', authenticateAdmin, skillsController.deleteSkill);

export default router;
