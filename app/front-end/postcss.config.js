import autoprefixer from 'autoprefixer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const purgecssModule = require('@fullhuman/postcss-purgecss');
const purgecssPkg = purgecssModule && (purgecssModule.default || purgecssModule);

// Create a wrapper plugin that skips PurgeCSS for CSS Modules (.module.css)
const _rawPurgePlugin = purgecssPkg({
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,html}', '../**/*.{html,js,ts,jsx,tsx}'],
  // Safelist common runtime / state class names and tokens used dynamically
  safelist: {
    standard: ['dark', 'active', 'navSticky', 'navigation-visible', 'menu-open', 'loading', 'open'],
    // keep dynamic and CSS-module related classes (add aboutCollab to avoid PurgeCSS removing it)
    deep: [
      /^md3-/,
      /^nav-/,
      /^cert/,
      /^project/,
      /^header/,
      /^fab/,
      /^btn/,
      /^preview/,
      /^aboutCollab/,
    ],
  },
  defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || [],
});

const purgecssPlugin = function (opts) {
  // opts here are ignored because _rawPurgePlugin already configured; but keep API
  return {
    postcssPlugin: 'postcss-purgecss-wrapper',
    OnceExit(root, helpers) {
      const file = (root.source && root.source.input && root.source.input.file) || '';
      if (typeof file === 'string' && file.endsWith('.module.css')) {
        // skip purging for CSS Modules to avoid removing scoped selectors
        return;
      }
      // delegate to the real plugin's OnceExit
      if (_rawPurgePlugin && typeof _rawPurgePlugin.OnceExit === 'function') {
        return _rawPurgePlugin.OnceExit(root, helpers);
      }
    },
  };
};

export default {
  plugins: [
    autoprefixer(),
    // Run PurgeCSS only for production builds
    ...(process.env.NODE_ENV === 'production' ? [purgecssPlugin] : []),
  ],
};
