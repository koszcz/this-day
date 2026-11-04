import { expect, test } from 'bun:test';
import { newDriver, tick } from './drive';
import { count } from './items';
import { freshGame, keepDry, putProp } from './test-helpers';

test('a walk order moves the survivor to the point and then stops', () => {
  const g = freshGame();
  keepDry(g);
  const driver = newDriver();
  const x0 = g.player.x;
  driver.target = { x: x0 + 1, y: g.player.y };
  for (let i = 0; i < 40; i++) tick(g, driver, 0.25);
  expect(driver.target).toBeNull();
  expect(Math.abs(g.player.x - (x0 + 1))).toBeLessThan(0.2);
});

test('an errand walks to the bush, forages, and clears itself', () => {
  const g = freshGame();
  keepDry(g);
  putProp(g, 'bush', 3, 0);
  const driver = newDriver();
  driver.errand = { target: { kind: 'prop', id: 0 }, action: 'forage' };
  for (let i = 0; i < 400 && (driver.errand || g.busy); i++) tick(g, driver, 0.25);
  expect(driver.errand).toBeNull();
  expect(count(g.inventory, 'berries')).toBeGreaterThan(0);
});

test('one second of play moves the clock two game minutes', () => {
  const g = freshGame();
  keepDry(g);
  const t0 = g.time;
  tick(g, newDriver(), 1);
  expect(g.time - t0).toBe(2);
});
