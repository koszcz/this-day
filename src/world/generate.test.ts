import { expect, test } from 'bun:test';
import { generateWorld } from './generate';
import { isWalkable } from './query';

test('the same seed makes the same island', () => {
  const a = generateWorld(42);
  const b = generateWorld(42);
  expect(a.world.kind).toEqual(b.world.kind);
  expect(a.props.length).toBe(b.props.length);
});

test('you start on walkable land with room around you', () => {
  for (const seed of [1, 2, 3, 99]) {
    const { world, props } = generateWorld(seed);
    expect(isWalkable(world, world.start.x, world.start.y)).toBe(true);
    expect(props.some((p) => Math.hypot(p.x - world.start.x, p.y - world.start.y) < 1.5)).toBe(false);
  }
});

test('every island has water, trees, stones and berries', () => {
  for (const seed of [1, 2, 3, 99]) {
    const { world, props } = generateWorld(seed);
    expect(world.kind.includes('deep')).toBe(true);
    for (const k of ['tree', 'stone', 'bush'] as const) expect(props.some((p) => p.kind === k)).toBe(true);
  }
});
