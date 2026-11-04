import { expect, test } from 'bun:test';
import { hypot } from '../math/exact';
import { newDriver, tick } from './drive';
import { freshGame, keepDry, putProp } from './test-helpers';
import { isWedged, unstick } from './unstick';

test('a survivor in open ground is not wedged', () => {
  const g = freshGame();
  expect(isWedged(g)).toBe(false);
  expect(unstick(g)).toBe(false);
  expect(g.log.length).toBe(1);
});

test('a survivor inside a bush is wedged', () => {
  const g = freshGame();
  putProp(g, 'bush', 0.1, 0);
  expect(isWedged(g)).toBe(true);
});

test('a survivor against a tree is not wedged until she is inside it', () => {
  const g = freshGame();
  putProp(g, 'tree', 0.5, 0);
  expect(isWedged(g)).toBe(false);
});

test('unstick says so and steps her to a free spot', () => {
  const g = freshGame();
  putProp(g, 'tree', 0.1, 0);
  const tree = g.props[0];
  expect(unstick(g)).toBe(true);
  expect(isWedged(g)).toBe(false);
  expect(hypot(tree.x - g.player.x, tree.y - g.player.y)).toBeGreaterThanOrEqual(0.38);
  expect(g.log[g.log.length - 1]).toBe('You are wedged against the tree. You step free.');
});

test('the message names the rock', () => {
  const g = freshGame();
  putProp(g, 'stone', 0.1, 0.1);
  unstick(g);
  expect(g.log[g.log.length - 1]).toBe('You are wedged against the rock. You step free.');
});

test('she steps to the nearest free spot, not far away', () => {
  const g = freshGame();
  const { x, y } = g.player;
  putProp(g, 'bush', 0.1, 0);
  unstick(g);
  expect(hypot(g.player.x - x, g.player.y - y)).toBeLessThan(0.8);
});

test('she skips spots blocked by other props', () => {
  const g = freshGame();
  putProp(g, 'tree', 0.1, 0);
  putProp(g, 'tree', -0.4, 0);
  putProp(g, 'tree', 0, 0.4);
  putProp(g, 'tree', 0, -0.4);
  expect(unstick(g)).toBe(true);
  expect(isWedged(g)).toBe(false);
});

test('a depleted tree no longer wedges her', () => {
  const g = freshGame();
  putProp(g, 'tree', 0.1, 0, 0);
  expect(isWedged(g)).toBe(false);
});

test('tick frees a wedged survivor', () => {
  const g = freshGame();
  keepDry(g);
  putProp(g, 'bush', 0.1, 0);
  tick(g, newDriver(), 0.1);
  expect(isWedged(g)).toBe(false);
  expect(g.log).toContain('You are wedged against the bush. You step free.');
});

test('tick does not free a sleeping survivor', () => {
  const g = freshGame();
  keepDry(g);
  putProp(g, 'bush', 0.1, 0);
  g.sleeping = true;
  tick(g, newDriver(), 0.1);
  expect(isWedged(g)).toBe(true);
});
