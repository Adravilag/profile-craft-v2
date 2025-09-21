import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import cloudinaryService from '../services/cloudinaryService.js';
import { logger } from '../utils/logger.js';

export const mediaController = {
  // Subir archivo de imagen
  uploadFile: async (req: any, res: any): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No se ha subido ningún archivo' });
        return;
      }
      logger.debug('📁 Archivo recibido:', {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });

      // Determinar el tipo de imagen basado en el contexto
      const imageType = req.body.imageType || req.query.type || 'project';
      logger.debug('🎯 Tipo de imagen detectado:', imageType);

      // Verificar configuración de Cloudinary antes de intentar subir
      logger.debug('🔧 Verificando configuración de Cloudinary...');
      const cloudinaryConfig = {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET ? '***CONFIGURED***' : undefined,
      };
      logger.debug('🔧 Config Cloudinary en servidor:', cloudinaryConfig);

      try {
        // Seleccionar el método de subida apropiado según el tipo
        let cloudinaryResult;
        if (imageType === 'profile' || imageType === 'avatar') {
          logger.debug('📸 Subiendo imagen de perfil a Cloudinary...');
          cloudinaryResult = await cloudinaryService.uploadProfileImage(
            req.file.buffer || fs.readFileSync(req.file.path),
            req.file.originalname
          );
        } else {
          logger.debug('🖼️ Subiendo imagen de proyecto a Cloudinary...');
          // Por defecto usar uploadProjectImage para proyectos
          cloudinaryResult = await cloudinaryService.uploadProjectImage(
            req.file.buffer || fs.readFileSync(req.file.path),
            req.file.originalname
          );
        }

        // Eliminar archivo temporal si existe
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
          logger.debug('🗑️ Archivo temporal eliminado:', req.file.path);
        }

        logger.debug('✅ Imagen subida exitosamente a Cloudinary:', cloudinaryResult.secure_url);

        res.json({
          success: true,
          message: 'Archivo subido exitosamente a Cloudinary',
          file: {
            id: Date.now(),
            url: cloudinaryResult.secure_url,
            name: req.file.originalname,
            type: 'image',
            size: cloudinaryResult.bytes,
            thumbnail: cloudinaryResult.secure_url,
            filename: cloudinaryResult.public_id,
            source: 'cloudinary', // Identificar la fuente
          },
        });
        return;
      } catch (cloudinaryError) {
        logger.error('❌ Error detallado con Cloudinary:', {
          message: cloudinaryError instanceof Error ? cloudinaryError.message : cloudinaryError,
          stack: cloudinaryError instanceof Error ? cloudinaryError.stack : undefined,
        });

        // Verificar configuración de Cloudinary
        const cloudinaryConfig = {
          cloudName: process.env.CLOUDINARY_CLOUD_NAME,
          apiKey: process.env.CLOUDINARY_API_KEY,
          apiSecret: process.env.CLOUDINARY_API_SECRET ? '***CONFIGURED***' : undefined,
        };
        logger.debug('🔧 Configuración de Cloudinary:', cloudinaryConfig);

        logger.warn('⚠️ Fallback: usando almacenamiento local debido a error de Cloudinary');

        // Fallback: usar almacenamiento local
        let localFilePath: string;

        if (req.file.path) {
          // El archivo ya está guardado por multer
          localFilePath = req.file.path;
        } else {
          // Guardar el buffer manualmente
          const uploadsDir = path.join(process.cwd(), 'uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }

          const filename = `${Date.now()}-${req.file.originalname}`;
          localFilePath = path.join(uploadsDir, filename);
          fs.writeFileSync(localFilePath, req.file.buffer);
        }

        const filename = path.basename(localFilePath);
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;

        logger.debug('✅ Archivo guardado localmente como fallback:', fileUrl);
        res.json({
          success: true,
          message: 'Archivo subido exitosamente (almacenamiento local - Cloudinary no disponible)',
          file: {
            id: Date.now(),
            url: fileUrl,
            name: req.file.originalname,
            type: 'image',
            size: req.file.size,
            thumbnail: fileUrl,
            filename: filename,
            source: 'local', // Identificar la fuente
          },
        });
      }
    } catch (error) {
      logger.error('❌ Error al subir archivo:', error);
      res.status(500).json({
        success: false,
        error: 'Error al subir el archivo',
        message: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  },

  // Generar firma para subida directa a Cloudinary (signed upload)
  generateSignature: (req: any, res: any): void => {
    try {
      if (
        !process.env.CLOUDINARY_API_SECRET ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_CLOUD_NAME
      ) {
        res
          .status(500)
          .json({ success: false, error: 'Cloudinary no está configurado en el servidor' });
        return;
      }
      const folder = req.body.folder || req.query.folder || 'proyectos';
      const timestamp = Math.round(Date.now() / 1000);

      const paramsToSign: any = { timestamp };
      if (folder) paramsToSign.folder = folder;

      const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        process.env.CLOUDINARY_API_SECRET
      );

      res.json({
        success: true,
        signature,
        timestamp,
        apiKey: process.env.CLOUDINARY_API_KEY,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      });
    } catch (error) {
      logger.error('❌ Error generando firma Cloudinary:', error);
      res
        .status(500)
        .json({
          success: false,
          error: error instanceof Error ? error.message : 'Error generando firma',
        });
    }
  },

  // Subir múltiples archivos de imagen
  uploadMultiple: async (req: any, res: any): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      if (!files || !files.length) {
        res.status(400).json({ error: 'No se han subido archivos' });
        return;
      }

      const imageType = req.body.imageType || req.query.type || 'project';
      const results: any[] = [];

      for (const f of files) {
        try {
          let cloudinaryResult;
          if (imageType === 'profile' || imageType === 'avatar') {
            cloudinaryResult = await cloudinaryService.uploadProfileImage(
              f.buffer || fs.readFileSync(f.path),
              f.originalname
            );
          } else {
            cloudinaryResult = await cloudinaryService.uploadProjectImage(
              f.buffer || fs.readFileSync(f.path),
              f.originalname
            );
          }

          // eliminar archivo temporal
          if (f.path && fs.existsSync(f.path)) {
            fs.unlinkSync(f.path);
          }

          results.push({
            success: true,
            file: {
              url: cloudinaryResult.secure_url,
              name: f.originalname,
              size: cloudinaryResult.bytes,
              filename: cloudinaryResult.public_id,
              source: 'cloudinary',
            },
          });
        } catch (err) {
          logger.error('❌ Error subiendo archivo múltiple:', err);
          results.push({
            success: false,
            error: err instanceof Error ? err.message : err,
            name: f.originalname,
          });
        }
      }

      res.json({ success: true, files: results });
    } catch (error) {
      logger.error('❌ Error en uploadMultiple:', error);
      res.status(500).json({ error: 'Error al subir archivos' });
    }
  },

  // Obtener lista de archivos subidos
  getMediaFiles: (req: any, res: any): void => {
    try {
      const uploadsDir = path.join(process.cwd(), 'uploads');

      if (!fs.existsSync(uploadsDir)) {
        res.json([]);
        return;
      }

      const files = fs.readdirSync(uploadsDir);
      const mediaItems = files
        .filter(file => {
          // Filtrar solo archivos de imagen
          const ext = path.extname(file).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
        })
        .map(file => {
          const filePath = path.join(uploadsDir, file);
          const stats = fs.statSync(filePath);
          const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file}`;

          return {
            id: stats.mtimeMs,
            url: fileUrl,
            name: file,
            type: 'image' as const,
            size: stats.size,
            thumbnail: fileUrl,
            filename: file,
            created: stats.mtime,
          };
        })
        .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

      res.json(mediaItems);
    } catch (error) {
      logger.error('❌ Error al obtener archivos de media:', error);
      res.status(500).json({ error: 'Error al obtener archivos de media' });
    }
  },

  // Eliminar archivo
  deleteFile: (req: any, res: any): void => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(process.cwd(), 'uploads', filename);

      if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: 'Archivo no encontrado' });
        return;
      }

      fs.unlinkSync(filePath);
      logger.debug('🗑️ Archivo eliminado:', filename);

      res.json({ success: true, message: 'Archivo eliminado exitosamente' });
    } catch (error) {
      logger.error('❌ Error al eliminar archivo:', error);
      res.status(500).json({ error: 'Error al eliminar el archivo' });
    }
  },

  // Eliminar imagen de Cloudinary
  deleteCloudinaryImage: async (req: any, res: any): Promise<void> => {
    try {
      const { publicId } = req.body;

      if (!publicId) {
        res.status(400).json({
          success: false,
          error: 'Se requiere el public_id de la imagen',
        });
        return;
      }

      logger.debug('🗑️ Solicitando eliminación de imagen de Cloudinary:', publicId);

      const success = await cloudinaryService.deleteImage(publicId);

      if (success) {
        res.json({
          success: true,
          message: 'Imagen eliminada exitosamente de Cloudinary',
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'No se pudo eliminar la imagen de Cloudinary',
        });
      }
    } catch (error) {
      logger.error('❌ Error eliminando imagen de Cloudinary:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno al eliminar la imagen',
        message: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  },
};
