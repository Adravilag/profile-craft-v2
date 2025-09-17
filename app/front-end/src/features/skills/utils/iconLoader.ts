// ==========================================================
// Helpers genéricos para cargar JSON o texto (Node + Navegador)
// ==========================================================
export async function loadJson<T>(path: string): Promise<T> {
  if (typeof window !== 'undefined' && typeof fetch === 'function') {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Fetch error ${res.status} ${res.statusText}`);
    const contentType = res.headers.get('content-type') || '';
    // If server returns HTML (e.g. dev server index.html fallback), avoid parsing as JSON
    if (contentType.includes('html')) {
      const text = await res.text();
      // crude check: if it looks like an HTML document, throw to allow fallback
      if (/<!doctype html>|<html[\s>]/i.test(text)) {
        throw new Error('loadJson: response appears to be HTML, not JSON');
      }
      // otherwise try to parse text as JSON
      return JSON.parse(text) as T;
    }
    return (await res.json()) as T;
  }

  const { promises: fs } = await import('fs');
  const data = await fs.readFile(path, 'utf-8');
  return JSON.parse(data) as T;
}

async function loadText(path: string): Promise<string> {
  if (typeof window !== 'undefined' && typeof fetch === 'function') {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Fetch error ${res.status}`);
    const text = await res.text();
    // If the fetched text is actually an HTML document (dev server fallback), treat as failure
    if (/<!doctype html>|<html[\s>]/i.test(text)) {
      throw new Error('loadText: fetched content is HTML, not SVG/text');
    }
    return text;
  }
  const { promises: fs } = await import('fs');
  return await fs.readFile(path, 'utf-8');
}

// ==========================================================
// Tipos y utilidades
// ==========================================================
export interface SkillIconEntry {
  name: string;
  category?: string;
  svg: string; // ruta al archivo svg o nombre (no inline content)
  color?: string;
  slug?: string;
}

