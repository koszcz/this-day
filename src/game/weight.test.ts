import { expect, test } from 'bun:test';
import { startAction } from './actions';
import { moveBy } from './movement';
import { advance } from './step';
import { freshGame, give, putProp } from './test-helpers';
import { MAX_LOAD, canCarry, carryLoad, encumbrance, speedPenalty } from './weight';

test('load adds up the weight of everything carried', () => {
  const g = freshGame();
  give(g, 'wood', 2);
  give(g, 'stone');
  expect(carryLoad(g.inventory)).toBe(10);
});

test('a light pack does not weigh you down', () => {
  const g = freshGame();
  give(g, 'wood', 3);
  expect(encumbrance(g.inventory)).toBe(0);
});

test('a full pack is fully encumbered', () => {
  const g = freshGame();
  give(g, 'stone', MAX_LOAD / 4);
  expect(encumbrance(g.inventory)).toBe(1);
});

test('canCarry stops at the limit', () => {
  const g = freshGame();
  give(g, 'stone', 9);
  expect(canCarry(g.inventory, 'stone')).toBe(true);
  give(g, 'stone');
  expect(canCarry(g.inventory, 'stone')).toBe(false);
  expect(canCarry(g.inventory, 'berries')).toBe(false);
});

test('a heavy load slows your walk', () => {
  const light = freshGame();
  const heavy = freshGame();
  give(heavy, 'stone', 10);
  const x = light.player.x;
  moveBy(light, 0.1, 0);
  moveBy(heavy, 0.1, 0);
  expect(heavy.player.x - x).toBeLessThan(light.player.x - x);
  expect(speedPenalty(heavy.inventory)).toBeLessThan(1);
});

test('a heavy load drains energy faster', () => {
  const light = freshGame();
  const heavy = freshGame();
  give(heavy, 'stone', 10);
  advance(light, 60);
  advance(heavy, 60);
  expect(heavy.stats.energy).toBeLessThan(light.stats.energy);
});

test('you cannot gather when the pack is full', () => {
  const g = freshGame();
  putProp(g, 'tree');
  give(g, 'stone', 10);
  expect(startAction(g, 'chop')).toBe(false);
});

test('gathering never pushes the load past the limit', () => {
  const g = freshGame();
  putProp(g, 'stone');
  give(g, 'stone', 9);
  startAction(g, 'mine');
  advance(g, 60);
  expect(carryLoad(g.inventory)).toBeLessThanOrEqual(MAX_LOAD);
});
