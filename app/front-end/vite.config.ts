// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';
import tsconfigPaths from 'vite-tsconfig-paths';
import { createRequire } from 'module';
import { analyzer } from 'vite-bundle-analyzer';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

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
  analyzer({ analyzerMode: 'server', openAnalyzer: true }),
];

const config: any = {
  plugins,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@app': path.resolve(__dirname, 'src/app'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@store': path.resolve(__dirname, 'src/store'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@locales': path.resolve(__dirname, 'src/locales'),
    },
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
          ? [storybookPlugin({ configDir: path.join(dirname, '.storybook') })]
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
          utils: ['date-fns', 'lodash'],
        },
      },
    },
  },
};

export default defineConfig(config);
