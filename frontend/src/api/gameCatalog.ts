export type Challenge = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  skill: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  estimatedMinutes: number;
};

export type ChallengeGroup = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  audience: string;
  games: Challenge[];
};

export type ExtraMode = {
  slug: string;
  title: string;
  tag: string;
  icon: string;
  description: string;
  features: string[];
};

export type GameCatalog = {
  groups: ChallengeGroup[];
  extras: ExtraMode[];
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`);

  if (!response.ok) {
    throw new Error(`Falha ao carregar ${path}`);
  }

  return response.json() as Promise<T>;
}

export async function getGameCatalog(): Promise<GameCatalog> {
  const [groups, extras] = await Promise.all([
    getJson<ChallengeGroup[]>('/api/games/groups'),
    getJson<ExtraMode[]>('/api/games/extras'),
  ]);

  return { groups, extras };
}
