import mongoose from 'mongoose';
import { Experience } from '../models/index.js';

export const experiencesController = {
  // Obtener experiencias
  getExperiences: async (req: any, res: any): Promise<void> => {
    try {
      const userId = req.query.userId || '507f1f77bcf86cd799439011';

      // MongoDB-only implementation
      // Manejar tanto ObjectId como números para compatibilidad
      let query;
      if (mongoose.Types.ObjectId.isValid(userId)) {
        query = { user_id: new mongoose.Types.ObjectId(userId) };
      } else {
        // Para compatibilidad con datos legacy que usan números
        query = { user_id: userId };
      }

      const experiences = await Experience.find(query).sort({ order_index: 1 }).lean();

      res.json(
        experiences.map(exp => ({
          ...exp,
          id: exp._id,
          technologies: exp.technologies || [],
        }))
      );
    } catch (error: any) {
      console.error('Error al obtener experiencias:', error);
      res.status(500).json({ error: 'Error al obtener experiencias' });
    }
  },

  // Crear nueva experiencia (Admin)
  createExperience: async (req: any, res: any): Promise<void> => {
    try {
      const {
        user_id = 1,
        company,
        position,
        description,
        header_image,
        logo_image,
        start_date,
        end_date,
        is_current = false,
        location,
        order_index = 0,
        technologies = [],
      } = req.body;

      if (!company || !position || !start_date) {
        res.status(400).json({ error: 'Empresa, posición y fecha de inicio son requeridos' });
        return;
      }

      // MongoDB-only implementation
      const experience = new Experience({
        user_id,
        company,
        position,
        description,
        header_image: header_image || null,
        logo_image: logo_image || null,
        start_date: new Date(start_date),
        end_date: end_date ? new Date(end_date) : null,
        is_current,
        location,
        order_index,
        technologies: Array.isArray(technologies) ? technologies : [],
      });

      await experience.save();
      console.log('✅ Experiencia creada exitosamente:', experience._id);

      res.status(201).json({
        ...experience.toObject(),
        id: experience._id,
      });
    } catch (error: any) {
      console.error('Error al crear experiencia:', error);
      res.status(500).json({ error: 'Error al crear experiencia' });
    }
  },

  // Actualizar experiencia existente (Admin)
  updateExperience: async (req: any, res: any): Promise<void> => {
    try {
      const {
        company,
        position,
        description,
        header_image,
        logo_image,
        start_date,
        end_date,
        is_current = false,
        location,
        order_index = 0,
        technologies = [],
      } = req.body;

      if (!company || !position || !start_date) {
        res.status(400).json({ error: 'Empresa, posición y fecha de inicio son requeridos' });
        return;
      }

      // MongoDB-only implementation
      const experience = await Experience.findByIdAndUpdate(
        req.params.id,
        {
          company,
          position,
          description,
          header_image: header_image || null,
          logo_image: logo_image || null,
          start_date: new Date(start_date),
          end_date: end_date ? new Date(end_date) : null,
          is_current,
          location,
          order_index,
          technologies: Array.isArray(technologies) ? technologies : [],
          updated_at: new Date(),
        },
        { new: true, lean: true }
      );

      if (!experience) {
        res.status(404).json({ error: 'Experiencia no encontrada' });
        return;
      }

      console.log('✅ Experiencia actualizada exitosamente:', experience._id);
      res.json({
        ...experience,
        id: experience._id,
      });
    } catch (error: any) {
      console.error('Error al actualizar experiencia:', error);
      res.status(500).json({ error: 'Error al actualizar experiencia' });
    }
  },

  // Eliminar experiencia (Admin)
  deleteExperience: async (req: any, res: any): Promise<void> => {
    try {
      const { id } = req.params;

      console.log('🗑️ Intentando eliminar experiencia con ID:', id);

      // Validar que el ID no sea undefined o inválido
      if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
        console.error('❌ ID de experiencia inválido:', id);
        res.status(400).json({ error: 'ID de experiencia inválido' });
        return;
      }

      // MongoDB-only implementation
      const result = await Experience.findByIdAndDelete(id);

      if (!result) {
        console.log('❌ Experiencia no encontrada con ID:', id);
        res.status(404).json({ error: 'Experiencia no encontrada' });
        return;
      }

      console.log('✅ Experiencia eliminada exitosamente:', id);
      res.status(204).send();
    } catch (error: any) {
      console.error('❌ Error al eliminar experiencia:', error);
      res.status(500).json({ error: 'Error al eliminar experiencia' });
    }
  },
};
