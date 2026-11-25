export type PokemonCharacter = { id: number; name: string; image: string };

const cache = new Map<number, PokemonCharacter>();

function isCharacter(value: unknown): value is PokemonCharacter {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<PokemonCharacter>;
  return Number.isInteger(item.id) && typeof item.name === 'string' && typeof item.image === 'string'
    && item.image.startsWith('https://raw.githubusercontent.com/PokeAPI/sprites/');
}

async function getCharacter(id: number, signal: AbortSignal): Promise<PokemonCharacter> {
  let cached = cache.get(id);
  if (!cached) {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(`mindchallenge:pokemon:v1:${id}`) ?? 'null');
      if (isCharacter(stored) && stored.id === id) cached = stored;
    } catch { /* Storage may be unavailable in private browsing. */ }
  }
  if (cached) return cached;

  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(12000)]),
  });
  if (!response.ok) throw new Error('Não foi possível buscar os personagens.');
  const data = await response.json();
  const character = {
    id: data.id,
    name: data.name,
    image: data.sprites?.other?.['official-artwork']?.front_default ?? data.sprites?.front_default,
  };
  if (!isCharacter(character) || character.id !== id) throw new Error('Personagem indisponível.');
  cache.set(id, character);
  try { localStorage.setItem(`mindchallenge:pokemon:v1:${id}`, JSON.stringify(character)); } catch { /* Memory cache remains available. */ }
  return character;
}

export function preloadImage(url: string, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const timeout = window.setTimeout(() => finish(new Error('A imagem demorou para carregar.')), 12000);
    const onAbort = () => finish(new DOMException('Aborted', 'AbortError'));
    function finish(error?: Error) {
      window.clearTimeout(timeout);
      signal.removeEventListener('abort', onAbort);
      image.onload = null;
      image.onerror = null;
      if (error) { image.src = ''; reject(error); } else resolve();
    }
    if (signal.aborted) { onAbort(); return; }
    signal.addEventListener('abort', onAbort, { once: true });
    image.onload = () => finish();
    image.onerror = () => finish(new Error('Não foi possível carregar as imagens.'));
    image.src = url;
  });
}

export async function getMemoryCharacters(count: number, signal: AbortSignal): Promise<PokemonCharacter[]> {
  if (![6, 8, 12].includes(count)) throw new Error('Quantidade de pares inválida.');
  const ids = new Set<number>();
  while (ids.size < count) ids.add(1 + crypto.getRandomValues(new Uint32Array(1))[0] % 151);
  const characters: PokemonCharacter[] = [];
  // Small batches avoid flooding the public API with simultaneous requests.
  const selected = [...ids];
  for (let index = 0; index < selected.length; index += 4) {
    signal.throwIfAborted();
    const batch = await Promise.all(selected.slice(index, index + 4).map(async (id) => {
      const character = await getCharacter(id, signal);
      await preloadImage(character.image, signal);
      return character;
    }));
    characters.push(...batch);
  }
  return characters;
}
