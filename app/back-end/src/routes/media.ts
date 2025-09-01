import express from 'express';
import { mediaController } from '../controllers/mediaController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { upload } from '../config/multer.js';

const router = express.Router();

// Todas las rutas de media requieren autenticación de admin
router.use(authenticateAdmin);

// Rutas de gestión de archivos
router.post('/upload', upload.single('image'), mediaController.uploadFile);
router.post('/upload-multiple', upload.array('images', 10), mediaController.uploadMultiple);
router.get('/', mediaController.getMediaFiles);
router.delete('/:filename', mediaController.deleteFile);
router.delete('/cloudinary/delete', mediaController.deleteCloudinaryImage);

export default router;
