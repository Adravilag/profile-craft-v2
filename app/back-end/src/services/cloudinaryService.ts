// src/services/cloudinaryService.ts
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Verificar configuración de Cloudinary
const isCloudinaryConfigured = () => {
  const requiredVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn(`⚠️ Cloudinary no configurado. Variables faltantes: ${missingVars.join(', ')}`);
    return false;
  }
  return true;
};

// Configurar Cloudinary solo si todas las variables están presentes
if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('✅ Cloudinary configurado correctamente');
} else {
  console.warn('⚠️ Cloudinary no está configurado. Las funciones de upload fallarán.');
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  created_at: string;
}

export const cloudinaryService = {
  /**
   * Subir imagen de perfil a Cloudinary
   */
  uploadProfileImage: async (
    buffer: Buffer,
    originalName: string
  ): Promise<CloudinaryUploadResult> => {
    try {
      // Verificar si Cloudinary está configurado
      if (!isCloudinaryConfigured()) {
        throw new Error(
          'Cloudinary no está configurado. Por favor, configura las variables de entorno CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET.'
        );
      }

      console.log('📸 Subiendo imagen de perfil a Cloudinary...');

      const stream = Readable.from(buffer);

      const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'perfil',
            public_id: `foto-perfil-${Date.now()}`,
            transformation: [
              { width: 800, height: 800, crop: 'fill', gravity: 'face' },
              { quality: 'auto', fetch_format: 'auto' },
            ],
            overwrite: true,
            resource_type: 'image',
          },
          (error, result) => {
            if (error) {
              console.error('❌ Error subiendo a Cloudinary:', error);
              reject(error);
            } else if (result) {
              console.log('✅ Imagen subida exitosamente a Cloudinary:', result.secure_url);
              resolve(result as CloudinaryUploadResult);
            } else {
              reject(new Error('No se obtuvo resultado de Cloudinary'));
            }
          }
        );

        stream.pipe(uploadStream);
      });

      return result;
    } catch (error) {
      console.error('❌ Error en uploadProfileImage:', error);
      throw error;
    }
  },
  /**
   * Subir imagen de proyecto a Cloudinary
   */
  uploadProjectImage: async (
    buffer: Buffer,
    originalName: string
  ): Promise<CloudinaryUploadResult> => {
    try {
      // Verificar si Cloudinary está configurado
      if (!isCloudinaryConfigured()) {
        throw new Error(
          'Cloudinary no está configurado. Por favor, configura las variables de entorno CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET.'
        );
      }

      console.log('🖼️ Subiendo imagen de proyecto a Cloudinary...');

      const stream = Readable.from(buffer);

      const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'proyectos',
            public_id: `proyecto-${Date.now()}`,
            transformation: [
              { width: 1200, height: 675, crop: 'fill' }, // 16:9 aspect ratio
              { quality: 'auto', fetch_format: 'auto' },
            ],
            overwrite: true,
            resource_type: 'image',
          },
          (error, result) => {
            if (error) {
              console.error('❌ Error subiendo a Cloudinary:', error);
              reject(error);
            } else if (result) {
              console.log('✅ Imagen de proyecto subida exitosamente:', result.secure_url);
              resolve(result as CloudinaryUploadResult);
            } else {
              reject(new Error('No se obtuvo resultado de Cloudinary'));
            }
          }
        );

        stream.pipe(uploadStream);
      });

      return result;
    } catch (error) {
      console.error('❌ Error en uploadProjectImage:', error);
      throw error;
    }
  },

  /**
   * Eliminar imagen de Cloudinary
   */
  deleteImage: async (publicId: string): Promise<boolean> => {
    try {
      console.log('🗑️ Eliminando imagen de Cloudinary:', publicId);

      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === 'ok') {
        console.log('✅ Imagen eliminada exitosamente de Cloudinary');
        return true;
      } else {
        console.warn('⚠️ No se pudo eliminar la imagen de Cloudinary:', result);
        return false;
      }
    } catch (error) {
      console.error('❌ Error eliminando imagen de Cloudinary:', error);
      return false;
    }
  },
};

export default cloudinaryService;
