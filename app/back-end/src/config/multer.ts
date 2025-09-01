import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { config } from './index.js';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), config.FILE_UPLOAD.UPLOAD_DIR);
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, 'image-' + uniqueSuffix + extension);
  },
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.FILE_UPLOAD.MAX_SIZE,
  },
  fileFilter: function (req, file, cb) {
    // Verificar que sea una imagen permitida
    if (
      config.FILE_UPLOAD.ALLOWED_TYPES.some(type => file.mimetype.startsWith(type.split('/')[0]))
    ) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  },
});
