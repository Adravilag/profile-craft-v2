import { Skill } from '../models/index.js';

export const skillsController = {
  // Obtener todas las habilidades
  getSkills: async (req: any, res: any): Promise<void> => {
    try {
      const userId = req.query.userId || 1;

      // MongoDB-only implementation
      const skills = await Skill.find({ user_id: userId }).sort({ order_index: 1, _id: 1 }).lean();

      res.json(
        skills.map(skill => ({
          ...skill,
          id: skill._id,
        }))
      );
    } catch (error: any) {
      console.error('Error al obtener skills:', error);
      res.status(500).json({ error: 'Error al obtener las habilidades' });
    }
  },

  // Crear nueva habilidad
  createSkill: async (req: any, res: any): Promise<void> => {
    try {
      const { user_id, name, category, icon_class, level, order_index, featured } = req.body;

      if (!name || !category) {
        res.status(400).json({ error: 'Nombre y categoría son requeridos' });
        return;
      }

      // MongoDB-only implementation
      const skill = new Skill({
        user_id: user_id || 1,
        name,
        category,
        icon_class: icon_class || null,
        featured: typeof featured === 'boolean' ? featured : false,
        level: level || 50,
        order_index: order_index || 1,
      });

      await skill.save();
      console.log('✅ Habilidad creada exitosamente:', skill._id);

      res.status(201).json({
        ...skill.toObject(),
        id: skill._id,
      });
    } catch (error: any) {
      console.error('Error al crear skill:', error);
      res.status(500).json({ error: 'Error al crear la habilidad' });
    }
  },

  // Actualizar habilidad
  updateSkill: async (req: any, res: any): Promise<void> => {
    try {
      const { name, category, icon_class, level, order_index, featured } = req.body;

      if (!name || !category) {
        res.status(400).json({ error: 'Nombre y categoría son requeridos' });
        return;
      }

      // MongoDB-only implementation
      const skill = await Skill.findByIdAndUpdate(
        req.params.id,
        {
          name,
          category,
          icon_class: icon_class || null,
          featured: typeof featured === 'boolean' ? featured : undefined,
          level: level || 50,
          order_index: order_index || 1,
          updated_at: new Date(),
        },
        { new: true, lean: true }
      );

      if (!skill) {
        res.status(404).json({ error: 'Habilidad no encontrada' });
        return;
      }

      console.log('✅ Habilidad actualizada exitosamente:', skill._id);
      res.json({
        ...skill,
        id: skill._id,
      });
    } catch (error: any) {
      console.error('Error al actualizar skill:', error);
      res.status(500).json({ error: 'Error al actualizar la habilidad' });
    }
  },

  // Eliminar habilidad
  deleteSkill: async (req: any, res: any): Promise<void> => {
    try {
      // MongoDB-only implementation
      const result = await Skill.findByIdAndDelete(req.params.id);

      if (!result) {
        res.status(404).json({ error: 'Habilidad no encontrada' });
        return;
      }

      console.log('✅ Habilidad eliminada exitosamente:', req.params.id);
      res.json({ message: 'Habilidad eliminada correctamente' });
    } catch (error: any) {
      console.error('Error al eliminar skill:', error);
      res.status(500).json({ error: 'Error al eliminar la habilidad' });
    }
  },
};
