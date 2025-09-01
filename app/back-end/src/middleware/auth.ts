import express from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

// Middleware de autenticación básica (cualquier usuario autenticado)
export const authenticate = (req: any, res: any, next: any): void => {
  // Leer token desde cookie httpOnly
  const token = req.cookies?.portfolio_auth_token;

  if (!token) {
    res.status(401).json({ error: 'Token de acceso requerido' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    if (typeof decoded === 'string' || !decoded) {
      res.status(403).json({ error: 'Token inválido' });
      return;
    }
    req.user = decoded as jwt.JwtPayload & { role?: string };
    next();
  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(403).json({ error: 'Token inválido' });
  }
};

// Middleware de autenticación para administradores
export const authenticateAdmin = (req: any, res: any, next: any): void => {
  // Leer token desde cookie httpOnly
  const token = req.cookies?.portfolio_auth_token;

  if (!token) {
    res.status(401).json({ error: 'Token de acceso requerido' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    if (typeof decoded === 'string' || !decoded || (decoded as any).role !== 'admin') {
      res.status(403).json({ error: 'Acceso denegado: se requieren permisos de administrador' });
      return;
    }
    req.user = decoded as jwt.JwtPayload & { role?: string };
    next();
  } catch (error) {
    console.error('❌ Error verificando token admin:', error);
    res.status(403).json({ error: 'Token inválido' });
  }
};
