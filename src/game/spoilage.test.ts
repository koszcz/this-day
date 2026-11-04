import { expect, test } from 'bun:test';
import { availableActions, startAction } from './actions';
import { count } from './items';
import { ensureFood, hoursUntilRot, rottenCount } from './spoilage';
import type { GameState } from './state';
import { advance as step } from './step';
import { addStructure } from './structures';
import { freshGame, give, keepDry, putProp } from './test-helpers';

const HOUR = 60;

// Advances in hour steps and keeps you alive, so long waits do not end in death.
function advance(g: GameState, minutes: number) {
  for (let left = minutes; left > 0; left -= HOUR) {
    g.stats = { health: 100, hunger: 100, thirst: 100, energy: 100, warmth: 100 };
    step(g, Math.min(HOUR, left));
  }
}

function litFire() {
  const g = freshGame();
  keepDry(g);
  addStructure(g, 'fire', 2000);
  return g;
}

test('raw fish and berries rot after 6 game hours', () => {
  const g = freshGame();
  give(g, 'rawFish');
  give(g, 'berries');
  advance(g, 6 * HOUR - 5);
  expect(rottenCount(g, 'rawFish')).toBe(0);
  expect(rottenCount(g, 'berries')).toBe(0);
  advance(g, 5);
  expect(rottenCount(g, 'rawFish')).toBe(1);
  expect(rottenCount(g, 'berries')).toBe(1);
  expect(g.log.some((l) => l.includes('raw fish has rotted'))).toBe(true);
});

test('cooked fish lasts 24 game hours', () => {
  const g = freshGame();
  give(g, 'cookedFish');
  advance(g, 23 * HOUR);
  expect(rottenCount(g, 'cookedFish')).toBe(0);
  expect(hoursUntilRot(g, 'cookedFish')).toBe(1);
  advance(g, HOUR);
  expect(rottenCount(g, 'cookedFish')).toBe(1);
});

test('wood never rots', () => {
  const g = freshGame();
  give(g, 'wood');
  advance(g, 48 * HOUR);
  expect(rottenCount(g, 'wood')).toBe(0);
  expect(hoursUntilRot(g, 'wood')).toBeNull();
});

test('each unit ages from when you got it', () => {
  const g = freshGame();
  give(g, 'berries');
  advance(g, 4 * HOUR);
  give(g, 'berries');
  advance(g, 3 * HOUR);
  expect(rottenCount(g, 'berries')).toBe(1);
  expect(count(g.inventory, 'berries')).toBe(2);
  expect(hoursUntilRot(g, 'berries')).toBe(3);
});

test('hours until rot counts the oldest fresh unit, rounded up', () => {
  const g = freshGame();
  give(g, 'rawFish');
  advance(g, 4 * HOUR + 30);
  expect(hoursUntilRot(g, 'rawFish')).toBe(2);
});

test('eating rotten food always makes you sick', () => {
  const g = freshGame();
  give(g, 'berries');
  advance(g, 7 * HOUR);
  g.sick = 0;
  expect(startAction(g, 'eat:berries')).toBe(true);
  advance(g, 5);
  expect(g.sick).toBeGreaterThan(0);
  expect(g.log.some((l) => l.includes('rotten'))).toBe(true);
  expect(count(g.inventory, 'berries')).toBe(0);
});

test('you eat the freshest food first', () => {
  const g = freshGame();
  give(g, 'berries');
  advance(g, 7 * HOUR);
  give(g, 'berries');
  g.sick = 0;
  g.rng = 5;
  startAction(g, 'eat:berries');
  advance(g, 5);
  expect(g.sick).toBe(0);
  expect(count(g.inventory, 'berries')).toBe(1);
  expect(rottenCount(g, 'berries')).toBe(1);
});

test('you can throw rotten food away', () => {
  const g = freshGame();
  give(g, 'rawFish', 2);
  advance(g, 7 * HOUR);
  give(g, 'rawFish');
  expect(availableActions(g).map((a) => a.id)).toContain('discard:rawFish');
  startAction(g, 'discard:rawFish');
  advance(g, 5);
  expect(count(g.inventory, 'rawFish')).toBe(2);
  expect(rottenCount(g, 'rawFish')).toBe(1);
  startAction(g, 'discard:rawFish');
  advance(g, 5);
  expect(count(g.inventory, 'rawFish')).toBe(1);
  expect(rottenCount(g, 'rawFish')).toBe(0);
  expect(availableActions(g).map((a) => a.id)).not.toContain('discard:rawFish');
});

test('there is nothing to throw away while food is fresh', () => {
  const g = freshGame();
  give(g, 'rawFish');
  expect(availableActions(g).map((a) => a.id)).not.toContain('discard:rawFish');
});

test('cooking uses the oldest fish that has not rotted, and the result is fresh', () => {
  const g = litFire();
  give(g, 'rawFish');
  advance(g, 7 * HOUR);
  give(g, 'rawFish');
  advance(g, 2 * HOUR);
  startAction(g, 'cook');
  advance(g, 10);
  expect(count(g.inventory, 'cookedFish')).toBe(1);
  expect(count(g.inventory, 'rawFish')).toBe(1);
  expect(rottenCount(g, 'rawFish')).toBe(1);
  expect(rottenCount(g, 'cookedFish')).toBe(0);
});

test('rotten fish cannot be cooked', () => {
  const g = litFire();
  give(g, 'rawFish');
  advance(g, 7 * HOUR);
  const cook = availableActions(g).find((a) => a.id === 'cook');
  expect(cook?.blocked).toBe('fish has rotted');
  expect(startAction(g, 'cook')).toBe(false);
});

test('an old save without freshness data treats carried food as fresh', () => {
  const g = freshGame();
  give(g, 'berries');
  delete (g as { born?: unknown }).born;
  ensureFood(g);
  advance(g, 5);
  expect(rottenCount(g, 'berries')).toBe(0);
  expect(hoursUntilRot(g, 'berries')).toBe(6);
});

test('picked berries start fresh', () => {
  const g = freshGame();
  putProp(g, 'bush');
  startAction(g, 'forage');
  advance(g, 30);
  expect(count(g.inventory, 'berries')).toBeGreaterThan(0);
  expect(hoursUntilRot(g, 'berries')).toBe(6);
});
