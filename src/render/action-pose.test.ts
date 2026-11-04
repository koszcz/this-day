import { describe, expect, test } from 'bun:test';
import { actionKind, actionPose, RATE, type ActionKind } from './action-pose';
import { restPose } from './pose';

const KINDS = Object.keys(RATE) as ActionKind[];

describe('actionKind', () => {
  test('maps the gathering actions', () => {
    expect(actionKind('chop')).toBe('chop');
    expect(actionKind('mine')).toBe('mine');
    expect(actionKind('forage')).toBe('pick');
    expect(actionKind('tinder')).toBe('pick');
    expect(actionKind('fibre')).toBe('pick');
    expect(actionKind('kindling')).toBe('pick');
  });
  test('maps water and spear actions', () => {
    expect(actionKind('drink')).toBe('drink');
    expect(actionKind('fish')).toBe('spear');
  });
  test('maps the fire actions to tending', () => {
    for (const id of ['fuel', 'light', 'cook', 'cookMeat', 'boil']) expect(actionKind(id)).toBe('tend');
  });
  test('maps eating, crafting and bandaging', () => {
    expect(actionKind('eat:berries')).toBe('eat');
    expect(actionKind('discard:rawFish')).toBe('pick');
    expect(actionKind('craft:axe')).toBe('craft');
    expect(actionKind('bandage')).toBe('bandage');
  });
  test('gives nothing for no action, sleep and unknown ids', () => {
    expect(actionKind(null)).toBeNull();
    expect(actionKind(undefined)).toBeNull();
    expect(actionKind('sleep')).toBeNull();
    expect(actionKind('nope')).toBeNull();
  });
});

describe('actionPose', () => {
  test('every kind differs from the rest pose', () => {
    for (const k of KINDS) expect(actionPose(k, 0.3)).not.toEqual(restPose());
  });
  test('every kind moves over time', () => {
    for (const k of KINDS) expect(actionPose(k, 0.1)).not.toEqual(actionPose(k, 0.4));
  });
  test('every kind repeats the same way each cycle', () => {
    for (const k of KINDS) {
      const a = actionPose(k, 0.2);
      const b = actionPose(k, 0.2 + (2 * Math.PI) / RATE[k]);
      expect(b.armR.x).toBeCloseTo(a.armR.x, 8);
      expect(b.torso.x).toBeCloseTo(a.torso.x, 8);
    }
  });
  test('chopping swings the arms over the head, then down', () => {
    const xs = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6].map((t) => actionPose('chop', t).armR.x);
    expect(Math.min(...xs)).toBeLessThan(-2);
    expect(Math.max(...xs)).toBeGreaterThan(-1);
  });
  test('picking bends the torso forward', () => {
    expect(actionPose('pick', 0).torso.x).toBeGreaterThan(0.5);
  });
  test('drinking crouches low', () => {
    expect(actionPose('drink', 0).rootY).toBeLessThan(-0.1);
  });
  test('eating lifts the hand toward the mouth', () => {
    const lifts = [0, 0.3, 0.6, 0.9, 1.2].map((t) => actionPose('eat', t).armR.x);
    expect(Math.min(...lifts)).toBeLessThan(-1.8);
  });
  test('the body stays upright for every action', () => {
    for (const k of KINDS) expect(actionPose(k, 0.5).rootTilt).toBe(0);
  });
});
