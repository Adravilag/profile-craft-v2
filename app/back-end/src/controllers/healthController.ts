import { Request, Response } from 'express';

export const healthCheck = (req: any, res: any) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    memory: process.memoryUsage(),
    pid: process.pid,
  };

  res.status(200).json(healthData);
};

export const readinessCheck = (req: any, res: any) => {
  // Aquí puedes añadir checks específicos (base de datos, servicios externos, etc.)
  try {
    // Ejemplo: verificar base de datos
    // const dbCheck = checkDatabase();

    res.status(200).json({
      status: 'Ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'OK',
        filesystem: 'OK',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'Not Ready',
      error: 'Service dependencies not available',
    });
  }
};
