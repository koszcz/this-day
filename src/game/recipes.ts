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
  { id: 'axe', name: 'Stone axe', icon: '🪓', cost: { wood: 2, stone: 2 }, minutes: 25, makes: { item: 'axe' }, blurb: 'Chop wood much faster.' },
  { id: 'spear', name: 'Spear', icon: '🔱', cost: { wood: 2, stone: 1 }, minutes: 20, makes: { item: 'spear' }, blurb: 'Lets you fish in the water.' },
  { id: 'shelter', name: 'Lean-to', icon: '⛺', cost: { wood: 8 }, minutes: 45, makes: { structure: 'shelter' }, blurb: 'Keeps you warmer and rests you better.' },
];
