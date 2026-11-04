import { expect, test } from 'bun:test';
import { targetWarmth } from './needs';
import { advance } from './step';
import { addStructure } from './structures';
import { freshGame } from './test-helpers';
import { ensureWeather, newWeather, WET_CHILL } from './weather';

const rainNow = (g: ReturnType<typeof freshGame>) => {
  g.weather = { raining: true, changeAt: g.time + 100000 };
};

test('the first rain comes after a dry morning', () => {
  const g = freshGame();
  expect(g.weather.raining).toBe(false);
  advance(g, 235);
  expect(g.weather.raining).toBe(false);
  advance(g, 10);
  expect(g.weather.raining).toBe(true);
  expect(g.log.at(-1)).toBe('Dark clouds open. Rain begins to fall.');
});

test('a spell of rain ends, and the next one is scheduled', () => {
  const g = freshGame();
  g.weather = { raining: true, changeAt: g.time + 10 };
  advance(g, 10);
  expect(g.weather.raining).toBe(false);
  expect(g.weather.changeAt).toBeGreaterThanOrEqual(g.time + 240);
  expect(g.log.at(-1)).toBe('The rain stops.');
});

test('rain soaks you outside', () => {
  const g = freshGame();
  rainNow(g);
  advance(g, 20);
  expect(g.wet).toBe(40);
  advance(g, 100);
  expect(g.wet).toBe(100);
});

test('a lean-to keeps the rain off you', () => {
  const g = freshGame();
  rainNow(g);
  addStructure(g, 'shelter');
  advance(g, 60);
  expect(g.wet).toBe(0);
});

test('wet pulls your warmth target down', () => {
  const g = freshGame();
  g.time = 12 * 60;
  const dry = targetWarmth(g);
  g.wet = 100;
  expect(targetWarmth(g)).toBe(dry - WET_CHILL);
});

test('wet makes you cool faster', () => {
  const dry = freshGame();
  const wet = freshGame();
  for (const g of [dry, wet]) g.time = 22 * 60;
  wet.wet = 100;
  advance(dry, 30);
  advance(wet, 30);
  expect(wet.stats.warmth).toBeLessThan(dry.stats.warmth - 5);
});

test('a lit fire dries you fast, a lean-to slower, open air slowest', () => {
  const fire = freshGame();
  const lean = freshGame();
  const open = freshGame();
  for (const g of [fire, lean, open]) g.wet = 100;
  addStructure(fire, 'fire', 400);
  addStructure(lean, 'shelter');
  for (const g of [fire, lean, open]) advance(g, 50);
  expect(fire.wet).toBe(50);
  expect(lean.wet).toBe(70);
  expect(open.wet).toBe(95);
  advance(fire, 50);
  expect(fire.wet).toBe(0);
  expect(fire.log.at(-1)).toBe('You are dry again.');
});

test('an unlit fire does not dry you', () => {
  const g = freshGame();
  g.wet = 50;
  addStructure(g, 'fire', 0);
  advance(g, 10);
  expect(g.wet).toBe(49);
});

test('you are told when you are soaked', () => {
  const g = freshGame();
  rainNow(g);
  advance(g, 25);
  expect(g.log.at(-1)).toBe('You are soaked through. The chill bites.');
});

test('an old save without weather gets a dry start', () => {
  const g = freshGame();
  const old = g as Partial<typeof g>;
  delete old.weather;
  delete old.wet;
  ensureWeather(g);
  expect(g.weather).toEqual(newWeather(g.time));
  expect(g.wet).toBe(0);
});
