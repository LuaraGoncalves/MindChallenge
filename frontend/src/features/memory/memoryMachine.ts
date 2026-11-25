import { assign, setup } from 'xstate';
import type { MemoryCharacter } from '../../api/memoryCatalog';

export type MemoryCard = { key: string; character: MemoryCharacter };
type Context = {
  cards: MemoryCard[]; revealed: string[]; matched: string[];
  attempts: number; seconds: number; started: boolean;
};
type Event = { type: 'FLIP'; key: string } | { type: 'PAUSE' } | { type: 'RESUME' }
  | { type: 'TICK' } | { type: 'RESTART'; cards: MemoryCard[] };

function isPair(context: Context) {
  const [first, second] = context.revealed.map((key) => context.cards.find((card) => card.key === key));
  return !!first && !!second && first.character.id === second.character.id;
}

function initialContext(cards: MemoryCard[]): Context {
  return { cards, revealed: [], matched: [], attempts: 0, seconds: 0, started: false };
}

export const memoryMachine = setup({
  types: { context: {} as Context, events: {} as Event, input: {} as { cards: MemoryCard[] } },
  guards: {
    canFlip: ({ context, event }) => event.type === 'FLIP'
      && context.cards.some((card) => card.key === event.key)
      && !context.matched.includes(event.key) && !context.revealed.includes(event.key),
    isPair: ({ context }) => isPair(context),
    isLastPair: ({ context }) => isPair(context) && context.matched.length + 2 === context.cards.length,
  },
  actions: {
    revealFirst: assign(({ event }) => event.type === 'FLIP' ? { revealed: [event.key], started: true } : {}),
    revealSecond: assign(({ context, event }) => event.type === 'FLIP'
      ? { revealed: [...context.revealed, event.key], attempts: context.attempts + 1 } : {}),
    matchPair: assign(({ context }) => ({ matched: [...context.matched, ...context.revealed], revealed: [] })),
    hidePair: assign({ revealed: [] }),
    tick: assign(({ context }) => ({ seconds: context.seconds + (context.started ? 1 : 0) })),
    restart: assign(({ event, context }) => initialContext(event.type === 'RESTART' ? event.cards : context.cards)),
  },
}).createMachine({
  id: 'memory',
  context: ({ input }) => initialContext(input.cards),
  initial: 'playing',
  on: { RESTART: { target: '.playing.ready', actions: 'restart', reenter: true } },
  states: {
    playing: {
      initial: 'ready',
      on: { PAUSE: '#memory.paused', TICK: { actions: 'tick' } },
      states: {
        history: { type: 'history' },
        ready: { on: { FLIP: { guard: 'canFlip', target: 'first', actions: 'revealFirst' } } },
        first: { on: { FLIP: { guard: 'canFlip', target: 'checking', actions: 'revealSecond' } } },
        checking: { always: [
          { guard: 'isLastPair', target: '#memory.won', actions: 'matchPair' },
          { guard: 'isPair', target: 'ready', actions: 'matchPair' },
          { target: 'mismatch' },
        ] },
        mismatch: { after: { 1000: { target: 'ready', actions: 'hidePair' } } },
      },
    },
    paused: { on: { RESUME: 'playing.history' } },
    won: {},
  },
});

export function memoryScore(attempts: number, seconds: number, pairs: number) {
  return Math.max(100, pairs * 100 - Math.max(0, attempts - pairs) * 25 - seconds * 2);
}
