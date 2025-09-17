// Idempotent ESM script to patch lint-staged bin for chalk CommonJS compatibility
// It will replace `import { supportsColor } from 'chalk'` with
// `import chalkPkg from 'chalk'; const { supportsColor } = chalkPkg;`

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const target = path.resolve(
  __dirname,
  '..',
  'node_modules',
  'lint-staged',
  'bin',
  'lint-staged.js'
);

try {
  if (!fs.existsSync(target)) {
    console.warn('lint-staged bin not found, skipping patch:', target);
    process.exit(0);
  }

  const src = fs.readFileSync(target, 'utf8');
  if (src.includes("import { supportsColor } from 'chalk'")) {
    const patched = src.replace(
      "import { supportsColor } from 'chalk'",
      "import chalkPkg from 'chalk'\nconst { supportsColor } = chalkPkg;"
    );
    fs.writeFileSync(target, patched, 'utf8');
    console.log('Patched lint-staged bin for chalk compatibility');
  } else {
    console.log('No patch needed for lint-staged bin');
  }
} catch (e) {
  console.error('Failed to apply lint-staged patch:', e && e.message ? e.message : e);
  process.exit(1);
}
