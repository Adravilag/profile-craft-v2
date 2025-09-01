// Utility to find an image in src/assets/img by a natural name (company/institution)
// Uses Vite's import.meta.glob eager to build a map at build time.

type ModulesMap = Record<string, any>;

const modules = import.meta.glob('/src/assets/img/*.{png,jpg,jpeg,svg}', {
  eager: true,
}) as ModulesMap;

const imageMap = new Map<string, string>();

for (const p in modules) {
  const file = p.split('/').pop()!;
  const name = file.replace(/\.[^/.]+$/, '');
  const norm = name.replace(/[^a-z0-9]/gi, '').toLowerCase();
  const url = (modules as any)[p].default ?? (modules as any)[p];
  imageMap.set(norm, url);
}

// Note: removed alias map usage — aliasesJson not referenced here to avoid
// runtime issues and keep lookups based solely on the available image files.

// keep backward-compatible heuristics below

export function findImageForName(name?: string): string | undefined {
  if (!name) return undefined;
  const normal = String(name)
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();

  // direct filename match
  if (imageMap.has(normal)) return imageMap.get(normal);

  // alias match: removed — no external alias map available, fallthrough to tokens

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

  // alias fuzzy-match removed — only image filenames are considered now

  return undefined;
}

export default findImageForName;
