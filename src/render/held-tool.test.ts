import { describe, expect, test } from 'bun:test';
import { heldTool } from './held-tool';

const both = { axe: true, spear: true };
const none = { axe: false, spear: false };

describe('heldTool', () => {
  test('holds nothing with an empty pack', () => {
    expect(heldTool(none, null, false)).toBeNull();
  });
  test('carries the spear first, then the axe', () => {
    expect(heldTool(both, null, false)).toBe('spear');
    expect(heldTool({ axe: true, spear: false }, null, false)).toBe('axe');
    expect(heldTool({ axe: false, spear: true }, null, false)).toBe('spear');
  });
  test('chopping takes the axe even when the spear is carried', () => {
    expect(heldTool(both, 'chop', false)).toBe('axe');
  });
  test('chopping without an axe holds nothing', () => {
    expect(heldTool({ axe: false, spear: true }, 'chop', false)).toBeNull();
  });
  test('fishing and hunting take the spear', () => {
    expect(heldTool(both, 'fish', false)).toBe('spear');
    expect(heldTool(both, 'hunt:3', false)).toBe('spear');
    expect(heldTool({ axe: true, spear: false }, 'fish', false)).toBeNull();
  });
  test('other actions keep the hands free', () => {
    for (const id of ['forage', 'drink', 'cook', 'eat:berries', 'craft:axe', 'mine']) expect(heldTool(both, id, false)).toBeNull();
  });
  test('sleeping holds nothing', () => {
    expect(heldTool(both, null, true)).toBeNull();
    expect(heldTool(both, 'chop', true)).toBeNull();
  });
});
