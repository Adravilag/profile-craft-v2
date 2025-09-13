import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/index.js';
import { config } from '../config/index.js';
import { securityMiddleware } from '../middleware/security.js';
import { cleanseObject } from './profileController.js';
import { logger } from '../utils/logger.js';

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

      // Normalizar email para evitar problemas por mayúsculas/espacios
      const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : email;

      // Log de depuración: muestra el email (normalizado) para ayudar a reproducir "user not found"
      logger.debug('[authController.login] intent de login para email:', {
        raw: email,
        normalized: normalizedEmail,
        ip: req.ip || req.headers['x-forwarded-for'] || null,
      });

      const user = await User.findOne({ email: normalizedEmail });
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

      // Crear token de sesión corto para cookie HttpOnly (máxima seguridad)
      const token = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email,
          role: user.role,
          tokenVersion: (user as any).tokenVersion || 0,
        },
        config.JWT_SECRET,
        { expiresIn: '15m' } // Token corto para cookie HttpOnly (máxima seguridad)
      );

      // Crear token persistente para localStorage (duración más larga para UX)
      // Este token permite mantener la sesión activa después de recargas de página
      const persistentToken = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email,
          role: user.role,
          type: 'persistent', // Marcar como token persistente
          tokenVersion: (user as any).tokenVersion || 0,
        },
        config.JWT_SECRET,
        { expiresIn: '7d' } // Token largo para persistencia (7 días)
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
        token: persistentToken, // Enviar token persistente para localStorage
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
      // Obtener tokens desde cookie y header
      const cookieToken = req.cookies?.portfolio_auth_token;
      const authHeader = req.headers.authorization;
      const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

      // Agregar ambos tokens a blacklist si existen
      if (cookieToken) {
        securityMiddleware.addToBlacklist(cookieToken);
      }
      if (headerToken && headerToken !== cookieToken) {
        securityMiddleware.addToBlacklist(headerToken);
      }

      securityMiddleware.logSecurityEvent('LOGOUT_SUCCESS', { userId: req.user?.userId }, req);

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

  // Reset de contraseña por parte de un administrador
  resetUserPassword: async (req: any, res: any): Promise<void> => {
    try {
      const { email, newPassword } = req.body;

      if (!email || !newPassword) {
        res.status(400).json({ error: 'Se requiere email y newPassword' });
        return;
      }

      // Normalizar email
      const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : email;

      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      // Incrementar tokenVersion para invalidar tokens existentes
      await User.updateOne(
        { _id: user._id },
        { $set: { password: hashed }, $inc: { tokenVersion: 1 } }
      );

      // Opcional: añadir evento de auditoría
      try {
        securityMiddleware.logSecurityEvent(
          'ADMIN_PASSWORD_RESET',
          { email: normalizedEmail },
          req
        );
      } catch (e) {
        // no bloquear por fallo en auditoría
      }

      res.json({ message: 'Contraseña reseteada por administrador' });
    } catch (error: any) {
      logger.error('Error en resetUserPassword:', error);
      res.status(500).json({ error: 'Error reseteando contraseña' });
    }
  },

  // Solicitar recuperación de contraseña (se genera token temporal)
  requestPasswordReset: async (req: any, res: any): Promise<void> => {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ error: 'Email requerido' });
        return;
      }

      const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : email;
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        // Para evitar enumeración, responder OK
        res.json({ message: 'Si el usuario existe, se ha enviado un email con instrucciones' });
        return;
      }

      const resetToken = crypto.randomBytes(20).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      user.resetPasswordToken = tokenHash;
      user.resetPasswordExpires = expires;
      await user.save();

      // En producción aquí deberías enviar el enlace por email con resetToken
      const resetLink = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}&email=${encodeURIComponent(normalizedEmail)}`;

      try {
        securityMiddleware.logSecurityEvent(
          'PASSWORD_RESET_REQUEST',
          { email: normalizedEmail },
          req
        );
      } catch {}

      // En desarrollo devolvemos el token para pruebas; en producción enviar por email
      if ((config as any).isDevelopment) {
        // Loggear en consola para facilitar pruebas locales además de devolver en JSON
        try {
          logger.info('[DEV] Password reset token generado', {
            email: normalizedEmail,
            token: resetToken,
            resetLink,
          });
        } catch (e) {
          // no bloquear por fallo en logging
        }

        res.json({ message: 'Token generado (solo en desarrollo)', token: resetToken, resetLink });
      } else {
        // TODO: enviar email y no devolver token en respuesta
        res.json({ message: 'Si el usuario existe, se ha enviado un email con instrucciones' });
      }
    } catch (error: any) {
      logger.error('Error en requestPasswordReset:', error);
      res.status(500).json({ error: 'Error procesando la solicitud' });
    }
  },

  // Confirmar recovery usando token temporal y establecer nueva contraseña
  confirmPasswordReset: async (req: any, res: any): Promise<void> => {
    try {
      const { token, newPassword, email } = req.body;
      if (!token || !newPassword || !email) {
        res.status(400).json({ error: 'token, email y newPassword son requeridos' });
        return;
      }

      const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : email;
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({ email: normalizedEmail, resetPasswordToken: tokenHash });
      if (!user || !user.resetPasswordExpires || user.resetPasswordExpires.getTime() < Date.now()) {
        res.status(400).json({ error: 'Token inválido o expirado' });
        return;
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      user.password = hashed;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      // invalidar tokens previos
      (user as any).tokenVersion = ((user as any).tokenVersion || 0) + 1;
      await user.save();

      try {
        securityMiddleware.logSecurityEvent(
          'PASSWORD_RESET_CONFIRM',
          { email: normalizedEmail },
          req
        );
      } catch {}

      res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error: any) {
      logger.error('Error en confirmPasswordReset:', error);
      res.status(500).json({ error: 'Error al resetear contraseña' });
    }
  },
};
