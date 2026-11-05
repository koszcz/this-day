import { expect, test } from 'bun:test';
import { foamAmount, shimmerAmount, waterAlpha } from './water-motion';

test('shimmer stays between 0 and 1 and changes over time', () => {
  const seen = new Set<number>();
  for (let t = 0; t < 10; t += 0.5) {
    const s = shimmerAmount(12.3, 45.6, t);
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(1);
    seen.add(Math.round(s * 1000));
  }
  expect(seen.size).toBeGreaterThan(3);
});

test('shimmer differs from place to place', () => {
  const seen = new Set<number>();
  for (let x = 0; x < 20; x++) seen.add(Math.round(shimmerAmount(x * 0.9, x * 0.4, 2) * 1000));
  expect(seen.size).toBeGreaterThan(3);
});

test('foam appears only in the shallow band at the shore', () => {
  expect(foamAmount(0.02, 0)).toBeGreaterThan(0.3);
  expect(foamAmount(1.5, 0)).toBe(0);
  expect(foamAmount(-1, 0)).toBe(0);
});

test('foam creeps in and out over time', () => {
  const values = [0, 1, 2, 3].map((t) => foamAmount(0.2, t));
  expect(Math.max(...values)).toBeGreaterThan(Math.min(...values));
});

test('open water shimmers, the shore is foamy, dry land far from the shore is clear', () => {
  expect(waterAlpha(1, 5, 5, 0)).toBeGreaterThanOrEqual(0);
  expect(waterAlpha(0.01, 5, 5, 0)).toBeGreaterThan(0.3);
  expect(waterAlpha(-2, 5, 5, 0)).toBe(0);
  expect(waterAlpha(0.01, 5, 5, 0)).toBeLessThanOrEqual(1);
});
