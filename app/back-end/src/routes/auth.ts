import express from 'express';
import { authController } from '../controllers/authController.js';
import { profileController } from '../controllers/profileController.js';
import { authenticate, authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rutas de autenticación
router.get('/has-user', authController.hasUser);
router.get('/first-admin-user', authController.firstAdminUser);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify', authenticate, authController.verify);
router.post('/logout', authController.logout);
router.get('/dev-token', authController.devToken);
router.post('/dev-login', authController.devLogin);
router.get('/profile', authenticate, profileController.getAuthProfile);
router.put('/profile', authenticate, profileController.updateProfile);
router.post('/change-password', authenticate, authController.changePassword);

export default router;
