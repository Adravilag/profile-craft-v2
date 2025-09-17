// Singleton cache for SVG asset module URLs. This module performs the Vite
// `import.meta.glob` call once at runtime and caches the mapping from asset
// path to the resolved URL. Components should use the helpers below so we don't
// execute the glob multiple times (expensive when many components mount).

// This module intentionally does NOT bundle SVGs from `src/assets/svg`.
// Instead it resolves public asset URLs under `/assets/svg/<name>.svg` (served from `public`).
// It performs lightweight HEAD/GET checks and caches results to avoid repeated network calls.

type CacheEntry = string | false; // false means not found
const urlMap: Record<string, CacheEntry> = {};

function normalizeKey(name: string) {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9.-]/g, '');
}

function publicPathFor(key: string) {
  const base = (import.meta.env.BASE_URL as string) || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  // Ensure leading slash for absolute paths (so resolveIconUrl in components can also handle)
  const rel = `assets/svg/${key}.svg`;
  if (normalizedBase === '/') return `/${rel}`;
  // Avoid double slashes
  return `${normalizedBase.replace(/\/$/, '')}/${rel}`;
}

async function checkPublicAsset(url: string): Promise<boolean> {
  try {
    const head = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    if (head && head.ok) return true;
  } catch (e) {
    // HEAD may fail due to CORS; fall back to GET
    try {
      const getRes = await fetch(url, { method: 'GET', cache: 'no-store' });
      if (getRes && getRes.ok) return true;
    } catch (err) {
      // not found or blocked
    }
  }
  return false;
}

export async function getIconUrlFromMap(name: string): Promise<string | null> {
  if (!name) return null;
  const key = normalizeKey(name);
  if (key in urlMap) {
    return urlMap[key] === false ? null : (urlMap[key] as string);
  }

  const candidate = publicPathFor(key);
  const ok = await checkPublicAsset(candidate);
  urlMap[key] = ok ? candidate : false;
  return ok ? candidate : null;
}

export async function resolveIconCandidatesFromMap(candidates: string[]): Promise<string | null> {
  if (!candidates || candidates.length === 0) return null;
  for (const c of candidates) {
    const key = normalizeKey(String(c || ''));
    if (!key) continue;
    if (key in urlMap) {
      if (urlMap[key] === false) continue;
      return urlMap[key] as string;
    }
    const candidate = publicPathFor(key);
    const ok = await checkPublicAsset(candidate);
    urlMap[key] = ok ? candidate : false;
    if (ok) return candidate;
  }
  return null;
}

// Synchronous accessor when already checked (may return null if unknown)
export function getIconUrlFromMapSync(name: string): string | null {
  const key = normalizeKey(name || '');
  if (!key) return null;
  if (!(key in urlMap)) return null;
  return urlMap[key] === false ? null : (urlMap[key] as string);
}

export default {
  getIconUrlFromMap,
  getIconUrlFromMapSync,
  resolveIconCandidatesFromMap,
};
