import { expect, test } from 'bun:test';
import { availableActions, startAction } from './actions';
import type { Animal } from './animals';
import { CLOSE_HIT, FAR_HIT, HUNT_RANGE, hitChance } from './hunting';
import { errandStep, menuFor } from './interact';
import { count } from './items';
import { roll } from './random';
import type { GameState } from './state';
import { advance } from './step';
import { addStructure } from './structures';
import { freshGame, give, keepDry } from './test-helpers';
import { usesLeft } from './wear';

function animal(g: GameState, kind: Animal['kind'], dx: number, dy = 0): Animal {
  g.world.kind.fill('grass');
  const a: Animal = { id: g.animals.length, kind, x: g.player.x + dx, y: g.player.y + dy, tx: null, ty: null, rest: 100 };
  g.animals.push(a);
  return a;
}

// Picks a dice state whose next rolls fit the wanted ranges, so the test does not depend on luck.
function setDice(g: GameState, wanted: Array<(r: number) => boolean>) {
  for (let seed = 1; seed < 100000; seed++) {
    const probe = { rng: seed } as GameState;
    if (wanted.every((ok) => ok(roll(probe)))) {
      g.rng = seed;
      return;
    }
  }
  throw new Error('no dice found');
}
const low = (r: number) => r < 0.3;
const high = (r: number) => r >= 0.8;

test('a throw is easier up close', () => {
  expect(hitChance(2)).toBe(CLOSE_HIT);
  expect(hitChance(5)).toBe(FAR_HIT);
});

test('hunting needs a spear and an animal in range', () => {
  const g = freshGame();
  animal(g, 'hare', 4);
  expect(availableActions(g).map((a) => a.id)).not.toContain('hunt:0');
  give(g, 'spear');
  expect(availableActions(g).map((a) => a.id)).toContain('hunt:0');
  g.animals[0].x = g.player.x + HUNT_RANGE + 1;
  expect(availableActions(g).map((a) => a.id)).not.toContain('hunt:0');
});

test('a hit kills a hare and drops one raw meat', () => {
  const g = freshGame();
  give(g, 'spear');
  animal(g, 'hare', 2);
  setDice(g, [low]);
  expect(startAction(g, 'hunt:0')).toBe(true);
  expect(g.animals).toEqual([]);
  expect(count(g.inventory, 'rawMeat')).toBe(1);
  expect(usesLeft(g, 'spear')).toBe(11);
});

test('a deer drops three raw meat', () => {
  const g = freshGame();
  give(g, 'spear');
  animal(g, 'deer', 2);
  setDice(g, [low, high]);
  startAction(g, 'hunt:0');
  expect(count(g.inventory, 'rawMeat')).toBe(3);
  expect(g.wound).toBeNull();
});

test('a deer can wound you as it dies', () => {
  const g = freshGame();
  give(g, 'spear');
  animal(g, 'deer', 2);
  setDice(g, [low, (r) => r < 0.1]);
  startAction(g, 'hunt:0');
  expect(g.wound).not.toBeNull();
});

test('a miss keeps the animal and still wears the spear', () => {
  const g = freshGame();
  give(g, 'spear');
  animal(g, 'hare', 2);
  setDice(g, [high]);
  startAction(g, 'hunt:0');
  expect(g.animals.length).toBe(1);
  expect(count(g.inventory, 'rawMeat')).toBe(0);
  expect(usesLeft(g, 'spear')).toBe(11);
  expect(g.log.at(-1)).toBe('You throw the spear and miss the hare.');
});

test('a far throw misses where a close throw would hit', () => {
  const g = freshGame();
  give(g, 'spear');
  animal(g, 'hare', 5);
  setDice(g, [(r) => r >= FAR_HIT && r < CLOSE_HIT]);
  startAction(g, 'hunt:0');
  expect(g.animals.length).toBe(1);
});

test('a nearly full pack takes only the meat it can carry', () => {
  const g = freshGame();
  give(g, 'spear');
  give(g, 'stone', 7);
  give(g, 'wood');
  animal(g, 'deer', 2);
  setDice(g, [low, high]);
  startAction(g, 'hunt:0');
  expect(g.animals).toEqual([]);
  expect(count(g.inventory, 'rawMeat')).toBe(2);
});

test('the last use breaks the spear on a hunt', () => {
  const g = freshGame();
  give(g, 'spear');
  g.toolUses.spear = 1;
  animal(g, 'hare', 2);
  setDice(g, [low]);
  startAction(g, 'hunt:0');
  expect(count(g.inventory, 'spear')).toBe(0);
  expect(count(g.inventory, 'rawMeat')).toBe(1);
});

test('raw meat is cooked at a lit fire into cooked meat', () => {
  const g = freshGame();
  keepDry(g);
  give(g, 'rawMeat');
  expect(availableActions(g).map((a) => a.id)).not.toContain('cookMeat');
  addStructure(g, 'fire', 100);
  startAction(g, 'cookMeat');
  advance(g, 20);
  expect(count(g.inventory, 'cookedMeat')).toBe(1);
  expect(count(g.inventory, 'rawMeat')).toBe(0);
});

test('raw meat rots after 6 hours and cooked meat after 24', () => {
  const g = freshGame();
  keepDry(g);
  give(g, 'rawMeat');
  give(g, 'cookedMeat');
  advance(g, 361);
  const ids = availableActions(g).map((a) => a.id);
  expect(ids).toContain('discard:rawMeat');
  expect(ids).not.toContain('discard:cookedMeat');
});

test('eating cooked meat feeds you and never makes you sick', () => {
  const g = freshGame();
  give(g, 'cookedMeat');
  g.stats.hunger = 20;
  startAction(g, 'eat:cookedMeat');
  advance(g, 2);
  expect(count(g.inventory, 'cookedMeat')).toBe(0);
  // Hunger drains a little while you eat, so the exact value depends on the needs rules.
  expect(g.stats.hunger).toBeGreaterThan(70);
  expect(g.sick).toBe(0);
});

test('the animal menu offers Hunt, blocked without a spear', () => {
  const g = freshGame();
  animal(g, 'deer', 3);
  expect(menuFor(g, { kind: 'animal', id: 0 }).map((e) => [e.id, e.label, e.blocked])).toEqual([['hunt:0', 'Hunt deer', 'needs spear']]);
  give(g, 'spear');
  expect(menuFor(g, { kind: 'animal', id: 0 })[0].blocked).toBeUndefined();
});

test('a hunt errand walks to the animal until it is in range', () => {
  const g = freshGame();
  const a = animal(g, 'hare', 10);
  const errand = { target: { kind: 'animal', id: 0 }, action: 'hunt:0' } as const;
  expect(errandStep(g, errand)).toEqual({ kind: 'walk', x: a.x, y: a.y });
  g.player.x += 5;
  expect(errandStep(g, errand)).toEqual({ kind: 'arrive' });
  g.animals = [];
  expect(errandStep(g, errand)).toEqual({ kind: 'gone' });
});
