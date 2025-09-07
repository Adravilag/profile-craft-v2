// Test script to verify environment variables
console.log('Environment variables test:');
console.log('NODE_ENV:', import.meta.env.NODE_ENV);
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('VITE_BASE_PATH:', import.meta.env.VITE_BASE_PATH);
console.log('VITE_CLOUDINARY_CLOUD_NAME:', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

// Also check the config file
import { config } from './src/config/app.ts';
console.log('Config API_URL:', config.API_URL);
