import { expect, test } from 'bun:test';
import { placeMenu } from './menu-place';

const screen = { width: 1000, height: 600 };

test('the menu opens just right of and above the click', () => {
  expect(placeMenu(100, 200, { width: 150, height: 100 }, screen)).toEqual({ left: 116, top: 184 });
});

test('a click near the bottom moves the menu up so it is not cut off', () => {
  const p = placeMenu(100, 590, { width: 150, height: 200 }, screen);
  expect(p.top + 200).toBeLessThanOrEqual(600 - 8);
});

test('a click near the right edge moves the menu left', () => {
  const p = placeMenu(990, 100, { width: 150, height: 100 }, screen);
  expect(p.left + 150).toBeLessThanOrEqual(1000 - 8);
});

test('a click near the top or left keeps the menu inside the margin', () => {
  expect(placeMenu(0, 0, { width: 150, height: 100 }, screen)).toEqual({ left: 16, top: 8 });
});

test('a menu taller than the screen starts at the top margin', () => {
  expect(placeMenu(50, 300, { width: 150, height: 900 }, screen).top).toBe(8);
});
