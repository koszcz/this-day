import { expect, test } from 'bun:test';
import { advance } from './step';
import { crossedThirstHint, nearestWater, pointToWater, screenDirection } from './water-hint';
import { freshGame, keepDry } from './test-helpers';
import type { TileKind } from '../world/types';

// A game on a small grass map with one water tile at (tx, ty), and the player at the middle.
function islandWithWater(tx: number, ty: number) {
  const g = freshGame();
  const size = 40;
  g.world = { ...g.world, size, kind: new Array<TileKind>(size * size).fill('grass'), elevation: new Array(size * size).fill(0.2) } as typeof g.world;
  g.world.kind[ty * size + tx] = 'shallow';
  g.player.x = 20.5;
  g.player.y = 20.5;
  return g;
}

test('screen directions follow the isometric camera', () => {
  expect(screenDirection(-5, -5)).toBe('up');
  expect(screenDirection(5, 5)).toBe('down');
  expect(screenDirection(5, -5)).toBe('right');
  expect(screenDirection(-5, 5)).toBe('left');
  expect(screenDirection(0, -5)).toBe('up and to the right');
  expect(screenDirection(-5, 0)).toBe('up and to the left');
  expect(screenDirection(5, 0)).toBe('down and to the right');
  expect(screenDirection(0, 5)).toBe('down and to the left');
});

test('nearest water is the closest water tile', () => {
  const g = islandWithWater(30, 20);
  expect(nearestWater(g)).toEqual({ dx: 10, dy: 0 });
});

test('a map without water gives no nearest water', () => {
  const g = islandWithWater(30, 20);
  g.world.kind[20 * 40 + 30] = 'grass';
  expect(nearestWater(g)).toBeNull();
  pointToWater(g);
  expect(g.log.length).toBe(1);
});

test('the hint fires only when thirst falls through 30 or 10', () => {
  expect(crossedThirstHint(31, 29)).toBe(true);
  expect(crossedThirstHint(12, 9)).toBe(true);
  expect(crossedThirstHint(29, 28)).toBe(false);
  expect(crossedThirstHint(60, 59)).toBe(false);
});

test('a message names the direction and distance when thirst gets low', () => {
  const g = islandWithWater(30, 20);
  keepDry(g);
  g.stats.thirst = 30.1;
  advance(g, 5);
  expect(g.log[g.log.length - 1]).toBe('You are thirsty. Water lies down and to the right, about 10 steps away.');
});

test('the message says when water is beside you', () => {
  const g = islandWithWater(21, 20);
  pointToWater(g);
  expect(g.log[g.log.length - 1]).toBe('You are thirsty. Water is right beside you.');
});

test('no message while thirst stays above the level', () => {
  const g = islandWithWater(30, 20);
  keepDry(g);
  g.stats.thirst = 60;
  advance(g, 5);
  expect(g.log.length).toBe(1);
});
