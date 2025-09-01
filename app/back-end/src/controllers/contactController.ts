import { Contact } from '../models/index.js';
import { emailService } from '../services/emailService.js';

export const contactController = {
  // Enviar mensaje de contacto
  sendMessage: async (req: any, res: any): Promise<void> => {
    try {
      const { name, email, subject, message } = req.body;

      if (!name || !email || !subject || !message) {
        res.status(400).json({ error: 'Todos los campos son requeridos' });
        return;
      }

      // Información adicional del cliente
      const ip_address = req.ip || req.connection?.remoteAddress || null;
      const user_agent = req.get('User-Agent') || null;

      const contact = new Contact({
        name,
        email,
        subject,
        message,
        ip_address,
        user_agent,
        status: 'pending',
      });

      await contact.save();

      // Enviar email
      try {
        await emailService.sendContactEmail({
          name,
          email,
          subject,
          message,
        });

        res.status(201).json({
          message: 'Mensaje enviado correctamente',
          id: contact._id,
        });
      } catch (emailError) {
        console.error('Error enviando email:', emailError);
        res.status(201).json({
          message: 'Mensaje guardado, pero hubo un problema enviando el email',
          id: contact._id,
        });
      }
    } catch (error: any) {
      console.error('Error enviando mensaje:', error);
      res.status(500).json({ error: 'Error al enviar mensaje' });
    }
  },

  // ADMIN: Obtener todos los mensajes
  getAllMessages: async (req: any, res: any): Promise<void> => {
    try {
      const { status, page = 1, limit = 20 } = req.query;

      const filter: any = {};
      if (status) filter.status = status;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const messages = await Contact.find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Contact.countDocuments(filter);

      res.json({
        messages: messages.map(msg => ({
          ...msg,
          id: msg._id,
        })),
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error: any) {
      console.error('Error obteniendo mensajes:', error);
      res.status(500).json({ error: 'Error al obtener mensajes' });
    }
  },

  // ADMIN: Marcar mensaje como leído
  markAsRead: async (req: any, res: any): Promise<void> => {
    try {
      const { id } = req.params;

      const message = await Contact.findByIdAndUpdate(
        id,
        {
          status: 'read',
          read_at: new Date(),
        },
        { new: true }
      );

      if (!message) {
        res.status(404).json({ error: 'Mensaje no encontrado' });
        return;
      }

      res.json({
        ...message.toObject(),
        id: message._id,
      });
    } catch (error: any) {
      console.error('Error marcando mensaje como leído:', error);
      res.status(500).json({ error: 'Error al marcar mensaje como leído' });
    }
  },

  // ADMIN: Eliminar mensaje
  deleteMessage: async (req: any, res: any): Promise<void> => {
    try {
      const { id } = req.params;

      const result = await Contact.findByIdAndDelete(id);

      if (!result) {
        res.status(404).json({ error: 'Mensaje no encontrado' });
        return;
      }

      res.status(204).send();
    } catch (error: any) {
      console.error('Error eliminando mensaje:', error);
      res.status(500).json({ error: 'Error al eliminar mensaje' });
    }
  },

  // ADMIN: Obtener estadísticas de mensajes
  getStats: async (req: any, res: any): Promise<void> => {
    try {
      const stats = await Contact.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      const total = await Contact.countDocuments();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayCount = await Contact.countDocuments({
        created_at: { $gte: today },
      });

      res.json({
        total,
        today: todayCount,
        by_status: stats.reduce(
          (acc: Record<string, number>, stat: any) => {
            acc[stat._id] = stat.count;
            return acc;
          },
          {} as Record<string, number>
        ),
      });
    } catch (error: any) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  },
};
