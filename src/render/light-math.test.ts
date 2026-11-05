import { expect, test } from 'bun:test';
import { fillShare, fireGlow, fireHalo, grade, shadowStrength } from './light-math';

test('a fire glows brighter and reaches farther at night than at noon', () => {
  expect(fireGlow(0).intensity).toBeGreaterThan(fireGlow(1).intensity);
  expect(fireGlow(0).reach).toBeGreaterThan(fireGlow(1).reach);
  expect(fireGlow(1)).toEqual({ intensity: 1, reach: 1 });
});

test('the ground halo shows at night, fades by day and dies with the fuel', () => {
  expect(fireHalo(0, 1)).toBeGreaterThan(0.4);
  expect(fireHalo(1, 1)).toBe(0);
  expect(fireHalo(0, 0)).toBe(0);
  expect(fireHalo(0, 0.5)).toBeLessThan(fireHalo(0, 1));
});

test('shadows are softer than before and softest when the sun is low', () => {
  expect(shadowStrength(1)).toBeLessThan(0.5);
  expect(shadowStrength(0.2)).toBeLessThan(shadowStrength(1));
  expect(fillShare(0.5) + shadowStrength(0.5)).toBeCloseTo(1);
});

test('grading is cool at night, warm at dusk and neutral at noon', () => {
  expect(grade(0).cool).toBe(1);
  expect(grade(1)).toEqual({ cool: 0, warm: 0 });
  expect(grade(0.3).warm).toBeGreaterThan(0.5);
  expect(grade(0.3).warm).toBeGreaterThan(grade(0.9).warm);
});
