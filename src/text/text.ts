// Looks up text by key in the current language, and fills in {name} values.
import type { ItemId } from '../game/items';
import type { SkillId } from '../game/skills';
import { EN, type Table, type TextKey } from './en';

export type Params = Record<string, string | number>;

// Every language the game has, by code. A new language is one more table here.
export const LANGUAGES: Record<string, Table> = { en: EN };

let current: Table = EN;

export function setLanguage(code: string) {
  if (LANGUAGES[code]) current = LANGUAGES[code];
}

export function translate(table: Table, key: TextKey, params: Params = {}): string {
  return table[key].replace(/\{(\w+)\}/g, (whole, name: string) => (name in params ? String(params[name]) : whole));
}

export const t = (key: TextKey, params?: Params): string => translate(current, key, params);

export const itemName = (id: ItemId): string => t(`item.${id}`);
export const skillName = (id: SkillId): string => t(`skill.${id}`);
export const recipeName = (id: string): string => t(`recipe.${id}.name` as TextKey);
export const recipeBlurb = (id: string): string => t(`recipe.${id}.blurb` as TextKey);

// A prop, structure or animal kind as it reads in a sentence. An unknown kind reads as itself.
export const nounName = (kind: string): string => (`noun.${kind}` in current ? t(`noun.${kind}` as TextKey) : kind);

// A name in the middle of a sentence is lower case.
export const lower = (s: string): string => s.toLowerCase();
