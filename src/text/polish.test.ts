import { afterEach, expect, test } from 'bun:test';
import { EN } from './en';
import { chooseLanguage, otherLanguage } from './language';
import { PL } from './pl';
import { getLanguage, pluralForm, setLanguage, t, tn } from './text';

afterEach(() => setLanguage('en'));

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

test('Polish has a text for every English key, with the same values in braces', () => {
  for (const key of Object.keys(EN)) {
    expect(PL[key]).toBeDefined();
    expect(placeholders(PL[key])).toEqual(placeholders(EN[key as keyof typeof EN]));
  }
});

test('Polish has no text that English lacks, except plural forms', () => {
  for (const key of Object.keys(PL)) expect(key in EN || key.endsWith('.few')).toBe(true);
});

test('Polish plural forms: one, few and other', () => {
  const forms = [1, 2, 4, 5, 12, 14, 22, 24, 25, 100, 101, 112].map((n) => pluralForm('pl', n));
  expect(forms).toEqual(['one', 'few', 'few', 'other', 'other', 'other', 'few', 'few', 'other', 'other', 'other', 'other']);
});

test('English plural forms: one and other', () => {
  expect([1, 2, 3, 22].map((n) => pluralForm('en', n))).toEqual(['one', 'other', 'other', 'other']);
});

test('a counted text uses the right form in each language', () => {
  expect(tn('death.lasted', 1, { n: 1 })).toBe('You lasted 1 day.');
  expect(tn('death.lasted', 3, { n: 3 })).toBe('You lasted 3 days.');
  setLanguage('pl');
  expect(tn('thirst.far', 1, { direction: 'w lewo', steps: 1 })).toContain('1 krok stąd');
  expect(tn('thirst.far', 3, { direction: 'w lewo', steps: 3 })).toContain('3 kroki stąd');
  expect(tn('thirst.far', 5, { direction: 'w lewo', steps: 5 })).toContain('5 kroków stąd');
  expect(tn('pack.usesLeft', 22, { n: 22 })).toBe('(zostały 22 użycia)');
});

test('switching to Polish changes the texts, and switching back restores English', () => {
  setLanguage('pl');
  expect(getLanguage()).toBe('pl');
  expect(t('hud.pack')).toBe('Plecak');
  setLanguage('en');
  expect(t('hud.pack')).toBe('Pack');
});

test('the first visit follows the browser language', () => {
  expect(chooseLanguage(null, ['pl-PL', 'en'])).toBe('pl');
  expect(chooseLanguage(null, ['de', 'en-US'])).toBe('en');
  expect(chooseLanguage(null, ['fr'])).toBe('en');
  expect(chooseLanguage(null, [])).toBe('en');
});

test('a saved choice wins over the browser, and an unknown saved value is ignored', () => {
  expect(chooseLanguage('en', ['pl'])).toBe('en');
  expect(chooseLanguage('pl', ['en'])).toBe('pl');
  expect(chooseLanguage('xx', ['pl'])).toBe('pl');
});

test('the toggle goes to the other language', () => {
  expect(otherLanguage('en')).toBe('pl');
  expect(otherLanguage('pl')).toBe('en');
});
