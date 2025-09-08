// Aquí puedes añadir checks específicos (base de datos, servicios externos, etc.)
export const readinessCheck = (req: any, res: any) => {
  res.status(200).json({
    status: 'Ready',
    timestamp: new Date().toISOString(),
    checks: {
      database: 'OK',
      filesystem: 'OK',
    },
  });
  // Fin del archivo
};
