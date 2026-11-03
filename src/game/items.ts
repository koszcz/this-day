// Everything you can carry, and what eating it does.
export type ItemId = 'wood' | 'stone' | 'berries' | 'rawFish' | 'cookedFish' | 'axe' | 'spear';

export interface ItemDef {
  name: string;
  icon: string;
  // Present on food: how much hunger it restores and the chance it makes you sick.
  food?: { hunger: number; sickChance: number };
}

export const ITEMS: Record<ItemId, ItemDef> = {
  wood: { name: 'Wood', icon: '🪵' },
  stone: { name: 'Stone', icon: '🪨' },
  berries: { name: 'Berries', icon: '🫐', food: { hunger: 8, sickChance: 0.03 } },
  rawFish: { name: 'Raw fish', icon: '🐟', food: { hunger: 22, sickChance: 0.3 } },
  cookedFish: { name: 'Cooked fish', icon: '🍖', food: { hunger: 40, sickChance: 0 } },
  axe: { name: 'Stone axe', icon: '🪓' },
  spear: { name: 'Spear', icon: '🔱' },
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
