import { expect, test } from 'bun:test';
import { advance } from './step';
import { addStructure, isSheltered } from './structures';
import { freshGame, keepDry } from './test-helpers';
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
  keepDry(warm);
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

test('a lean-to keeps you warmer at night, and the game says when you are sheltered', () => {
  const open = freshGame();
  open.time = 22 * 60;
  open.stats.warmth = 60;
  advance(open, 240);

  const covered = freshGame();
  covered.time = 22 * 60;
  covered.stats.warmth = 60;
  expect(isSheltered(covered)).toBe(false);
  addStructure(covered, 'shelter');
  expect(isSheltered(covered)).toBe(true);
  advance(covered, 240);
  expect(covered.stats.warmth).toBeGreaterThan(open.stats.warmth + 10);
});
