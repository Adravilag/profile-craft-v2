export function getImageUrl(name: string) {
  return `/assets/${name}`;
}

/**
 * Build a Cloudinary URL with basic optimizations.
 * It inserts `f_auto,q_auto,w_{width}` after the `/upload/` segment.
 */
export type CloudinaryOptions = {
  width?: number | 'auto';
  crop?: string; // e.g. 'fill'
  gravity?: string; // e.g. 'face'
  quality?: string; // e.g. 'auto'
  format?: string; // e.g. 'auto'
};

export function buildCloudinaryUrl(baseUrl: string, opts: CloudinaryOptions = {}) {
  if (!baseUrl) return baseUrl;
  try {
    const { width, crop, gravity, quality = 'auto', format = 'auto' } = opts;
    const parts = [`f_${format}`, `q_${quality}`];
    if (width) parts.push(`w_${width}`);
    if (crop) parts.push(`c_${crop}`);
    if (gravity) parts.push(`g_${gravity}`);
    const transform = parts.join(',');
    return baseUrl.replace('/upload/', `/upload/${transform}/`);
  } catch (e) {
    return baseUrl;
  }
}

/**
 * Return a srcset string for provided widths using given options.
 */
export function getCloudinarySrcSet(
  baseUrl: string,
  widths: number[] = [120, 200, 400, 800],
  opts: Partial<CloudinaryOptions> = {}
) {
  if (!baseUrl) return '';
  return widths.map(w => `${buildCloudinaryUrl(baseUrl, { ...opts, width: w })} ${w}w`).join(', ');
}

export default { getImageUrl, buildCloudinaryUrl, getCloudinarySrcSet };
