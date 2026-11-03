import { expect, test } from 'bun:test';
import { advance } from './step';
import { addStructure } from './structures';
import { freshGame } from './test-helpers';
import { MINUTES_PER_DAY } from './time';

test('hunger and thirst fall as time passes', () => {
  const g = freshGame();
  const { hunger, thirst } = g.stats;
  advance(g, 60);
  expect(g.stats.hunger).toBeLessThan(hunger);
  expect(g.stats.thirst).toBeLessThan(thirst);
});

test('a player who does nothing dies within three days', () => {
  const g = freshGame();
  advance(g, MINUTES_PER_DAY * 3);
  expect(g.dead).not.toBeNull();
});

test('night is colder than day, and a fire fixes it', () => {
  const cold = freshGame();
  cold.time = 22 * 60;
  cold.stats.warmth = 60;
  advance(cold, 240);
  expect(cold.stats.warmth).toBeLessThan(25);

  const warm = freshGame();
  warm.time = 22 * 60;
  warm.stats.warmth = 60;
  addStructure(warm, 'fire', 400);
  advance(warm, 240);
  expect(warm.stats.warmth).toBeGreaterThan(70);
});

test('a fire burns out', () => {
  const g = freshGame();
  const fire = addStructure(g, 'fire', 30);
  advance(g, 60);
  expect(fire.fuel).toBe(0);
});

test('sleeping restores energy and ends when rested', () => {
  const g = freshGame();
  g.time = 10 * 60;
  g.stats.energy = 20;
  g.sleeping = true;
  addStructure(g, 'fire', 600);
  advance(g, 600);
  expect(g.stats.energy).toBeGreaterThan(90);
  expect(g.sleeping).toBe(false);
});

test('freezing wakes a sleeper', () => {
  const g = freshGame();
  g.time = 22 * 60;
  g.stats.energy = 10;
  g.stats.warmth = 30;
  g.sleeping = true;
  advance(g, 300);
  expect(g.sleeping).toBe(false);
});
