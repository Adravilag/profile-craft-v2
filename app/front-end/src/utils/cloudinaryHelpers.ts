export function isCloudinaryUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    return url.includes('res.cloudinary.com') || url.includes('cloudinary.com/');
  } catch (e) {
    return false;
  }
}

export function isBlobUrl(url?: string | null): boolean {
  if (!url) return false;
  return url.startsWith('blob:');
}

// Extrae el public_id de una URL de Cloudinary estándar (no exhaustive)
export function extractPublicIdFromUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    // Una URL típica: https://res.cloudinary.com/<cloud>/image/upload/v1234567890/folder/subfolder/public_id.jpg
    const parts = url.split('/');
    const uploadIndex = parts.findIndex(p => p === 'upload');
    if (uploadIndex === -1) return null;
    const publicParts = parts.slice(uploadIndex + 1);
    // Quitar versión si existe (v123...)
    if (publicParts[0]?.startsWith('v') && /v\d+/.test(publicParts[0])) {
      publicParts.shift();
    }
    const last = publicParts.join('/');
    // quitar querystring
    const clean = last.split('?')[0];
    // quitar extensión
    const withoutExt = clean.replace(/\.[a-zA-Z0-9]+$/, '');
    return withoutExt || null;
  } catch (e) {
    return null;
  }
}

export default { isCloudinaryUrl, isBlobUrl, extractPublicIdFromUrl };
