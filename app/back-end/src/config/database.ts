import mongoose from 'mongoose';
import { config } from './index.js';

// Configuración de MongoDB
export const connectMongoDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.DATABASE_URL;

    if (!mongoURI) {
      throw new Error('❌ MONGODB_URI o DATABASE_URL no está configurado');
    }

    console.log('🍃 Conectando a MongoDB...');

    await mongoose.connect(mongoURI, {
      // Opciones de conexión
    });

    console.log('✅ MongoDB conectado exitosamente');

    // Event listeners para conexión
    mongoose.connection.on('error', error => {
      console.error('❌ Error de conexión MongoDB:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB desconectado');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔒 Conexión MongoDB cerrada por terminación de aplicación');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    throw error;
  }
};

// Inicialización de base de datos MongoDB-only
export const initializeDatabase = async (): Promise<string> => {
  const mongoURI = process.env.MONGODB_URI || process.env.DATABASE_URL;

  if (!mongoURI) {
    throw new Error('❌ MongoDB URI requerido: Configure MONGODB_URI o DATABASE_URL');
  }

  console.log('🍃 Configurando MongoDB exclusivamente');
  await connectMongoDB();
  return 'mongodb';
};
