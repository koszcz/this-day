import { expect, test } from 'bun:test';
import { newDriver, tick } from './drive';
import { count } from './items';
import { freshGame, keepDry, putProp } from './test-helpers';

const run = (g: ReturnType<typeof freshGame>, d: ReturnType<typeof newDriver>, n = 80) => {
  for (let i = 0; i < n && (d.errand || d.target || g.busy); i++) tick(g, d, 0.25);
};

function wall(g: ReturnType<typeof freshGame>) {
  for (let dy = -2; dy <= 2; dy += 0.5) putProp(g, 'tree', 1, dy);
}

test('a bush behind a wall of trees says why she cannot reach it', () => {
  const g = freshGame();
  keepDry(g);
  wall(g);
  putProp(g, 'bush', 3, 0);
  const d = newDriver();
  d.errand = { target: { kind: 'prop', id: g.props.length - 1 }, action: 'forage' };
  run(g, d);
  expect(g.log).toContain('You cannot reach the bush. The tree is in the way.');
  expect(d.errand).toBeNull();
  expect(d.target).toBeNull();
  expect(count(g.inventory, 'berries')).toBe(0);
});

test('she steps to a reachable spot first when one is near', () => {
  const g = freshGame();
  keepDry(g);
  putProp(g, 'tree', 1, 0);
  putProp(g, 'bush', 2, 0);
  const d = newDriver();
  d.errand = { target: { kind: 'prop', id: 1 }, action: 'forage' };
  run(g, d, 200);
  expect(count(g.inventory, 'berries')).toBeGreaterThan(0);
  expect(g.log.some((l) => l.startsWith('You cannot'))).toBe(false);
});

test('the message names a rock as a rock', () => {
  const g = freshGame();
  keepDry(g);
  for (let dy = -2; dy <= 2; dy += 0.5) putProp(g, 'stone', 1, dy);
  putProp(g, 'tree', 3, 0);
  const d = newDriver();
  d.errand = { target: { kind: 'prop', id: g.props.length - 1 }, action: 'chop' };
  run(g, d);
  expect(g.log).toContain('You cannot reach the tree. The rock is in the way.');
});

test('a plain walk into a wall says she cannot get there and stops', () => {
  const g = freshGame();
  keepDry(g);
  wall(g);
  const d = newDriver();
  d.target = { x: g.player.x + 3, y: g.player.y };
  run(g, d);
  expect(g.log).toContain('You cannot get to that spot. The tree is in the way.');
  expect(d.target).toBeNull();
});

test('a free walk says nothing', () => {
  const g = freshGame();
  keepDry(g);
  const d = newDriver();
  d.target = { x: g.player.x + 1, y: g.player.y };
  run(g, d);
  expect(g.log.some((l) => l.startsWith('You cannot'))).toBe(false);
});

test('she tries only one detour per errand', () => {
  const g = freshGame();
  keepDry(g);
  wall(g);
  putProp(g, 'bush', 3, 0);
  const d = newDriver();
  d.errand = { target: { kind: 'prop', id: g.props.length - 1 }, action: 'forage' };
  run(g, d);
  expect(g.log.filter((l) => l.startsWith('You cannot reach')).length).toBe(1);
});
