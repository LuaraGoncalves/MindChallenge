import { apiBase, imageUrl } from './config';
import { preloadImage } from './pokemon';

export type MemoryTheme = { id: string; name: string; characterCount: number };
export type MemoryCharacter = { id: string | number; name: string; image: string };

export async function getMemoryThemes(signal: AbortSignal): Promise<MemoryTheme[]> {
  const response = await fetch(`${apiBase}/api/memory/themes`, { signal, cache: 'no-store' });
  if (!response.ok) throw new Error('Não foi possível carregar as coleções.');
  return response.json();
}

export async function getCatalogCharacters(theme: string, count: number, signal: AbortSignal): Promise<MemoryCharacter[]> {
  const response = await fetch(`${apiBase}/api/memory/themes/${encodeURIComponent(theme)}/characters?count=${count}`, { signal, cache: 'no-store' });
  if (!response.ok) throw new Error('Esta coleção não está disponível para a partida.');
  const data: MemoryCharacter[] = await response.json();
  if (!Array.isArray(data) || data.length !== count || data.some(character => !character.id || !character.name || !character.image)) throw new Error('Coleção inválida.');
  return Promise.all(data.map(async character => {
    const image = imageUrl(character.image);
    await preloadImage(image, signal);
    return { ...character, image };
  }));
}
