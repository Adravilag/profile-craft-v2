// Base path configuration used across the app for routing when deployed under a subpath.
// Can be configured using Vite env variable VITE_BASE_PATH.
// Por defecto usamos raíz '/' para servir desde el dominio principal
// aplicación esté montada en ese subpath tanto en desarrollo como en
// producción, salvo que se especifique VITE_BASE_PATH.
const envBase = (import.meta.env.VITE_BASE_PATH as string) || '';
export const BASE_PATH = envBase || '/';

export function normalizeBase(base: string) {
  if (!base) return '/';
  if (!base.startsWith('/')) base = '/' + base;
  if (base.length > 1 && base.endsWith('/')) base = base.slice(0, -1);
  return base;
}

export const NORMALIZED_BASE = normalizeBase(BASE_PATH);

export function pathStartsWithBase(path: string) {
  const base = NORMALIZED_BASE;
  if (!base || base === '/') return true;
  return path === base || path.startsWith(base + '/');
}

export function stripBaseFromPath(path: string) {
  const base = NORMALIZED_BASE;
  if (!base || base === '/') return path;
  if (path === base) return '/';
  if (path.startsWith(base + '/')) return path.slice(base.length);
  return path;
}
