export const apiBase = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
export function imageUrl(url: string) { return url.startsWith('/api/media/') ? `${apiBase}${url}` : url; }
