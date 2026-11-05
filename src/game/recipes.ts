// What you can build from what you carry.
import type { Inventory, ItemId } from './items';

export interface Recipe {
  id: string;
  icon: string;
  cost: Inventory;
  minutes: number;
  makes: { item: ItemId } | { structure: 'fire' | 'shelter' };
}

export const RECIPES: Recipe[] = [
  { id: 'campfire', icon: '🔥', cost: { wood: 3, stone: 2 }, minutes: 20, makes: { structure: 'fire' } },
  { id: 'cordage', icon: '🪢', cost: { fibre: 3 }, minutes: 15, makes: { item: 'rope' } },
  { id: 'bandage', icon: '🩹', cost: { fibre: 2 }, minutes: 6, makes: { item: 'bandage' } },
  { id: 'stoneHead', icon: '🗿', cost: { stone: 2 }, minutes: 15, makes: { item: 'stoneHead' } },
  { id: 'handle', icon: '🪵', cost: { wood: 1 }, minutes: 8, makes: { item: 'handle' } },
  { id: 'axe', icon: '🪓', cost: { stoneHead: 1, handle: 1, rope: 1 }, minutes: 10, makes: { item: 'axe' } },
  { id: 'spear', icon: '🔱', cost: { stoneHead: 1, handle: 1, rope: 1 }, minutes: 10, makes: { item: 'spear' } },
  { id: 'shelter', icon: '⛺', cost: { wood: 8 }, minutes: 45, makes: { structure: 'shelter' } },
];
