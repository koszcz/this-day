// What you can build from what you carry.
import type { Inventory, ItemId } from './items';

export interface Recipe {
  id: string;
  name: string;
  icon: string;
  cost: Inventory;
  minutes: number;
  makes: { item: ItemId } | { structure: 'fire' | 'shelter' };
  blurb: string;
}

export const RECIPES: Recipe[] = [
  { id: 'campfire', name: 'Campfire', icon: '🔥', cost: { wood: 3, stone: 2 }, minutes: 20, makes: { structure: 'fire' }, blurb: 'Warmth, light and a way to cook. Light it with tinder and kindling.' },
  { id: 'cordage', name: 'Cordage', icon: '🪢', cost: { fibre: 3 }, minutes: 15, makes: { item: 'rope' }, blurb: 'Twist plant fibre into rope.' },
  { id: 'bandage', name: 'Bandage', icon: '🩹', cost: { fibre: 2 }, minutes: 6, makes: { item: 'bandage' }, blurb: 'Binds a cut or a sprain.' },
  { id: 'stoneHead', name: 'Stone head', icon: '🗿', cost: { stone: 2 }, minutes: 15, makes: { item: 'stoneHead' }, blurb: 'Chip a stone to an edge. Part of an axe or a spear.' },
  { id: 'handle', name: 'Handle', icon: '🪵', cost: { wood: 1 }, minutes: 8, makes: { item: 'handle' }, blurb: 'Trim a branch into a shaft. Part of an axe or a spear.' },
  { id: 'axe', name: 'Stone axe', icon: '🪓', cost: { stoneHead: 1, handle: 1, rope: 1 }, minutes: 10, makes: { item: 'axe' }, blurb: 'Lash a stone head to a handle. Chops wood much faster.' },
  { id: 'spear', name: 'Spear', icon: '🔱', cost: { stoneHead: 1, handle: 1, rope: 1 }, minutes: 10, makes: { item: 'spear' }, blurb: 'Lash a stone head to a handle. Lets you fish in the water.' },
  { id: 'shelter', name: 'Lean-to', icon: '⛺', cost: { wood: 8 }, minutes: 45, makes: { structure: 'shelter' }, blurb: 'Keeps you warmer and rests you better.' },
];
