import { describe, expect, test } from 'bun:test';
import { blendPose, computePose, idlePose, restPose, sleepPose, walkPose } from './pose';

describe('walk pose', () => {
  test('legs swing in opposite directions', () => {
    const p = walkPose(0.1);
    expect(p.legL.x).toBeCloseTo(-p.legR.x, 10);
    expect(p.legL.x).not.toBe(0);
  });
  test('arms swing against the legs on the same side', () => {
    const p = walkPose(0.1);
    expect(Math.sign(p.armL.x)).toBe(-Math.sign(p.legL.x));
    expect(Math.sign(p.armR.x)).toBe(-Math.sign(p.legR.x));
  });
  test('legs are straight at the start of a stride', () => {
    expect(walkPose(0).legL.x).toBe(0);
  });
  test('the swing never passes its limit', () => {
    for (let t = 0; t < 3; t += 0.05) expect(Math.abs(walkPose(t).legL.x)).toBeLessThanOrEqual(0.7);
  });
  test('the body bobs upward only', () => {
    for (let t = 0; t < 3; t += 0.05) expect(walkPose(t).rootY).toBeGreaterThanOrEqual(0);
  });
});

describe('idle pose', () => {
  test('legs stay still', () => {
    const p = idlePose(1.3);
    expect(p.legL.x).toBe(0);
    expect(p.legR.x).toBe(0);
  });
  test('the chest breathes in and out', () => {
    const xs = [0, 0.4, 0.9, 1.4, 2, 2.6].map((t) => idlePose(t).torso.x);
    expect(Math.max(...xs)).toBeGreaterThan(0);
    expect(Math.min(...xs)).toBeLessThan(0);
  });
  test('breathing is small', () => {
    for (let t = 0; t < 5; t += 0.1) expect(Math.abs(idlePose(t).torso.x)).toBeLessThanOrEqual(0.03);
  });
});

describe('sleep pose', () => {
  test('lies flat and slightly raised', () => {
    const p = sleepPose(0);
    expect(p.rootTilt).toBeCloseTo(Math.PI / 2, 10);
    expect(p.rootY).toBe(0.2);
  });
  test('arms and legs lie out, spread slightly to the sides', () => {
    const p = sleepPose(0);
    expect(p.armL.z).toBeGreaterThan(0.3);
    expect(p.armR.z).toBeLessThan(-0.3);
    expect(p.legL.z).toBeGreaterThan(0.1);
    expect(p.legR.z).toBeLessThan(-0.1);
    for (const j of [p.armL, p.armR, p.legL, p.legR]) expect(j.x).toBe(0);
  });
});

describe('computePose', () => {
  test('sleeping wins over moving', () => {
    expect(computePose({ moving: true, sleeping: true, elapsed: 1 }).rootTilt).toBeCloseTo(Math.PI / 2, 10);
  });
  test('moving gives the walk pose', () => {
    expect(computePose({ moving: true, sleeping: false, elapsed: 0.2 })).toEqual(walkPose(0.2));
  });
  test('standing gives the idle pose', () => {
    expect(computePose({ moving: false, sleeping: false, elapsed: 0.2 })).toEqual(idlePose(0.2));
  });
});

describe('computePose with an action', () => {
  test('the action pose replaces walking and idling', () => {
    const action = { ...restPose(), rootY: 0.5 };
    expect(computePose({ moving: true, sleeping: false, elapsed: 1, action })).toEqual(action);
    expect(computePose({ moving: false, sleeping: false, elapsed: 1, action })).toEqual(action);
  });
  test('sleeping still wins over an action', () => {
    const action = { ...restPose(), rootY: 0.5 };
    expect(computePose({ moving: false, sleeping: true, elapsed: 1, action }).rootTilt).toBeCloseTo(Math.PI / 2, 10);
  });
});

describe('blendPose', () => {
  test('t = 0 gives the first pose and t = 1 the second', () => {
    const a = walkPose(0.1);
    const b = sleepPose(0);
    expect(blendPose(a, b, 0)).toEqual(a);
    expect(blendPose(a, b, 1)).toEqual(b);
  });
  test('t = 0.5 is halfway', () => {
    const p = blendPose(restPose(), sleepPose(0), 0.5);
    expect(p.rootY).toBeCloseTo(0.1, 10);
  });
});
