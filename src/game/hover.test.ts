import { expect, test } from 'bun:test';
import { pickObject, pickWater, sameTarget } from './hover';
import { freshGame, putProp } from './test-helpers';

test('the mouse over your character picks you', () => {
  const g = freshGame();
  expect(pickObject(g, g.player.x + 0.1, g.player.y)).toEqual({ kind: 'player' });
});

test('the mouse over a tree picks that tree', () => {
  const g = freshGame();
  putProp(g, 'tree', 3, 0);
  expect(pickObject(g, g.player.x + 3.2, g.player.y)).toEqual({ kind: 'prop', id: 0 });
});

test('the mouse past the edge of a prop picks nothing', () => {
  const g = freshGame();
  putProp(g, 'stone', 3, 0);
  expect(pickObject(g, g.player.x + 4, g.player.y)).toBeNull();
});

test('an emptied prop is not picked', () => {
  const g = freshGame();
  putProp(g, 'bush', 3, 0, 0);
  expect(pickObject(g, g.player.x + 3, g.player.y)).toBeNull();
});

test('the closest of two props wins', () => {
  const g = freshGame();
  putProp(g, 'tree', 3, 0);
  putProp(g, 'tree', 3.6, 0);
  expect(pickObject(g, g.player.x + 3.4, g.player.y)).toEqual({ kind: 'prop', id: 1 });
});

test('the mouse over a fire or a lean-to picks that structure', () => {
  const g = freshGame();
  g.structures = [
    { id: 1, kind: 'fire', x: g.player.x + 3, y: g.player.y, fuel: 10 },
    { id: 2, kind: 'shelter', x: g.player.x - 3, y: g.player.y, fuel: 0 },
  ];
  expect(pickObject(g, g.player.x + 3, g.player.y)).toEqual({ kind: 'structure', id: 1 });
  expect(pickObject(g, g.player.x - 3.4, g.player.y)).toEqual({ kind: 'structure', id: 2 });
});

test('water is picked by its tile, and land is not', () => {
  const g = freshGame();
  expect(pickWater(g, 0.5, 0.5)).toEqual({ kind: 'water', x: 0, y: 0 });
  expect(pickWater(g, g.player.x, g.player.y)).toBeNull();
});

test('two picks are the same when they name the same thing', () => {
  expect(sameTarget({ kind: 'prop', id: 2 }, { kind: 'prop', id: 2 })).toBe(true);
  expect(sameTarget({ kind: 'prop', id: 2 }, { kind: 'prop', id: 3 })).toBe(false);
  expect(sameTarget(null, null)).toBe(true);
  expect(sameTarget(null, { kind: 'player' })).toBe(false);
});
