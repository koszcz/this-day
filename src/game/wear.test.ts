import { expect, test } from 'bun:test';
import { availableActions, startAction } from './actions';
import { count } from './items';
import { advance } from './step';
import { freshGame, give, putProp } from './test-helpers';
import { TOOL_USES, usesLeft } from './wear';

test('a carried tool starts with full uses', () => {
  const g = freshGame();
  give(g, 'axe');
  expect(usesLeft(g, 'axe')).toBe(20);
  expect(usesLeft(g, 'spear')).toBe(0);
});

test('each chop with an axe uses it up once', () => {
  const g = freshGame();
  putProp(g, 'tree');
  give(g, 'axe');
  startAction(g, 'chop');
  advance(g, 60);
  expect(usesLeft(g, 'axe')).toBe(19);
});

test('chopping without an axe wears nothing', () => {
  const g = freshGame();
  putProp(g, 'tree');
  startAction(g, 'chop');
  advance(g, 60);
  expect(g.toolUses).toEqual({});
});

test('the axe breaks on its last use', () => {
  const g = freshGame();
  putProp(g, 'tree', 0.5, 0, 5);
  give(g, 'axe');
  g.toolUses.axe = 1;
  startAction(g, 'chop');
  advance(g, 60);
  expect(count(g.inventory, 'axe')).toBe(0);
  expect(g.log.at(-1)).toBe('Your stone axe breaks.');
});

test('each fishing try uses the spear, hit or miss', () => {
  const g = freshGame();
  g.player.x = 0.5;
  g.player.y = 0.5;
  give(g, 'spear');
  startAction(g, 'fish');
  advance(g, 120);
  expect(usesLeft(g, 'spear')).toBe(11);
});

test('the spear breaks after 12 tries', () => {
  const g = freshGame();
  g.player.x = 0.5;
  g.player.y = 0.5;
  give(g, 'spear');
  for (let i = 0; i < TOOL_USES.spear; i++) {
    expect(startAction(g, 'fish')).toBe(true);
    advance(g, 120);
    g.stats = { health: 100, hunger: 100, thirst: 100, energy: 100, warmth: 100 };
  }
  expect(count(g.inventory, 'spear')).toBe(0);
  expect(availableActions(g).map((a) => a.id)).not.toContain('fish');
});

test('a new axe is crafted at full strength after the old one broke', () => {
  const g = freshGame();
  g.toolUses.axe = 0;
  give(g, 'stoneHead');
  give(g, 'handle');
  give(g, 'rope');
  startAction(g, 'craft:axe');
  advance(g, 60);
  expect(usesLeft(g, 'axe')).toBe(20);
});
