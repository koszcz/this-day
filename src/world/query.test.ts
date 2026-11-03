import { expect, test } from 'bun:test';
import { generateWorld } from './generate';
import { groundHeight, surfaceHeight } from './query';

test('the ground has no cliffs: height changes a little with each small step', () => {
  const { world } = generateWorld(7);
  let worst = 0;
  for (let y = 2; y < world.size - 2; y += 3) {
    for (let x = 0.1; x < world.size - 2; x += 0.1) {
      worst = Math.max(worst, Math.abs(groundHeight(world, x + 0.1, y + 0.5) - groundHeight(world, x, y + 0.5)));
    }
  }
  expect(worst).toBeLessThan(0.1);
});

test('standing on the shore, you are never below the water line', () => {
  const { world } = generateWorld(7);
  const sea = surfaceHeight(world, 0.5, 0.5);
  for (let x = 0; x < world.size; x++) expect(surfaceHeight(world, x + 0.5, 3.5)).toBeGreaterThanOrEqual(sea);
});
