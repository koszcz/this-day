// Everything you can carry, and what eating it does.
export type ItemId = 'wood' | 'stone' | 'berries' | 'rawFish' | 'cookedFish' | 'rawMeat' | 'cookedMeat' | 'axe' | 'spear' | 'tinder' | 'kindling' | 'fibre' | 'rope' | 'bandage' | 'stoneHead' | 'handle';

export interface ItemDef {
  icon: string;
  // How much it adds to your load.
  weight: number;
  // Present on food: how much hunger it restores and the chance it makes you sick.
  food?: { hunger: number; sickChance: number };
  // Game minutes after you get it before it rots. Absent when it never rots.
  spoilsAfter?: number;
}

export const ITEMS: Record<ItemId, ItemDef> = {
  wood: { icon: '🪵', weight: 3 },
  stone: { icon: '🪨', weight: 4 },
  berries: { icon: '🫐', weight: 1, food: { hunger: 8, sickChance: 0.03 }, spoilsAfter: 360 },
  rawFish: { icon: '🐟', weight: 2, food: { hunger: 22, sickChance: 0.3 }, spoilsAfter: 360 },
  cookedFish: { icon: '🍖', weight: 2, food: { hunger: 40, sickChance: 0 }, spoilsAfter: 1440 },
  rawMeat: { icon: '🥩', weight: 3, food: { hunger: 30, sickChance: 0.4 }, spoilsAfter: 360 },
  cookedMeat: { icon: '🍗', weight: 3, food: { hunger: 55, sickChance: 0 }, spoilsAfter: 1440 },
  axe: { icon: '🪓', weight: 4 },
  spear: { icon: '🔱', weight: 3 },
  tinder: { icon: '🌾', weight: 0.5 },
  kindling: { icon: '🥢', weight: 1 },
  fibre: { icon: '🌿', weight: 0.5 },
  rope: { icon: '🪢', weight: 1 },
  bandage: { icon: '🩹', weight: 0.5 },
  stoneHead: { icon: '🗿', weight: 3 },
  handle: { icon: '🪵', weight: 2 },
};

export type Inventory = Partial<Record<ItemId, number>>;

export const count = (inv: Inventory, id: ItemId) => inv[id] ?? 0;

export function addItem(inv: Inventory, id: ItemId, n = 1) {
  inv[id] = count(inv, id) + n;
}

export function removeItem(inv: Inventory, id: ItemId, n = 1): boolean {
  if (count(inv, id) < n) return false;
  inv[id] = count(inv, id) - n;
  return true;
}
