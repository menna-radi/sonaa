/**
 * Resolves media/image URLs to full accessible URLs.
 * Handles blob previews, data URIs, absolute HTTP/HTTPS, and relative paths.
 */
export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }
  const clean = url.startsWith('/') ? url : `/${url}`;
  return `https://api.arox.digital${clean}`;
}
