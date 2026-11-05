import { describe, expect, test } from 'bun:test';
import { ARM, BODY, COLORS, HEAD, LEG, handY, heightOf } from './survivor-look';

describe('survivor proportions', () => {
  test('the figure is between four and six heads tall', () => {
    const heads = heightOf() / (HEAD.radius * 2);
    expect(heads).toBeGreaterThan(4);
    expect(heads).toBeLessThan(6);
  });
  test('the hips sit as high as the legs are long, so the boots touch the ground', () => {
    expect(BODY.hipsY).toBeCloseTo(LEG.length + LEG.bootHeight, 10);
  });
  test('the head sits on the neck at the top of the torso', () => {
    expect(HEAD.y).toBeCloseTo(BODY.torsoLength + BODY.neckLength, 10);
  });
  test('the shoulders sit in the upper half of the torso', () => {
    expect(ARM.shoulderY).toBeLessThan(BODY.torsoLength);
    expect(ARM.shoulderY).toBeGreaterThan(BODY.torsoLength / 2);
  });
  test('the legs are set closer together than the width of the hips', () => {
    expect(LEG.offsetX * 2).toBeLessThan(BODY.hipWidth * 2);
  });
  test('the hand is at the end of the arm, and tools hang from it', () => {
    expect(handY()).toBeCloseTo(-(ARM.upper + ARM.lower), 10);
  });
  test('every colour is a hex colour', () => {
    for (const c of Object.values(COLORS)) expect(c).toMatch(/^#[0-9a-f]{6}$/);
  });
  test('boots differ from trousers and hands match the face', () => {
    expect(COLORS.boots).not.toBe(COLORS.trousers);
    expect(COLORS.hands).toBe(COLORS.skin);
  });
});
