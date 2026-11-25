import { apiBase } from './config';

export type AdminTheme = { id: string; name: string; active: boolean };
export type AdminCharacter = { id: string; themeId: string; name: string; imageUrl: string; active: boolean };
export type ThemeInput = Omit<AdminTheme, 'id'>;
export type CharacterInput = Omit<AdminCharacter, 'id'>;

let csrf: { token: string; headerName: string } | undefined;

export class AdminApiError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.method && options.method !== 'GET') {
    if (!csrf) {
      const response = await fetch(`${apiBase}/api/admin/csrf`, { credentials: 'include', cache: 'no-store' });
      if (!response.ok) throw new AdminApiError(response.status, 'Não foi possível preparar a sessão.');
      csrf = await response.json();
    }
    if (!csrf?.token || !csrf.headerName) throw new Error('Sessão inválida. Atualize a página.');
    headers.set(csrf.headerName, csrf.token);
    if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(`${apiBase}${path}`, { ...options, headers, credentials: 'include', cache: 'no-store' });
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) csrf = undefined;
    throw new AdminApiError(response.status, data.details?.[0] ?? data.message ?? data.error ?? 'Não foi possível concluir a operação.');
  }
  return data as T;
}

export const adminApi = {
  me: () => request<{ username: string }>('/api/admin/me'),
  async login(username: string, password: string) {
    await request('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ username, password }) });
    csrf = undefined;
    return this.me();
  },
  async logout() { await request('/api/admin/logout', { method: 'POST' }); csrf = undefined; },
  themes: () => request<AdminTheme[]>('/api/admin/themes'),
  characters: () => request<AdminCharacter[]>('/api/admin/characters'),
  saveTheme: (value: ThemeInput, id?: string) => request<AdminTheme>(`/api/admin/themes${id ? `/${id}` : ''}`, { method: id ? 'PUT' : 'POST', body: JSON.stringify(value) }),
  saveCharacter: (value: CharacterInput, id?: string) => request<AdminCharacter>(`/api/admin/characters${id ? `/${id}` : ''}`, { method: id ? 'PUT' : 'POST', body: JSON.stringify(value) }),
  deleteTheme: (id: string) => request<void>(`/api/admin/themes/${id}`, { method: 'DELETE' }),
  deleteCharacter: (id: string) => request<void>(`/api/admin/characters/${id}`, { method: 'DELETE' }),
  upload: (file: File) => { const body = new FormData(); body.append('file', file); return request<{ url: string }>('/api/admin/images', { method: 'POST', body }); },
};
