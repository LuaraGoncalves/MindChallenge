import test from 'node:test';
import assert from 'node:assert/strict';
import { createActor, SimulatedClock } from 'xstate';
import { memoryMachine, memoryScore } from '../src/features/memory/memoryMachine.ts';

const cards = [1, 2].flatMap(id => ['a', 'b'].map(copy => ({
  key: `${id}-${copy}`, character: { id, name: `pokemon-${id}`, image: 'https://example.test/image.png' },
})));

function game() {
  const clock = new SimulatedClock();
  const actor = createActor(memoryMachine, { input: { cards }, clock }).start();
  const flip = key => actor.send({ type: 'FLIP', key });
  return { actor, clock, flip };
}

test('rejects duplicate/unknown clicks and locks a third card during a mismatch', () => {
  const { actor, clock, flip } = game();
  flip('missing');
  assert.deepEqual(actor.getSnapshot().context.revealed, []);
  flip('1-a'); flip('1-a');
  assert.equal(actor.getSnapshot().context.attempts, 0);
  flip('2-a'); flip('1-b');
  assert.deepEqual(actor.getSnapshot().context.revealed, ['1-a', '2-a']);
  assert.equal(actor.getSnapshot().context.attempts, 1);
  clock.increment(1000);
  assert.deepEqual(actor.getSnapshot().context.revealed, []);
  actor.stop();
});

test('keeps matched cards, counts attempts, and finishes after the last pair', () => {
  const { actor, flip } = game();
  flip('1-a'); flip('1-b');
  assert.equal(actor.getSnapshot().context.matched.length, 2);
  flip('1-a');
  assert.deepEqual(actor.getSnapshot().context.revealed, []);
  flip('2-b'); flip('2-a');
  assert.ok(actor.getSnapshot().matches('won'));
  assert.equal(actor.getSnapshot().context.attempts, 2);
  actor.send({ type: 'TICK' });
  assert.equal(actor.getSnapshot().context.seconds, 0);
  actor.stop();
});

test('pause preserves the turn and stops mismatched-card timeout and clock', () => {
  const { actor, clock, flip } = game();
  actor.send({ type: 'TICK' });
  assert.equal(actor.getSnapshot().context.seconds, 0);
  flip('1-a'); flip('2-a');
  actor.send({ type: 'TICK' });
  actor.send({ type: 'PAUSE' });
  actor.send({ type: 'TICK' }); flip('1-b'); clock.increment(5000);
  assert.equal(actor.getSnapshot().context.seconds, 1);
  assert.equal(actor.getSnapshot().context.revealed.length, 2);
  actor.send({ type: 'RESUME' });
  assert.ok(actor.getSnapshot().matches({ playing: 'mismatch' }));
  clock.increment(1000);
  assert.equal(actor.getSnapshot().context.revealed.length, 0);
  actor.stop();
});

test('restart cancels the previous turn and resets progress from paused or completed games', () => {
  const { actor, clock, flip } = game();
  flip('1-a'); flip('2-a');
  actor.send({ type: 'PAUSE' });
  actor.send({ type: 'RESTART', cards: [...cards].reverse() });
  clock.increment(3000);
  assert.ok(actor.getSnapshot().matches({ playing: 'ready' }));
  assert.equal(actor.getSnapshot().context.attempts, 0);
  assert.equal(actor.getSnapshot().context.started, false);
  flip('1-a'); flip('1-b'); flip('2-a'); flip('2-b');
  actor.send({ type: 'RESTART', cards });
  assert.equal(actor.getSnapshot().context.matched.length, 0);
  actor.stop();
});

test('score rewards fewer attempts and shorter time and stays positive', () => {
  assert.ok(memoryScore(8, 20, 8) > memoryScore(20, 200, 8));
  assert.equal(memoryScore(1000, 10000, 8), 100);
});
