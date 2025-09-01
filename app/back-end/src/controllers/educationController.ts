import { Request, Response } from 'express';
import { Education, User } from '../models/index.js';
import mongoose from 'mongoose';
import { getFirstAdminUserId, resolveUserId } from '../services/userService.js';

// Usar userService para resolver user ids dinámicos

export const educationController = {
  // Obtener educación de un usuario
  getEducation: async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.query;
      console.log('🎓 Obteniendo educación para usuario:', userId);

      let queryUserId = userId;

      // Si el userId es 'dynamic-admin-id', buscar el primer usuario admin
      if (userId === 'dynamic-admin-id') {
        queryUserId = await getFirstAdminUserId();
        console.log('🔄 User ID resuelto para dynamic-admin-id:', queryUserId);
      }

      // Validar que el userId sea un ObjectId válido
      if (!mongoose.Types.ObjectId.isValid(queryUserId as string)) {
        res.status(400).json({ error: 'ID de usuario inválido' });
        return;
      }

      // MongoDB-only implementation
      const education = await Education.find({ user_id: queryUserId })
        .sort({ order_index: 1, start_date: -1 })
        .lean();

      console.log('✅ Educación encontrada:', education.length, 'registros');

      // Mapear los datos para incluir el id junto con _id para compatibilidad con frontend
      const mappedEducation = education.map(edu => ({
        ...edu,
        id: edu._id.toString(),
      }));

      res.json(mappedEducation);
    } catch (error: any) {
      console.error('❌ Error obteniendo educación:', error);
      res.status(500).json({ error: 'Error obteniendo educación' });
    }
  },

  // Método de debug para obtener todos los IDs de educación
  debugEducationIds: async (req: Request, res: Response): Promise<void> => {
    try {
      const allEducation = await Education.find().select('_id title user_id').lean();
      console.log('🔍 DEBUG: Todos los IDs de educación en la base de datos:');
      allEducation.forEach(edu => {
        console.log(`   - ID: ${edu._id}, Título: ${edu.title}, Usuario: ${edu.user_id}`);
      });

      res.json({
        count: allEducation.length,
        educations: allEducation.map(edu => ({
          id: edu._id.toString(),
          _id: edu._id.toString(),
          title: edu.title,
          user_id: edu.user_id,
        })),
      });
    } catch (error: any) {
      console.error('❌ Error en debug de educación:', error);
      res.status(500).json({ error: 'Error en debug de educación' });
    }
  },
  // Crear nueva educación (Admin)
  createEducation: async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        title,
        institution,
        start_date,
        end_date,
        description,
        grade,
        user_id,
        order_index = 0,
        header_image,
        logo_image,
      } = req.body;

      console.log('🎓 Creando nueva educación:', { title, institution, user_id });

      if (!title || !institution || !start_date) {
        res.status(400).json({ error: 'Título, institución y fecha de inicio son requeridos' });
        return;
      }

      // Resolver el user_id dinámico
      const resolvedUserId = await resolveUserId(user_id);
      console.log('🔄 User ID resuelto:', resolvedUserId);

      // Validar que el ID sea un ObjectId válido
      if (!mongoose.Types.ObjectId.isValid(resolvedUserId)) {
        res.status(400).json({ error: 'ID de usuario inválido' });
        return;
      }

      // MongoDB-only implementation
      const newEducation = new Education({
        title,
        institution,
        start_date,
        end_date,
        description,
        grade,
        header_image: header_image || null,
        logo_image: logo_image || null,
        user_id: new mongoose.Types.ObjectId(resolvedUserId),
        order_index,
      });

      await newEducation.save();
      console.log('✅ Educación creada exitosamente:', newEducation._id);
      res.status(201).json(newEducation);
    } catch (error: any) {
      console.error('❌ Error creando educación:', error);
      res.status(500).json({ error: 'Error creando educación' });
    }
  },

  // Actualizar educación existente (Admin)
  updateEducation: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const {
        title,
        institution,
        start_date,
        end_date,
        description,
        grade,
        order_index,
        header_image,
        logo_image,
      } = req.body;

      // MongoDB-only implementation
      const updatedEducation = await Education.findByIdAndUpdate(
        id,
        {
          title,
          institution,
          start_date,
          end_date,
          description,
          grade,
          header_image: header_image || null,
          logo_image: logo_image || null,
          order_index,
        },
        { new: true }
      );

      if (!updatedEducation) {
        res.status(404).json({ error: 'Educación no encontrada' });
        return;
      }

      console.log('✅ Educación actualizada exitosamente:', updatedEducation._id);
      res.json(updatedEducation);
    } catch (error: any) {
      console.error('Error actualizando educación:', error);
      res.status(500).json({ error: 'Error actualizando educación' });
    }
  },
  // Eliminar educación (Admin)
  deleteEducation: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      console.log('🗑️ Intentando eliminar educación con ID:', id);
      console.log('🔍 Tipo de ID:', typeof id);
      console.log('🔍 Longitud del ID:', id ? id.length : 'undefined');
      console.log('🔍 ID como string:', JSON.stringify(id));

      // Validar que el ID no sea undefined o vacío
      if (!id || id === 'undefined' || id.trim() === '') {
        console.error('❌ ID de educación vacío o indefinido:', id);
        res.status(400).json({ error: 'ID de educación requerido' });
        return;
      }

      // Limpiar el ID removiendo caracteres no válidos y espacios en blanco
      const cleanId = id.trim().replace(/[^a-fA-F0-9]/g, '');
      console.log('🧹 ID limpio:', cleanId);

      // Validar que el ID tenga el formato correcto de ObjectId (24 caracteres hexadecimales)
      if (cleanId.length !== 24) {
        console.error(
          '❌ ID de educación con longitud incorrecta:',
          cleanId,
          'Longitud:',
          cleanId.length
        );
        res.status(400).json({ error: 'ID de educación con formato inválido' });
        return;
      }

      // Validar que el ID sea un ObjectId válido
      if (!mongoose.Types.ObjectId.isValid(cleanId)) {
        console.error('❌ ID de educación no es un ObjectId válido:', cleanId);
        res.status(400).json({ error: 'ID de educación inválido' });
        return;
      }

      // MongoDB-only implementation
      const result = await Education.findByIdAndDelete(cleanId);

      if (!result) {
        console.log('❌ Educación no encontrada con ID:', cleanId);

        // Intentar buscar si existe un documento con un ID similar
        const allEducation = await Education.find().select('_id title user_id').lean();
        console.log(
          '📋 IDs existentes de educación:',
          allEducation.map(e => e._id.toString())
        );

        // Buscar si hay algún ID parcialmente similar (útil para debugging)
        const similarIds = allEducation.filter(edu => {
          const eduId = edu._id.toString();
          return (
            eduId.includes(cleanId.substring(0, 10)) || cleanId.includes(eduId.substring(0, 10))
          );
        });

        if (similarIds.length > 0) {
          console.log(
            '🔍 IDs similares encontrados:',
            similarIds.map(e => ({
              id: e._id.toString(),
              title: e.title,
            }))
          );
        }

        res.status(404).json({
          error: 'Educación no encontrada con el ID proporcionado',
          message:
            'El ID solicitado no existe en la base de datos. Esto puede deberse a que el elemento ya fue eliminado o los datos del frontend están desactualizados.',
          requestedId: cleanId,
          suggestion: 'Recarga la página para obtener los datos más recientes',
          availableEducations: allEducation.map(e => ({
            id: e._id.toString(),
            title: e.title,
            user_id: e.user_id,
          })),
        });
        return;
      }

      console.log('✅ Educación eliminada exitosamente:', cleanId);
      res.status(204).send();
    } catch (error: any) {
      console.error('❌ Error eliminando educación:', error);
      console.error('❌ Stack trace:', error.stack);
      res.status(500).json({ error: 'Error eliminando educación' });
    }
  },
};
