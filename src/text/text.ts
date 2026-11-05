// Looks up text by key in the current language, and fills in {name} values.
import type { ItemId } from '../game/items';
import type { SkillId } from '../game/skills';
import { EN, type Table, type TextKey } from './en';
import { PL } from './pl';

export type Params = Record<string, string | number>;

// Every language the game has, by code. A new language is one more table here.
export const LANGUAGES: Record<string, Table> = { en: EN, pl: PL };

let current: Table = EN;
let currentCode = 'en';

export function setLanguage(code: string) {
  if (LANGUAGES[code]) {
    current = LANGUAGES[code];
    currentCode = code;
  }
}

export const getLanguage = (): string => currentCode;

// Which plural form a number takes. English: one or other. Polish: one, few (2-4, 22-24, ...) or other.
export function pluralForm(code: string, n: number): 'one' | 'few' | 'other' {
  if (n === 1) return 'one';
  if (code === 'pl') {
    const last = n % 10;
    const lastTwo = n % 100;
    if (last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return 'few';
  }
  return 'other';
}

export function translate(table: Table, key: TextKey, params: Params = {}): string {
  return table[key].replace(/\{(\w+)\}/g, (whole, name: string) => (name in params ? String(params[name]) : whole));
}

export const t = (key: TextKey, params?: Params): string => translate(current, key, params);

// A text that depends on a number. The table holds 'key.one', 'key.other' and, in Polish, 'key.few'.
export function tn(key: string, n: number, params?: Params): string {
  const form = pluralForm(currentCode, n);
  const found = `${key}.${form}` in current ? form : 'other';
  return translate(current, `${key}.${found}` as TextKey, params);
}

export const itemName = (id: ItemId): string => t(`item.${id}`);
export const skillName = (id: SkillId): string => t(`skill.${id}`);
export const recipeName = (id: string): string => t(`recipe.${id}.name` as TextKey);
export const recipeBlurb = (id: string): string => t(`recipe.${id}.blurb` as TextKey);

// A prop, structure or animal kind as it reads in a sentence. An unknown kind reads as itself.
export const nounName = (kind: string): string => (`noun.${kind}` in current ? t(`noun.${kind}` as TextKey) : kind);

// A name in the middle of a sentence is lower case.
export const lower = (s: string): string => s.toLowerCase();
