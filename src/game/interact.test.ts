import { expect, test } from 'bun:test';
import { errandStep, menuFor } from './interact';
import { startAction } from './actions';
import { advance } from './step';
import { count } from './items';
import { addStructure } from './structures';
import { freshGame, give, putProp } from './test-helpers';

const ids = (g: ReturnType<typeof freshGame>, t: Parameters<typeof menuFor>[1]) => menuFor(g, t).map((e) => e.id);

test('a tree offers to chop, with the axe label', () => {
  const g = freshGame();
  putProp(g, 'tree', 5, 0);
  const [chop] = menuFor(g, { kind: 'prop', id: 0 });
  expect(chop.id).toBe('chop');
  expect(chop.label).toBe('Break branches');
  give(g, 'axe');
  expect(menuFor(g, { kind: 'prop', id: 0 })[0].label).toBe('Chop tree');
});

test('a bush offers berries and a stone offers stone', () => {
  const g = freshGame();
  putProp(g, 'bush', 5, 0);
  putProp(g, 'stone', -5, 0);
  expect(ids(g, { kind: 'prop', id: 0 })).toEqual(['forage']);
  expect(ids(g, { kind: 'prop', id: 1 })).toEqual(['mine']);
});

test('water offers Drink, and Fish is blocked until you own a spear', () => {
  const g = freshGame();
  const water = { kind: 'water', x: 0, y: 0 } as const;
  expect(menuFor(g, water).map((e) => [e.id, e.blocked])).toEqual([['drink', undefined], ['fish', 'needs spear']]);
  give(g, 'spear');
  expect(menuFor(g, water).map((e) => [e.id, e.blocked])).toEqual([['drink', undefined], ['fish', undefined]]);
});

test('a fire offers to feed it, and cooking says why it is blocked', () => {
  const g = freshGame();
  const fire = addStructure(g, 'fire', 0);
  const target = { kind: 'structure', id: fire.id } as const;
  expect(menuFor(g, target).map((e) => [e.id, e.label, e.blocked])).toEqual([
    ['fuel', 'Relight fire', 'needs wood'],
    ['cook', 'Cook fish', 'the fire is out'],
  ]);
  fire.fuel = 100;
  give(g, 'wood');
  expect(menuFor(g, target).map((e) => [e.id, e.blocked])).toEqual([['fuel', undefined], ['cook', 'needs raw fish']]);
  give(g, 'rawFish');
  expect(menuFor(g, target)[1].blocked).toBeUndefined();
});

test('a lean-to has no menu', () => {
  const g = freshGame();
  const shelter = addStructure(g, 'shelter');
  expect(menuFor(g, { kind: 'structure', id: shelter.id })).toEqual([]);
});

test('you offer food, Sleep and crafting', () => {
  const g = freshGame();
  g.stats.energy = 50;
  give(g, 'berries');
  give(g, 'wood', 2);
  give(g, 'stone', 2);
  const menu = menuFor(g, { kind: 'player' });
  expect(menu.map((e) => e.id)).toEqual(['eat:berries', 'sleep', 'craft:campfire', 'craft:axe', 'craft:spear', 'craft:shelter']);
  expect(menu.map((e) => e.blocked)).toEqual([undefined, undefined, 'needs materials', undefined, undefined, 'needs materials']);
});

test('Sleep is blocked when you are rested', () => {
  const g = freshGame();
  g.stats.energy = 100;
  expect(menuFor(g, { kind: 'player' }).find((e) => e.id === 'sleep')?.blocked).toBe('not tired');
});

test('an errand walks toward a far tree, then arrives beside it', () => {
  const g = freshGame();
  putProp(g, 'tree', 5, 0);
  const errand = { target: { kind: 'prop', id: 0 }, action: 'chop' } as const;
  expect(errandStep(g, errand)).toEqual({ kind: 'walk', x: g.player.x + 5, y: g.player.y });
  g.player.x += 4;
  expect(errandStep(g, errand)).toEqual({ kind: 'arrive' });
});

test('an errand to yourself arrives at once', () => {
  const g = freshGame();
  expect(errandStep(g, { target: { kind: 'player' }, action: 'sleep' })).toEqual({ kind: 'arrive' });
});

test('an errand to water arrives once water is in reach', () => {
  const g = freshGame();
  const errand = { target: { kind: 'water', x: 0, y: 0 }, action: 'drink' } as const;
  g.player.x = 20;
  g.player.y = 20;
  expect(errandStep(g, errand)).toEqual({ kind: 'walk', x: 0.5, y: 0.5 });
  g.player.x = 1;
  g.player.y = 1;
  expect(errandStep(g, errand)).toEqual({ kind: 'arrive' });
});

test('an errand to a tree that was cut down is gone', () => {
  const g = freshGame();
  putProp(g, 'tree', 5, 0, 0);
  expect(errandStep(g, { target: { kind: 'prop', id: 0 }, action: 'chop' })).toEqual({ kind: 'gone' });
});

test('an errand to a fire arrives beside it, and the action then works', () => {
  const g = freshGame();
  const fire = addStructure(g, 'fire', 100);
  fire.x = g.player.x + 4;
  give(g, 'wood');
  const errand = { target: { kind: 'structure', id: fire.id }, action: 'fuel' } as const;
  expect(errandStep(g, errand).kind).toBe('walk');
  g.player.x += 3;
  expect(errandStep(g, errand)).toEqual({ kind: 'arrive' });
  expect(startAction(g, 'fuel')).toBe(true);
  advance(g, 10);
  expect(count(g.inventory, 'wood')).toBe(0);
});
