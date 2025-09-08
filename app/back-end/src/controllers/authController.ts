import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { config } from '../config/index.js';
import { securityMiddleware } from '../middleware/security.js';
import { cleanseObject } from './profileController.js';
import { logger } from '../utils/logger';

// Helper específico para sanitizar respuestas de usuario en endpoints de auth
/**
 * Sanitiza datos de usuario para endpoints públicos (elimina información sensible)
 */
export function sanitizeAuthUser(user: any): any {
  if (!user) return null;

  return cleanseObject({
    name: user.name,
    username: user.username || 'admin', // Username público para acceso al perfil
    publicId: 'admin', // ID público que no expone la ID real de la base de datos
  });
}

// Helper para endpoints de auth que SÍ deben devolver email/role (login, register, verify)
function sanitizeAuthUserInternal(user: any) {
  if (!user || typeof user !== 'object') return user;
  const copy: Record<string, any> = { ...user };

  // Normalizar id
  if (copy._id) {
    try {
      copy.id = copy._id.toString();
    } catch {
      copy.id = copy._id;
    }
  }

  // Eliminar solo campos específicos para endpoints internos de auth
  delete copy._id;
  delete copy.__v;
  delete copy.password;
  delete copy.pattern;
  delete copy.salt;
  delete copy.token;
  delete copy.admin_secret;
  delete copy.user_id;
  delete copy.last_login_at;
  delete copy.created_at;
  delete copy.updated_at;
  delete copy.phone; // No exponer teléfono salvo que sea necesario

  // Mantener email y role para funcionalidad de auth
  // NOTA: email se mantiene solo para endpoints autenticados

  return copy;
}

export const authController = {
  // Verificar si existe al menos un usuario registrado
  hasUser: async (req: any, res: any): Promise<void> => {
    try {
      const count = await User.countDocuments();
      res.json({ exists: count > 0 });
    } catch (error) {
      logger.error('Error en login:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Obtener el primer usuario admin
  firstAdminUser: async (req: any, res: any): Promise<void> => {
    try {
      const adminUser = await User.findOne({ role: 'admin' }).select('_id name email role').lean();

      if (!adminUser) {
        res.status(404).json({
          success: false,
          error: 'No se encontró usuario admin',
        });
        return;
      }

      // Sanitizar datos antes de enviar
      const sanitizedUser = sanitizeAuthUser(adminUser as any);

      res.json({
        success: true,
        user: sanitizedUser,
      });
    } catch (error: any) {
      logger.error('🔥 Error obteniendo primer usuario admin:', error);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo usuario admin',
      });
    }
  },

  // Registro de usuario
  register: async (req: any, res: any): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ error: 'El usuario ya existe' });
        return;
      }

      const userCount = await User.countDocuments();
      const isFirstUser = userCount === 0;

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: isFirstUser ? 'admin' : 'user',
      });

      await newUser.save();

      // Eliminar token de la respuesta, solo devolver datos del usuario
      const sanitizedUser = sanitizeAuthUserInternal(newUser as any);
      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: sanitizedUser,
      });
    } catch (error: any) {
      logger.error('Error en registro:', error);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  },

  // Inicio de sesión
  login: async (req: any, res: any): Promise<void> => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        securityMiddleware.logSecurityEvent('LOGIN_FAILED_USER_NOT_FOUND', { email }, req);
        res.status(401).json({ error: 'Credenciales inválidas' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        securityMiddleware.logSecurityEvent('LOGIN_FAILED_WRONG_PASSWORD', { email }, req);
        res.status(401).json({ error: 'Credenciales inválidas' });
        return;
      }

      const token = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email,
          role: user.role,
        },
        config.JWT_SECRET,
        { expiresIn: '15m' } // Reducido de 7d a 15m para mayor seguridad
      );

      // Enviar token en cookie httpOnly
      res.cookie('portfolio_auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        // En desarrollo usar 'lax' para evitar que sameSite strict impida envío desde el proxy dev
        sameSite: config.isDevelopment ? 'lax' : 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutos
      });

      securityMiddleware.logSecurityEvent('LOGIN_SUCCESS', { email, userId: user._id }, req);

      const sanitizedUser = sanitizeAuthUserInternal(user as any);
      res.json({
        message: 'Inicio de sesión exitoso',
        user: sanitizedUser,
      });
    } catch (error: any) {
      logger.error('Error en login:', error);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  },

  // Verificar token
  verify: async (req: any, res: any): Promise<void> => {
    try {
      // Si no viene un usuario en req (optionalAuth), no es un error: devolver valid:false
      if (!req.user) {
        res.json({ valid: false, user: null });
        return;
      }

      const user = await User.findById(req.user.userId).select('-password');

      if (!user) {
        res.json({ valid: false, user: null });
        return;
      }

      const sanitizedUser = sanitizeAuthUserInternal(user as any);
      res.json({
        valid: true,
        user: sanitizedUser,
      });
    } catch (error: any) {
      logger.error('Error verificando token:', error);
      res.status(500).json({ error: 'Error al verificar token' });
    }
  },

  // Cerrar sesión
  logout: async (req: any, res: any): Promise<void> => {
    try {
      // Obtener el token antes de limpiarlo
      const token = req.cookies?.portfolio_auth_token;

      if (token) {
        // Agregar token a blacklist
        securityMiddleware.addToBlacklist(token);
        securityMiddleware.logSecurityEvent('LOGOUT_SUCCESS', { userId: req.user?.userId }, req);
      }

      // Limpiar la cookie httpOnly
      res.clearCookie('portfolio_auth_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: config.isDevelopment ? 'lax' : 'strict',
      });

      res.json({ message: 'Sesión cerrada exitosamente' });
    } catch (error: any) {
      logger.error('Error en logout:', error);
      res.status(500).json({ error: 'Error al cerrar sesión' });
    }
  },

  // Cambiar contraseña
  changePassword: async (req: any, res: any): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId;

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        res.status(400).json({ error: 'Contraseña actual incorrecta' });
        return;
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

      res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error: any) {
      logger.error('Error cambiando contraseña:', error);
      res.status(500).json({ error: 'Error al cambiar contraseña' });
    }
  },
};
