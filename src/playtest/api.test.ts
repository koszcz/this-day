import { expect, test } from 'bun:test';
import { newDriver } from '../game/drive';
import { count } from '../game/items';
import { freshGame, keepDry, putProp } from '../game/test-helpers';
import { advanceBy, look, MAX_ADVANCE, order, summary } from './api';

test('look lists props nearest first, each with a target', () => {
  const g = freshGame();
  putProp(g, 'tree', 6, 0);
  putProp(g, 'bush', 2, 0);
  const found = look(g, 8).props;
  expect(found.map((p) => [p.kind, p.dist])).toEqual([['bush', 2], ['tree', 6]]);
  expect(found[0].target).toEqual({ kind: 'prop', id: 1 });
});

test('look leaves out props beyond the radius', () => {
  const g = freshGame();
  putProp(g, 'tree', 6, 0);
  expect(look(g, 3).props).toEqual([]);
});

test('order refuses a blocked action and says why', () => {
  const g = freshGame();
  const result = order(g, newDriver(), { kind: 'water', x: 0, y: 0 }, 'fish');
  expect(result).toEqual({ ok: false, why: 'needs spear' });
});

test('order sets an errand that advanceBy carries out', () => {
  const g = freshGame();
  keepDry(g);
  putProp(g, 'bush', 3, 0);
  const d = newDriver();
  expect(order(g, d, { kind: 'prop', id: 0 }, 'forage')).toEqual({ ok: true });
  advanceBy(g, d, 60);
  expect(d.errand).toBeNull();
  expect(count(g.inventory, 'berries')).toBeGreaterThan(0);
});

test('advanceBy moves the clock by the minutes asked, and no more than the cap', () => {
  const g = freshGame();
  keepDry(g);
  const t0 = g.time;
  advanceBy(g, newDriver(), 30);
  expect(g.time - t0).toBe(30);
  advanceBy(g, newDriver(), 100000);
  expect(g.time - t0).toBe(30 + MAX_ADVANCE);
});

test('summary shows the clock and the last messages', () => {
  const g = freshGame();
  const s = summary(g, newDriver());
  expect(s.clock).toBe('07:00');
  expect(s.log).toEqual(['You wake up on cold ground. You do not know where you are.']);
});
