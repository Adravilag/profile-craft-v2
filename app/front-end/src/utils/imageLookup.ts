// Utility to find an image in src/assets/img by a natural name (company/institution)
// Uses Vite's import.meta.glob eager to build a map at build time.

type ModulesMap = Record<string, () => Promise<any>>;

// Lazy-loaded map of images. We intentionally avoid `eager: true` to prevent
// bundling image assets into initial chunks. The map is populated on demand
// when `ensureImageMap()` is invoked. `findImageForName` remains synchronous
// and will return `undefined` until the async loader finishes. Consumers that
// require deterministic results at startup should call `await ensureImageMap()`.

let imageMap: Map<string, string> | null = null;
let loadingPromise: Promise<void> | null = null;

const rawModules = import.meta.glob('/src/assets/img/*.{png,jpg,jpeg,svg}', {
  eager: false,
  import: 'default',
}) as ModulesMap;

const loadImageMap = async () => {
  if (imageMap) return;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const map = new Map<string, string>();
      const keys = Object.keys(rawModules || {});
      await Promise.all(
        keys.map(async p => {
          try {
            const mod = await (rawModules as any)[p]();
            const file = p.split('/').pop()!;
            const name = file.replace(/\.[^/.]+$/, '');
            const norm = name.replace(/[^a-z0-9]/gi, '').toLowerCase();
            const url = mod?.default ?? mod;
            if (url) map.set(norm, url);
          } catch (e) {
            // ignore individual module errors
          }
        })
      );

      imageMap = map;
    } catch (e) {
      imageMap = new Map<string, string>();
    }
  })();

  return loadingPromise;
};

/**
 * Ensure the internal image map is populated. Consumers can await this to
 * get deterministic results before calling `findImageForName`.
 */
export const ensureImageMap = async (): Promise<void> => {
  await loadImageMap();
};

/**
 * Synchronous accessor to get the internal image map if already initialized.
 * Returns `null` if the map is not yet populated.
 */
export function getImageMapSync(): Map<string, string> | null {
  return imageMap;
}

// Kick off background loading to reduce race conditions for callers that
// call `findImageForName` without awaiting `ensureImageMap()`.
// This is fire-and-forget and non-blocking.
void loadImageMap();

// Note: removed alias map usage — aliasesJson not referenced here to avoid
// runtime issues and keep lookups based solely on the available image files.

// keep backward-compatible heuristics below

export function findImageForName(name?: string): string | undefined {
  if (!name) return undefined;
  const normal = String(name)
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();

  // If the map isn't ready yet, return undefined (caller can await ensureImageMap())
  if (!imageMap) return undefined;

  // direct filename match
  if (imageMap.has(normal)) return imageMap.get(normal);

  // try token matches (words inside the name)
  const tokens = String(name)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map(t => t.replace(/[^a-z0-9]/g, ''))
    .filter(Boolean);

  for (const t of tokens) {
    if (imageMap.has(t)) return imageMap.get(t);
  }

  // try fuzzy contains
  for (const [k, v] of imageMap.entries()) {
    if (k.includes(normal) || normal.includes(k)) return v;
  }

  return undefined;
}

export default findImageForName;
