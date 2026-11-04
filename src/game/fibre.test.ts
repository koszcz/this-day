import { expect, test } from 'bun:test';
import { availableActions, craftableActions, startAction } from './actions';
import { menuFor } from './interact';
import { ITEMS, count } from './items';
import { advance } from './step';
import { freshGame, give, putProp } from './test-helpers';
import { carryLoad } from './weight';

test('a bush gives plant fibre without using up the bush', () => {
  const g = freshGame();
  putProp(g, 'bush', 0.5, 0, 1);
  expect(startAction(g, 'fibre')).toBe(true);
  advance(g, 10);
  expect(count(g.inventory, 'fibre')).toBe(1);
  expect(g.props[0].amount).toBe(1);
  expect(carryLoad(g.inventory)).toBe(ITEMS.fibre.weight);
});

test('the bush menu lists Strip fibre after the other actions', () => {
  const g = freshGame();
  putProp(g, 'bush', 5, 0);
  expect(menuFor(g, { kind: 'prop', id: 0 }).map((e) => [e.id, e.label])).toEqual([
    ['forage', 'Pick berries'], ['tinder', 'Gather tinder'], ['fibre', 'Strip fibre'],
  ]);
});

test('no fibre action away from a bush', () => {
  const g = freshGame();
  expect(availableActions(g).some((a) => a.id === 'fibre')).toBe(false);
});

test('fibre is blocked when the pack is full', () => {
  const g = freshGame();
  putProp(g, 'bush', 0.5, 0, 1);
  give(g, 'stone', 10);
  expect(availableActions(g).find((a) => a.id === 'fibre')!.blocked).toBe('pack is full');
});

test('cordage turns 3 fibre into 1 rope, and you can make several', () => {
  const g = freshGame();
  const cordage = () => craftableActions(g).find((c) => c.recipe.id === 'cordage')!;
  give(g, 'fibre', 2);
  expect(cordage().enabled).toBe(false);
  give(g, 'fibre', 4);
  expect(cordage().enabled).toBe(true);
  expect(startAction(g, 'craft:cordage')).toBe(true);
  advance(g, 20);
  expect(count(g.inventory, 'fibre')).toBe(3);
  expect(count(g.inventory, 'rope')).toBe(1);
  expect(cordage().enabled).toBe(true);
  startAction(g, 'craft:cordage');
  advance(g, 20);
  expect(count(g.inventory, 'rope')).toBe(2);
  expect(count(g.inventory, 'fibre')).toBe(0);
});

test('the player menu shows Make cordage, blocked until you have fibre', () => {
  const g = freshGame();
  const entry = () => menuFor(g, { kind: 'player' }).find((e) => e.id === 'craft:cordage')!;
  expect(entry().blocked).toBe('needs 3 plant fibre');
  give(g, 'fibre', 3);
  expect(entry().blocked).toBeUndefined();
});
