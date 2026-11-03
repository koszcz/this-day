import { expect, test } from 'bun:test';
import { availableActions, craftableActions, startAction } from './actions';
import { count } from './items';
import { advance } from './step';
import { addStructure } from './structures';
import { freshGame, give, putProp } from './test-helpers';

const ids = (g: ReturnType<typeof freshGame>) => availableActions(g).map((a) => a.id);

test('picking berries takes time, then fills your pack', () => {
  const g = freshGame();
  putProp(g, 'bush');
  expect(ids(g)).toContain('forage');
  expect(startAction(g, 'forage')).toBe(true);
  expect(count(g.inventory, 'berries')).toBe(0);
  advance(g, 30);
  expect(count(g.inventory, 'berries')).toBeGreaterThan(0);
  expect(g.busy).toBeNull();
});

test('an emptied bush grows back later', () => {
  const g = freshGame();
  putProp(g, 'bush', 0.5, 0, 1);
  startAction(g, 'forage');
  advance(g, 30);
  expect(g.props[0].amount).toBe(0);
  g.time += 60 * 24 * 2;
  advance(g, 5);
  expect(g.props[0].amount).toBe(1);
});

test('an axe makes chopping faster', () => {
  const bare = freshGame();
  putProp(bare, 'tree');
  const withAxe = freshGame();
  putProp(withAxe, 'tree');
  give(withAxe, 'axe');
  const minutes = (g: typeof bare) => availableActions(g).find((a) => a.id === 'chop')!.minutes;
  expect(minutes(withAxe)).toBeLessThan(minutes(bare));
});

test('drinking needs water nearby', () => {
  const g = freshGame();
  expect(ids(g)).not.toContain('drink');
  g.player.x = 0.5;
  g.player.y = 0.5;
  expect(ids(g)).toContain('drink');
  g.stats.thirst = 10;
  startAction(g, 'drink');
  advance(g, 10);
  expect(g.stats.thirst).toBeGreaterThan(40);
});

test('crafting a campfire spends materials and places a fire', () => {
  const g = freshGame();
  expect(craftableActions(g).find((c) => c.recipe.id === 'campfire')!.enabled).toBe(false);
  expect(startAction(g, 'craft:campfire')).toBe(false);
  give(g, 'wood', 3);
  give(g, 'stone', 2);
  expect(startAction(g, 'craft:campfire')).toBe(true);
  advance(g, 30);
  expect(g.structures.length).toBe(1);
  expect(count(g.inventory, 'wood')).toBe(0);
});

test('you cannot make a second axe', () => {
  const g = freshGame();
  give(g, 'wood', 4);
  give(g, 'stone', 4);
  give(g, 'axe');
  expect(craftableActions(g).find((c) => c.recipe.id === 'axe')!.enabled).toBe(false);
});

test('cooking needs a lit fire and turns raw fish into cooked fish', () => {
  const g = freshGame();
  give(g, 'rawFish');
  expect(ids(g)).not.toContain('cook');
  addStructure(g, 'fire', 100);
  expect(ids(g)).toContain('cook');
  startAction(g, 'cook');
  advance(g, 10);
  expect(count(g.inventory, 'cookedFish')).toBe(1);
  expect(count(g.inventory, 'rawFish')).toBe(0);
});

test('eating restores hunger', () => {
  const g = freshGame();
  give(g, 'cookedFish');
  g.stats.hunger = 20;
  startAction(g, 'eat:cookedFish');
  advance(g, 5);
  expect(g.stats.hunger).toBeGreaterThan(50);
});

test('you cannot start a second action while busy', () => {
  const g = freshGame();
  putProp(g, 'bush');
  putProp(g, 'stone', -0.5);
  startAction(g, 'forage');
  expect(startAction(g, 'mine')).toBe(false);
});

test('skills level up with use and speed work', () => {
  const g = freshGame();
  const base = (() => { putProp(g, 'tree'); return availableActions(g).find((a) => a.id === 'chop')!.minutes; })();
  g.skills.labor = 200;
  expect(availableActions(g).find((a) => a.id === 'chop')!.minutes).toBeLessThan(base);
});

test('an out fire can be relit with wood', () => {
  const g = freshGame();
  const fire = addStructure(g, 'fire', 0);
  give(g, 'wood', 2);
  expect(ids(g)).toContain('fuel');
  expect(startAction(g, 'fuel')).toBe(true);
  advance(g, 10);
  expect(fire.fuel).toBeGreaterThan(100);
  expect(count(g.inventory, 'wood')).toBe(1);
});

test('next to a fire with no wood, the feed action is shown but blocked, with a reason', () => {
  const g = freshGame();
  addStructure(g, 'fire', 0);
  const feed = availableActions(g).find((a) => a.id === 'fuel');
  expect(feed?.blocked).toBe('needs wood');
  expect(startAction(g, 'fuel')).toBe(false);
});
