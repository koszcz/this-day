import { expect, test } from 'bun:test';
import { craftableActions, startAction } from './actions';
import { count } from './items';
import { advance } from './step';
import { freshGame, give } from './test-helpers';

const entry = (g: ReturnType<typeof freshGame>, id: string) => craftableActions(g).find((c) => c.recipe.id === id)!;

test('a stone head takes 2 stone, and a handle takes 1 wood', () => {
  const g = freshGame();
  give(g, 'stone', 2);
  give(g, 'wood');
  expect(startAction(g, 'craft:stoneHead')).toBe(true);
  advance(g, 15);
  expect(startAction(g, 'craft:handle')).toBe(true);
  advance(g, 8);
  expect([count(g.inventory, 'stone'), count(g.inventory, 'wood')]).toEqual([0, 0]);
  expect([count(g.inventory, 'stoneHead'), count(g.inventory, 'handle')]).toEqual([1, 1]);
});

test('making a stone head warns when it leaves too few stones for a campfire', () => {
  const g = freshGame();
  give(g, 'stone', 3);
  expect(startAction(g, 'craft:stoneHead')).toBe(true);
  expect(g.log.at(-1)).toBe('This stone is for a campfire, which needs 2 stone. You will have 1 left.');
});

test('making a stone head does not warn when 2 stones stay for the campfire', () => {
  const g = freshGame();
  give(g, 'stone', 4);
  const before = g.log.length;
  expect(startAction(g, 'craft:stoneHead')).toBe(true);
  expect(g.log.length).toBe(before);
});

test('making a stone head does not warn once a fire stands', () => {
  const g = freshGame();
  give(g, 'stone', 2);
  g.structures.push({ id: 1, kind: 'fire', x: 0, y: 0, fuel: 0 });
  const before = g.log.length;
  expect(startAction(g, 'craft:stoneHead')).toBe(true);
  expect(g.log.length).toBe(before);
});

test('raw stone and wood no longer make an axe or a spear', () => {
  const g = freshGame();
  give(g, 'wood', 4);
  give(g, 'stone', 4);
  expect(entry(g, 'axe').enabled).toBe(false);
  expect(entry(g, 'spear').enabled).toBe(false);
});

test('an axe needs a stone head, a handle and a rope', () => {
  const g = freshGame();
  give(g, 'stoneHead');
  give(g, 'handle');
  expect(entry(g, 'axe').enabled).toBe(false);
  give(g, 'rope');
  expect(entry(g, 'axe').enabled).toBe(true);
  expect(startAction(g, 'craft:axe')).toBe(true);
  advance(g, 10);
  expect(count(g.inventory, 'axe')).toBe(1);
  expect([count(g.inventory, 'stoneHead'), count(g.inventory, 'handle'), count(g.inventory, 'rope')]).toEqual([0, 0, 0]);
});

test('a spear needs a stone head, a handle and a rope', () => {
  const g = freshGame();
  give(g, 'stoneHead');
  give(g, 'handle');
  give(g, 'rope');
  expect(startAction(g, 'craft:spear')).toBe(true);
  advance(g, 10);
  expect(count(g.inventory, 'spear')).toBe(1);
});

test('a blocked recipe says what is missing, or that you have the tool', () => {
  const g = freshGame();
  give(g, 'wood');
  expect(entry(g, 'handle').blocked).toBeUndefined();
  expect(entry(g, 'shelter').blocked).toBe('needs 7 wood');
  expect(entry(g, 'axe').blocked).toBe('needs 1 stone head, 1 handle, 1 rope');
  give(g, 'axe');
  give(g, 'stoneHead');
  give(g, 'handle');
  give(g, 'rope');
  expect(entry(g, 'axe').blocked).toBe('you have one');
  expect(entry(g, 'spear').blocked).toBeUndefined();
});
