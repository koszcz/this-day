import { expect, test } from 'bun:test';
import { layout } from './layout';

test('the help line says how to eat, sleep and make', () => {
  expect(layout()).toContain(
    'click the ground to walk · click an object for its actions · click the survivor to eat, sleep and make · wheel to zoom',
  );
});
