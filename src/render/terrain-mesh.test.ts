import { expect, test } from 'bun:test';
import { generateWorld } from '../world/generate';
import { groundHeight } from '../world/query';
import { terrainMesh } from './terrain-mesh';

test('the terrain mesh has one vertex per tile corner and two triangles per tile', () => {
  const { world } = generateWorld(3);
  const m = terrainMesh(world);
  const n = world.size + 1;
  expect(m.positions.length).toBe(n * n * 3);
  expect(m.colors.length).toBe(n * n * 3);
  expect(m.indices.length).toBe(world.size * world.size * 6);
});

test('the mesh follows the same ground the player walks on', () => {
  const { world } = generateWorld(3);
  const m = terrainMesh(world);
  const n = world.size + 1;
  for (const [cx, cy] of [[5, 5], [30, 40], [world.size - 1, 10]]) {
    const i = (cy * n + cx) * 3;
    expect(m.positions[i]).toBe(cx);
    expect(m.positions[i + 1]).toBeCloseTo(groundHeight(world, cx, cy), 5);
    expect(m.positions[i + 2]).toBe(cy);
  }
});