function normalizeKey(str: string): string {
  return str.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function isSvgPath(s: string): boolean {
  return /\.svg$/i.test(s);
}

// ==========================================================
// Estado interno y configuración de cache
// ==========================================================
let skillIconMap: Map<string, string> | null = null;
let skillIconEntries: SkillIconEntry[] | null = null;
let skillIconEntryMap: Map<string, SkillIconEntry> | null = null;
let loadingPromise: Promise<SkillIconEntry[]> | null = null;

let cacheTimestamp = 0;
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

// ==========================================================
// API principal
// ==========================================================

// Fuente por defecto para el JSON de icons (exportada para poder reutilizarla)
// Ruta pública (servida desde `public/` en el proyecto front-end). Esto evita
// que el fetch devuelva una página HTML del dev server cuando la ruta no existe.
// Apuntar al archivo que hemos copiado a `app/front-end/public/skill_settings.json`
export const SKILL_ICON_SOURCE = '/skill_settings.json';

/**
 * Carga las skills desde JSON y construye un mapa normalizado.
 * - Resuelve los SVG en texto si son rutas.
 * - Cachea los resultados en memoria con TTL.
 */
export async function loadSkillIconMap(
  source = SKILL_ICON_SOURCE,
  options?: { ttlMs?: number; resolveSvgFiles?: boolean }
): Promise<SkillIconEntry[]> {
  const ttl = options?.ttlMs ?? DEFAULT_TTL;
  // resolveSvgFiles deprecated: we no longer fetch/inline svg file contents. Keep flag for backward-compat.
  const resolveSvgFiles = options?.resolveSvgFiles ?? false;

  // Devolver cache si sigue siendo válida
  if (skillIconEntries && Date.now() - cacheTimestamp < ttl) return skillIconEntries;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      let entries: SkillIconEntry[] = [];
      try {
        entries = await loadJson<SkillIconEntry[]>(source);
      } catch (err: any) {
        // Puede que la ruta devuelva HTML (p. ej. 404 page) o contenido no JSON.
        // Intentar fallback a `public/skill_settings.json` (almacenado en la raíz `public/`)
        // eslint-disable-next-line no-console
        console.warn(
          `loadSkillIconMap: fallo cargando JSON desde ${source}: ${err?.message ?? err}`
        );
        try {
          entries = await loadJson<SkillIconEntry[]>('/skill_settings.json');
          // eslint-disable-next-line no-console
          console.info('loadSkillIconMap: cargado fallback desde /skill_settings.json');
        } catch (err2: any) {
          // eslint-disable-next-line no-console
          console.warn(
            `loadSkillIconMap: fallback /skill_settings.json falló: ${err2?.message ?? err2}`
          );
          entries = [];
        }
      }
      const map = new Map<string, string>();

      for (const entry of entries) {
        // Normalizar el valor del campo svg para que sea una ruta pública válida.
        // No intentamos cargar el archivo ni inyectar su contenido.
        const raw = (entry.svg || '').toString().trim();
        // If the JSON provides just a file name like 'react.svg', normalize to
        // the public path '/assets/svg/react.svg' so that consumers using
        // entry.svg_path get a URL that will actually resolve on the server.
        let normalized = isSvgPath(raw) ? raw.replace(/^\//, '') : raw; // keep relative like 'icons/react.svg' or 'react.svg'
        if (normalized && /^[a-z0-9\-_.]+\.svg$/i.test(normalized)) {
          // simple filename -> map to public assets folder
          normalized = `assets/svg/${normalized}`;
        }

        // Guardamos la ruta normalizada en entry.svg y entry.svg_path para compatibilidad
        // y asegurarnos de exponer la forma pública con leading slash (p.ej. '/assets/svg/react.svg').
        const withSlash = normalized && !normalized.startsWith('/') ? `/${normalized}` : normalized;
        try {
          // Preferimos que `entry.svg` contenga la ruta pública (leading slash)
          // para que los consumidores que lean `entry.svg` obtengan una URL resolvible
          // directamente por el navegador.
          entry.svg = withSlash;
          // `svg_path` es un campo de compatibilidad; asignarlo mediante cast
          // para evitar warnings de TS.
          (entry as any).svg_path = withSlash;
        } catch (e) {
          // ignore
        }

        // El mapa expone la ruta pública con leading slash para evitar que
        // consumidores tengan que concatenar o derivar la ruta desde el slug.
        map.set(normalizeKey(entry.name), withSlash);
        if (entry.slug) map.set(normalizeKey(entry.slug), withSlash);

        // Also keep a map from normalized key -> full entry so callers can
        // access fields like `svg` and `svg_path` directly.
        if (!skillIconEntryMap) skillIconEntryMap = new Map();
        skillIconEntryMap.set(normalizeKey(entry.name), entry);
        if (entry.slug) skillIconEntryMap.set(normalizeKey(entry.slug), entry);

        // Mapear aliases explícitos si están presentes en el JSON
        // (por ejemplo: "js" -> "javascript.svg")
        // Esto permite buscar por alias con findSkillIcon()
        try {
          const aliases = (entry as any).aliases;
          if (Array.isArray(aliases)) {
            for (const a of aliases) {
              if (a && typeof a === 'string') map.set(normalizeKey(a), normalized);
            }
          }
        } catch (e) {
          // ignore
        }

        // También indexar el nombre de fichero (sin extensión) para cubrir
        // búsquedas por baseName (p.ej. 'react' -> 'react.svg') o por el nombre
        // del propio archivo. Esto cubre casos donde el JSON usa 'react.svg'
        // como valor y el consumidor pasa sólo 'react' o viceversa.
        try {
          const baseName = normalized.replace(/\.svg$/i, '');
          if (baseName) {
            map.set(normalizeKey(baseName), withSlash);
            map.set(normalizeKey(normalized), withSlash);
            // index by base filename as well to allow reverse lookup to entry
            try {
              if (!skillIconEntryMap) skillIconEntryMap = new Map();
              const key = normalizeKey(baseName);
              skillIconEntryMap.set(key, entry);
            } catch (e) {
              // ignore
            }
          }
        } catch (e) {
          // ignore
        }
      }

      skillIconMap = map;
      skillIconEntries = entries;
      // keep entry map reference even if empty
      if (!skillIconEntryMap) skillIconEntryMap = new Map();
      cacheTimestamp = Date.now();
      return entries;
    } finally {
      loadingPromise = null;
    }
  })();

  return loadingPromise;
}

/**
 * Busca un icono de skill por nombre o slug.
 */
export function findSkillIcon(name: string): string | undefined {
  if (!skillIconMap) {
    void loadSkillIconMap(); // carga en background si aún no está lista
    return undefined;
  }
  return skillIconMap.get(normalizeKey(name));
}

/**
 * Devuelve la entrada completa del icono (según el JSON) o undefined si no existe.
 * Útil cuando el consumidor necesita campos como `svg` o `svg_path`.
 */
export function getSkillIconEntry(name: string): SkillIconEntry | undefined {
  if (!skillIconEntryMap) {
    // trigger background load if not ready yet
    void loadSkillIconMap();
    return undefined;
  }
  return skillIconEntryMap.get(normalizeKey(name));
}

/**
 * Obtener mapa de iconos cargados (o null si no se ha cargado aún).
 */
export function getIconMap(): Map<string, string> | null {
  return skillIconMap;
}

/**
 * Precarga explícita (útil en tests o para mejorar UX).
 */
export async function preloadSkillIconMap(
  source?: string,
  options?: { ttlMs?: number; resolveSvgFiles?: boolean }
): Promise<void> {
  await loadSkillIconMap(source ?? SKILL_ICON_SOURCE, options);
}

/**
 * Limpia la cache en memoria (útil en tests).
 */
export function clearSkillIconCache(): void {
  skillIconMap = null;
  skillIconEntries = null;
  cacheTimestamp = 0;
  loadingPromise = null;
}

/**
 * Devuelve snapshot de las entradas cargadas.
 */
export function getSkillIconEntries(): SkillIconEntry[] | null {
  return skillIconEntries;
}
