import { expect, test } from 'bun:test';
import { availableActions, craftableActions, startAction } from './actions';
import { LIGHT_CHANCE_DRY, LIGHT_CHANCE_RAIN, LIGHT_FUEL, lightChance } from './fire';
import { count } from './items';
import { advance } from './step';
import { addStructure } from './structures';
import { freshGame, give, keepDry, putProp } from './test-helpers';
import { carryLoad } from './weight';

test('a bush gives tinder and a tree gives kindling, without using them up', () => {
  const g = freshGame();
  putProp(g, 'bush', 0.5, 0, 1);
  putProp(g, 'tree', -0.5, 0, 1);
  expect(startAction(g, 'tinder')).toBe(true);
  advance(g, 10);
  expect(startAction(g, 'kindling')).toBe(true);
  advance(g, 10);
  expect(count(g.inventory, 'tinder')).toBe(1);
  expect(count(g.inventory, 'kindling')).toBe(1);
  expect(g.props.map((p) => p.amount)).toEqual([1, 1]);
  expect(carryLoad(g.inventory)).toBe(1.5);
});

test('a new campfire is laid but not lit', () => {
  const g = freshGame();
  give(g, 'wood', 3);
  give(g, 'stone', 2);
  expect(craftableActions(g).find((c) => c.recipe.id === 'campfire')!.enabled).toBe(true);
  startAction(g, 'craft:campfire');
  advance(g, 30);
  expect(g.structures[0].fuel).toBe(0);
});

test('lighting needs both tinder and kindling', () => {
  const g = freshGame();
  addStructure(g, 'fire', 0);
  const light = () => availableActions(g).find((a) => a.id === 'light')!;
  expect(light().blocked).toBe('needs tinder and kindling');
  give(g, 'tinder');
  expect(light().blocked).toBe('needs tinder and kindling');
  expect(startAction(g, 'light')).toBe(false);
  give(g, 'kindling');
  expect(light().blocked).toBeUndefined();
});

test('lighting can fail, and every try uses up the tinder and kindling', () => {
  let lit = 0;
  const trials = 400;
  for (let seed = 1; seed <= trials; seed++) {
    const g = freshGame(seed);
    keepDry(g);
    const fire = addStructure(g, 'fire', 0);
    give(g, 'tinder');
    give(g, 'kindling');
    startAction(g, 'light');
    advance(g, 10);
    expect(count(g.inventory, 'tinder') + count(g.inventory, 'kindling')).toBe(0);
    if (fire.fuel > 0) lit++;
  }
  expect(lit / trials).toBeGreaterThan(LIGHT_CHANCE_DRY - 0.08);
  expect(lit / trials).toBeLessThan(LIGHT_CHANCE_DRY + 0.08);
});

test('a lit fire starts with a little fuel', () => {
  for (let seed = 1; seed < 50; seed++) {
    const g = freshGame(seed);
    keepDry(g);
    const fire = addStructure(g, 'fire', 0);
    give(g, 'tinder');
    give(g, 'kindling');
    startAction(g, 'light');
    advance(g, 10);
    if (fire.fuel > 0) {
      expect(fire.fuel).toBeGreaterThan(LIGHT_FUEL - 15);
      return;
    }
  }
  throw new Error('no attempt lit the fire');
});

test('it is harder to light a fire in the rain, and crafting skill helps', () => {
  const g = freshGame();
  const dry = lightChance(g);
  g.weather.raining = true;
  const wet = lightChance(g);
  expect(dry).toBeGreaterThanOrEqual(LIGHT_CHANCE_DRY);
  expect(wet).toBeGreaterThanOrEqual(LIGHT_CHANCE_RAIN);
  expect(wet).toBeLessThan(dry - 0.3);
  g.skills.crafting = 400;
  expect(lightChance(g)).toBeGreaterThan(wet);
});

test('rain puts out a fire with no lean-to beside it', () => {
  const g = freshGame();
  const fire = addStructure(g, 'fire', 300);
  g.weather = { raining: true, changeAt: g.time + 100000 };
  advance(g, 5);
  expect(fire.fuel).toBe(0);
  expect(g.log).toContain('The rain puts out the fire.');
});

test('a lean-to beside the fire keeps it burning in the rain', () => {
  const g = freshGame();
  const fire = addStructure(g, 'fire', 300);
  const shelter = addStructure(g, 'shelter');
  shelter.x += 1.5;
  g.weather = { raining: true, changeAt: g.time + 100000 };
  advance(g, 30);
  expect(fire.fuel).toBe(270);
});

test('a lean-to too far away does not protect the fire', () => {
  const g = freshGame();
  const fire = addStructure(g, 'fire', 300);
  const shelter = addStructure(g, 'shelter');
  shelter.x += 5;
  g.weather = { raining: true, changeAt: g.time + 100000 };
  advance(g, 5);
  expect(fire.fuel).toBe(0);
});
