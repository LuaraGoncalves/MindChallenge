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
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
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
};
