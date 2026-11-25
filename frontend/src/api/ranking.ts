import { apiBase } from './config';

export type RankingEntry = {
  id: string;
  playerName: string;
  gameSlug: string;
  score: number;
  createdAt: string;
};

const GAME_SLUG = 'memory-kids';
const LOCAL_KEY = 'mindchallenge:memory-scores:v1';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.method && init.method !== 'GET') {
    const csrfResponse = await fetch(`${apiBase}/api/admin/csrf`, { credentials: 'include', cache: 'no-store' });
    if (!csrfResponse.ok) throw new Error('Não foi possível preparar a sessão segura.');
    const csrf = await csrfResponse.json() as { token: string; headerName: string };
    headers.set(csrf.headerName, csrf.token);
  }
  if (init?.body) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Não foi possível acessar o placar online agora.');
  return response.json() as Promise<T>;
}

export function saveLocalScore(entry: Omit<RankingEntry, 'id' | 'createdAt'>) {
  try {
    const previous = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]') as RankingEntry[];
    const history = [{ ...entry, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...previous]
      .sort((a, b) => b.score - a.score || a.createdAt.localeCompare(b.createdAt)).slice(0, 20);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(history));
  } catch { /* O placar online continua disponível se o armazenamento local estiver bloqueado. */ }
}

export const rankingApi = {
  submit: (playerName: string, score: number) => request<RankingEntry>('/api/rankings', {
    method: 'POST', body: JSON.stringify({ playerName, gameSlug: GAME_SLUG, score }),
  }),
  top: () => request<RankingEntry[]>(`/api/rankings/${GAME_SLUG}`),
  me: () => request<{ username: string }>('/api/auth/me'),
  login: (username: string, password: string) => request<{ username: string }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (username: string, password: string) => request<{ username: string }>('/api/auth/register', { method: 'POST', body: JSON.stringify({ username, password }) }),
};
