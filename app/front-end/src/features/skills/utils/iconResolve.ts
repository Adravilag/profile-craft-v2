// Utilities to resolve SVG asset module URLs from /src/assets/svg using Vite's import.meta.glob
// Provides small helpers used by components to lazily resolve hashed asset URLs.

import iconMap from './iconMap';

export async function getIconUrl(name: string): Promise<string | null> {
  return iconMap.getIconUrlFromMap(name);
}

export async function resolveIconCandidates(candidates: string[]): Promise<string | null> {
  return iconMap.resolveIconCandidatesFromMap(candidates);
}
