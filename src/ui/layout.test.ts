import { expect, test } from 'bun:test';
import { LAYOUT } from './layout';

test('the help line says how to eat, sleep and make', () => {
  expect(LAYOUT).toContain(
    'click the ground to walk · click an object for its actions · click the survivor to eat, sleep and make · wheel to zoom',
  );
});
