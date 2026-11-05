import { expect, test } from 'bun:test';
import { ITEMS } from '../game/items';
import { RECIPES } from '../game/recipes';
import { EN, type Table } from './en';
import { LANGUAGES, itemName, nounName, recipeBlurb, recipeName, setLanguage, skillName, t, translate } from './text';

test('a value in braces is filled in', () => {
  expect(translate(EN, 'gather.got', { n: 2, item: 'wood' })).toBe('You get 2 wood.');
});

test('a value used twice is filled in both times', () => {
  const table: Table = { ...EN, 'action.eat': '{item} and {item}' };
  expect(translate(table, 'action.eat', { item: 'x' })).toBe('x and x');
});

test('a value that is missing stays in braces', () => {
  expect(translate(EN, 'gather.got', { n: 2 })).toBe('You get 2 {item}.');
});

test('a text with no values comes back as it is', () => {
  expect(translate(EN, 'sleep.start')).toBe('You lie down and close your eyes.');
});

test('every item and recipe has an English name', () => {
  for (const id of Object.keys(ITEMS)) expect(itemName(id as keyof typeof ITEMS)).not.toBe(`item.${id}`);
  for (const r of RECIPES) {
    expect(recipeName(r.id)).not.toBe('');
    expect(recipeBlurb(r.id)).not.toBe('');
  }
  expect(skillName('labor')).toBe('Labor');
  expect(itemName('rawFish')).toBe('Raw fish');
});

test('a thing in the world is named, and an unknown name comes back as it is', () => {
  expect(nounName('stone')).toBe('rock');
  expect(nounName('spaceship')).toBe('spaceship');
});

test('the game can switch to another language', () => {
  LANGUAGES.xx = { ...EN, 'sleep.start': 'Dobranoc.' };
  setLanguage('xx');
  expect(t('sleep.start')).toBe('Dobranoc.');
  setLanguage('en');
  expect(t('sleep.start')).toBe('You lie down and close your eyes.');
  delete LANGUAGES.xx;
});

test('an unknown language is ignored', () => {
  setLanguage('zz');
  expect(t('sleep.start')).toBe('You lie down and close your eyes.');
});
