import { expect, test } from 'bun:test';
import { MOTE_COUNT, driftOf, edgeMist, skyEnds } from './atmosphere-math';

test('mist is thick at the map edge and gone well inside the island', () => {
  expect(edgeMist(0, 36, 72)).toBeGreaterThan(0.5);
  expect(edgeMist(36, 0, 72)).toBeGreaterThan(0.5);
  expect(edgeMist(36, 36, 72)).toBe(0);
  expect(edgeMist(20, 36, 72)).toBe(0);
});

test('mist grows toward the edge and stays between 0 and 1', () => {
  let last = -1;
  for (let x = 20; x >= 0; x--) {
    const m = edgeMist(x, 36, 72);
    expect(m).toBeGreaterThanOrEqual(last);
    expect(m).toBeLessThanOrEqual(1);
    last = m;
  }
});

test('the sky is brighter at the horizon than at the top', () => {
  const { top, horizon } = skyEnds({ r: 0.4, g: 0.6, b: 0.8 });
  expect(horizon.r + horizon.g + horizon.b).toBeGreaterThan(top.r + top.g + top.b);
  for (const c of [top, horizon]) for (const v of [c.r, c.g, c.b]) expect(v).toBeLessThanOrEqual(1);
});

test('drift moves a speck over time and keeps it inside the area around the player', () => {
  const a = driftOf(3, 0);
  const b = driftOf(3, 2);
  expect(a.x === b.x && a.y === b.y && a.z === b.z).toBe(false);
  for (let i = 0; i < MOTE_COUNT; i++) {
    for (let t = 0; t < 60; t += 7) {
      const p = driftOf(i, t);
      expect(Math.abs(p.x)).toBeLessThanOrEqual(13);
      expect(Math.abs(p.z)).toBeLessThanOrEqual(13);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(7);
    }
  }
});

test('specks start in different places', () => {
  const seen = new Set<string>();
  for (let i = 0; i < MOTE_COUNT; i++) {
    const p = driftOf(i, 0);
    seen.add(`${p.x.toFixed(2)},${p.z.toFixed(2)}`);
  }
  expect(seen.size).toBe(MOTE_COUNT);
});
