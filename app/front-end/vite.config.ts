// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';
import tsconfigPaths from 'vite-tsconfig-paths';
import { createRequire } from 'module';
import { analyzer } from 'vite-bundle-analyzer';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

// Detectar si estamos ejecutando tests (para cargar el plugin de Storybook)
const isRunningTests =
  !!process.env.npm_lifecycle_event && /test|vitest/i.test(process.env.npm_lifecycle_event);
let storybookPlugin: any = undefined;
if (isRunningTests) {
  const require = createRequire(import.meta.url);
  try {
    storybookPlugin = require('@storybook/addon-vitest/vitest-plugin').storybookTest;
  } catch (e) {
    // Si no está instalado, dejamos storybookPlugin undefined
    storybookPlugin = undefined;
  }
}

const plugins = [
  react(),
  tsconfigPaths(),
  // Solo activar el analyzer en desarrollo local, no en builds de producción
  ...(process.env.NODE_ENV !== 'production' && !process.env.CI
    ? [analyzer({ analyzerMode: 'server', openAnalyzer: true })]
    : []),
];

const config: any = {
  base: '/', // Vercel maneja esto automáticamente
  plugins,
  define: {
    // Notas: dejamos que Vite inyecte las variables `VITE_...` desde los archivos .env
    // en lugar de forzarlas aquí desde process.env. Mantener otras claves aquí si es necesario.
    'import.meta.env.VITE_BASE_PATH': JSON.stringify(process.env.VITE_BASE_PATH || ''),
    'import.meta.env.VITE_CLOUDINARY_CLOUD_NAME': JSON.stringify(
      process.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo'
    ),
    'import.meta.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  resolve: {
    alias: {
      '@': path.resolve(currentDir, 'src'),
      '@app': path.resolve(currentDir, 'src/app'),
      '@components': path.resolve(currentDir, 'src/components'),
      '@features': path.resolve(currentDir, 'src/features'),
      '@hooks': path.resolve(currentDir, 'src/hooks'),
      '@pages': path.resolve(currentDir, 'src/pages'),
      '@services': path.resolve(currentDir, 'src/services'),
      '@store': path.resolve(currentDir, 'src/store'),
      '@styles': path.resolve(currentDir, 'src/styles'),
      '@utils': path.resolve(currentDir, 'src/utils'),
      '@types': path.resolve(currentDir, 'src/types'),
      '@assets': path.resolve(currentDir, 'src/assets'),
      '@locales': path.resolve(currentDir, 'src/locales'),
    },
    // Evitar que Vite resuelva varias copias de React (causa frecuente de "Invalid hook call")
    dedupe: ['react', 'react-dom'],
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['src/test/setup.ts'],
          include: ['src/**/*.{test,spec}.{ts,tsx}'],
          exclude: [
            'node_modules',
            'dist',
            '.storybook',
            'storybook-static',
            '**/*.stories.*',
            '**/.{git,cache,output,temp}/**',
          ],
        },
      },
      // ---- Storybook tests (browser) ----
      {
        extends: true,
        plugins: storybookPlugin
          ? [storybookPlugin({ configDir: path.join(currentDir, '.storybook') })]
          : [],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: 'playwright',
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
  css: {
    modules: {
      // Preferimos pasar un string literal válido; evita el cast 'as any' que a veces
      // causa problemas con las tipificaciones en entornos estrictos.
      localsConvention: 'camelCaseOnly',
      // Nombres legibles en dev, hash corto en producción
      generateScopedName:
        process.env.NODE_ENV === 'production'
          ? '[hash:base64:8]'
          : '[name]__[local]___[hash:base64:5]',
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@headlessui/react', '@heroicons/react'],
          router: ['react-router-dom'],
          utils: ['date-fns'],
        },
      },
    },
  },
};

export default defineConfig(config);
