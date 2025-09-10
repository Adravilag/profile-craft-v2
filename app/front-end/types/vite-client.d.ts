// Minimal ambient declaration for `vite/client` to satisfy tsc in environments
// where Vite's types are not installed (e.g., production-only install).
// This intentionally keeps a minimal shape; for full typing install `vite` devDependency.
interface ImportMetaEnv {
  readonly MODE?: string;
  readonly BASE_URL?: string;
  // VITE_ variables and others
  [key: string]: string | boolean | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'vite/client' {
  // Re-export the ImportMeta interfaces declared above
}
