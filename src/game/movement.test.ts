import { expect, test } from 'bun:test';
import { moveBy } from './movement';
import { freshGame, putProp } from './test-helpers';

test('you cannot walk into deep water', () => {
  const g = freshGame();
  g.player.x = 0.5;
  g.player.y = 0.5;
  moveBy(g, -0.5, -0.5);
  expect(g.player.x).toBeGreaterThanOrEqual(0);
});

test('trees block the way', () => {
  const g = freshGame();
  putProp(g, 'tree', 0.5, 0);
  const x = g.player.x;
  moveBy(g, 0.3, 0);
  expect(g.player.x).toBe(x);
});

test('you stand still while busy', () => {
  const g = freshGame();
  g.busy = { id: 'x', label: 'x', total: 10, remaining: 10, energy: 0 };
  const x = g.player.x;
  moveBy(g, 0.2, 0);
  expect(g.player.x).toBe(x);
});
