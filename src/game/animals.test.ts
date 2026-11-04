import { expect, test } from 'bun:test';
import { hypot } from '../math/exact';
import { isWalkable } from '../world/query';
import { ensureAnimals, SPECS, spawnAnimals, tickAnimals, type Animal } from './animals';
import { pickObject } from './hover';
import { menuFor } from './interact';
import { newGame } from './state';
import { advance } from './step';
import { freshGame, putProp } from './test-helpers';

// Adds an animal. The whole island becomes grass, so the shore never gets in the way.
function animal(g: ReturnType<typeof freshGame>, kind: Animal['kind'], dx: number, dy: number, rest = 0): Animal {
  g.world.kind.fill('grass');
  const a: Animal = { id: g.animals.length, kind, x: g.player.x + dx, y: g.player.y + dy, tx: null, ty: null, rest };
  g.animals.push(a);
  return a;
}

test('a new island has 6 deer and 8 hares on dry land away from you', () => {
  const g = newGame(7);
  expect(g.animals.filter((a) => a.kind === 'deer').length).toBe(SPECS.deer.count);
  expect(g.animals.filter((a) => a.kind === 'hare').length).toBe(SPECS.hare.count);
  for (const a of g.animals) {
    expect(isWalkable(g.world, a.x, a.y)).toBe(true);
    expect(hypot(a.x - g.player.x, a.y - g.player.y) >= 8).toBe(true);
  }
});

test('the same seed gives the same herd', () => {
  expect(newGame(7).animals).toEqual(newGame(7).animals);
});

test('a hare near you runs away', () => {
  const g = freshGame();
  const a = animal(g, 'hare', 3, 0);
  const before = hypot(a.x - g.player.x, a.y - g.player.y);
  tickAnimals(g, 2);
  expect(hypot(a.x - g.player.x, a.y - g.player.y) > before + 2).toBe(true);
});

test('a deer far from you does not flee', () => {
  const g = freshGame();
  const a = animal(g, 'deer', 12, 0, 100);
  tickAnimals(g, 5);
  expect(a.x).toBe(g.player.x + 12);
  expect(a.y).toBe(g.player.y);
});

test('a resting animal waits, then walks to a new spot', () => {
  const g = freshGame();
  const a = animal(g, 'deer', 12, 0, 3);
  tickAnimals(g, 2);
  expect(a.tx).toBeNull();
  tickAnimals(g, 3);
  advance(g, 1);
  expect(a.tx !== null || a.rest > 0).toBe(true);
});

test('a wandering animal keeps to dry land over a long time', () => {
  const g = newGame(3);
  g.player.x = g.world.start.x;
  advance(g, 600);
  for (const a of g.animals) expect(isWalkable(g.world, a.x, a.y)).toBe(true);
});

test('wandering is the same on every run with one seed', () => {
  const run = () => {
    const g = newGame(11);
    advance(g, 300);
    return g.animals.map((a) => [a.x, a.y]);
  };
  expect(run()).toEqual(run());
});

test('a fleeing animal turns when a tree blocks its way', () => {
  const g = freshGame();
  const a = animal(g, 'hare', 2, 0);
  putProp(g, 'tree', 3.3, 0);
  tickAnimals(g, 0.5);
  expect(a.x > g.player.x + 2).toBe(true);
  expect(a.y).not.toBe(g.player.y);
  expect(hypot(a.x - g.props[0].x, a.y - g.props[0].y) >= 0.4).toBe(true);
});

test('an animal cornered by blocks stays put', () => {
  const g = freshGame();
  const a = animal(g, 'hare', 2, 0);
  for (const [dx, dy] of [[3, 0], [2.5, 1.5], [2.5, -1.5], [1.5, 2], [1.5, -2]]) putProp(g, 'stone', dx, dy);
  const x = a.x;
  tickAnimals(g, 0.5);
  expect(a.x).toBeGreaterThanOrEqual(x);
});

test('the mouse over an animal picks it', () => {
  const g = freshGame();
  const a = animal(g, 'deer', 3, 0);
  expect(pickObject(g, a.x + 0.1, a.y)).toEqual({ kind: 'animal', id: a.id });
});

test('clicking an animal offers no actions yet', () => {
  const g = freshGame();
  animal(g, 'deer', 3, 0);
  expect(menuFor(g, { kind: 'animal', id: 0 })).toEqual([]);
});

test('an old save without animals gets a herd', () => {
  const g = newGame(5);
  delete (g as Partial<typeof g>).animals;
  ensureAnimals(g);
  expect(g.animals).toEqual(spawnAnimals(g));
});

test('a save that has animals keeps them', () => {
  const g = freshGame();
  animal(g, 'hare', 5, 5);
  ensureAnimals(g);
  expect(g.animals.length).toBe(1);
});
