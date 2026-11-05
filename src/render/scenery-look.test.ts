import { expect, test } from 'bun:test';
import { grassTufts, lookOf, tinted } from './scenery-look';
import { generateWorld } from '../world/generate';

test('the same prop always gets the same look', () => {
  expect(lookOf('tree', 7)).toEqual(lookOf('tree', 7));
});

test('trees differ in size, shape and tint', () => {
  const looks = Array.from({ length: 40 }, (_, i) => lookOf('tree', i));
  expect(new Set(looks.map((l) => l.size.toFixed(2))).size).toBeGreaterThan(15);
  expect(new Set(looks.map((l) => l.tiers)).size).toBeGreaterThan(1);
  expect(new Set(looks.map((l) => l.tint.toFixed(2))).size).toBeGreaterThan(15);
  expect(new Set(looks.map((l) => l.lean.toFixed(2))).size).toBeGreaterThan(15);
});

test('every kind stays inside sane limits', () => {
  for (const kind of ['tree', 'bush', 'stone'] as const) {
    for (let i = 0; i < 200; i++) {
      const l = lookOf(kind, i);
      expect(l.size).toBeGreaterThanOrEqual(0.7);
      expect(l.size).toBeLessThanOrEqual(1.35);
      expect(l.tint).toBeGreaterThanOrEqual(-1);
      expect(l.tint).toBeLessThanOrEqual(1);
      expect(l.tiers).toBeGreaterThanOrEqual(2);
      expect(l.tiers).toBeLessThanOrEqual(4);
      expect(Math.abs(l.lean)).toBeLessThanOrEqual(0.12);
    }
  }
});

test('neighbouring ids do not look alike', () => {
  for (let i = 0; i < 50; i++) expect(lookOf('stone', i)).not.toEqual(lookOf('stone', i + 1));
});

test('tinted shifts a colour lighter or darker and keeps it valid', () => {
  expect(tinted('#808080', 0)).toBe('#808080');
  const light = parseInt(tinted('#808080', 1).slice(1, 3), 16);
  const dark = parseInt(tinted('#808080', -1).slice(1, 3), 16);
  expect(light).toBeGreaterThan(0x80);
  expect(dark).toBeLessThan(0x80);
  expect(tinted('#ffffff', 1)).toBe('#ffffff');
});

test('grass tufts grow only on grass, away from props, and are the same every time', () => {
  const { world, props } = generateWorld(42);
  const tufts = grassTufts(world, props);
  expect(tufts.length).toBeGreaterThan(50);
  expect(grassTufts(world, props)).toEqual(tufts);
  for (const t of tufts) {
    expect(world.kind[Math.floor(t.y) * world.size + Math.floor(t.x)]).toBe('grass');
    for (const p of props) expect(Math.hypot(t.x - p.x, t.y - p.y)).toBeGreaterThan(0.5);
    expect(t.size).toBeGreaterThan(0.5);
    expect(t.size).toBeLessThanOrEqual(1.3);
  }
});
