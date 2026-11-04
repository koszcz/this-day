import { expect, test } from 'bun:test';
import { availableActions, craftableActions, startAction } from './actions';
import { menuFor } from './interact';
import { count } from './items';
import { moveBy } from './movement';
import { advance } from './step';
import { freshGame, give, putProp } from './test-helpers';
import { BLEED_DRAIN, ensureWound, HEAL_MINUTES, maybeWound, WOUND_CHANCE } from './wounds';

test('a bandage is made from plant fibre', () => {
  const g = freshGame();
  give(g, 'fibre', 2);
  expect(craftableActions(g).find((c) => c.action.id === 'craft:bandage')!.enabled).toBe(true);
  expect(startAction(g, 'craft:bandage')).toBe(true);
  advance(g, 10);
  expect(count(g.inventory, 'bandage')).toBe(1);
  expect(count(g.inventory, 'fibre')).toBe(0);
});

test('gathering stone hurts you about 12% of the time', () => {
  let hurt = 0;
  const trials = 500;
  for (let seed = 1; seed <= trials; seed++) {
    const g = freshGame(seed);
    putProp(g, 'stone', 0.5, 0, 1);
    startAction(g, 'mine');
    advance(g, 30);
    if (g.wound) hurt++;
  }
  expect(hurt / trials).toBeGreaterThan(WOUND_CHANCE - 0.06);
  expect(hurt / trials).toBeLessThan(WOUND_CHANCE + 0.06);
});

test('an existing wound is not replaced by a new one', () => {
  const g = freshGame();
  g.wound = { kind: 'sprain', left: 100 };
  for (let i = 0; i < 50; i++) maybeWound(g, 1);
  expect(g.wound).toEqual({ kind: 'sprain', left: 100 });
});

test('bleeding drains health and stops health regrowing', () => {
  const g = freshGame();
  g.wound = { kind: 'bleeding', left: HEAL_MINUTES.bleeding };
  advance(g, 10);
  expect(g.stats.health).toBeCloseTo(100 - BLEED_DRAIN * 10, 5);
  expect(g.log.some((l) => l.includes('bleeding'))).toBe(false);
});

test('bleeding can kill', () => {
  const g = freshGame();
  g.stats.health = 1;
  g.wound = { kind: 'bleeding', left: 1000 };
  advance(g, 60);
  expect(g.dead).toBe('bled to death');
});

test('a sprain slows your walk', () => {
  const g = freshGame();
  const well = freshGame();
  g.wound = { kind: 'sprain', left: 100 };
  const start = { ...g.player };
  moveBy(g, 0.1, 0.1);
  moveBy(well, 0.1, 0.1);
  expect(well.player.x).toBeGreaterThan(start.x);
  expect(g.player.x - start.x).toBeLessThan(well.player.x - start.x);
});

test('a wound heals by itself, faster in sleep', () => {
  const g = freshGame();
  g.wound = { kind: 'sprain', left: 30 };
  advance(g, 30);
  expect(g.wound).toBeNull();
  expect(g.log.at(-1)).toContain('ankle feels better');

  const s = freshGame();
  s.wound = { kind: 'sprain', left: 30 };
  s.sleeping = true;
  advance(s, 10);
  expect(s.wound).toBeNull();
});

test('a bandage treats the wound and is used up', () => {
  const g = freshGame();
  expect(availableActions(g).some((a) => a.id === 'bandage')).toBe(false);
  g.wound = { kind: 'bleeding', left: 200 };
  expect(availableActions(g).some((a) => a.id === 'bandage')).toBe(false);
  give(g, 'bandage');
  expect(menuFor(g, { kind: 'player' }).map((e) => e.id)).toContain('bandage');
  expect(startAction(g, 'bandage')).toBe(true);
  advance(g, 5);
  expect(g.wound).toBeNull();
  expect(count(g.inventory, 'bandage')).toBe(0);
});

test('old saves load with no wound', () => {
  const g = freshGame();
  delete (g as { wound?: unknown }).wound;
  ensureWound(g);
  expect(g.wound).toBeNull();
});
