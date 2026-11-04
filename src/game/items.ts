// Everything you can carry, and what eating it does.
export type ItemId = 'wood' | 'stone' | 'berries' | 'rawFish' | 'cookedFish' | 'axe' | 'spear';

export interface ItemDef {
  name: string;
  icon: string;
  // How much it adds to your load.
  weight: number;
  // Present on food: how much hunger it restores and the chance it makes you sick.
  food?: { hunger: number; sickChance: number };
}

export const ITEMS: Record<ItemId, ItemDef> = {
  wood: { name: 'Wood', icon: '🪵', weight: 3 },
  stone: { name: 'Stone', icon: '🪨', weight: 4 },
  berries: { name: 'Berries', icon: '🫐', weight: 1, food: { hunger: 8, sickChance: 0.03 } },
  rawFish: { name: 'Raw fish', icon: '🐟', weight: 2, food: { hunger: 22, sickChance: 0.3 } },
  cookedFish: { name: 'Cooked fish', icon: '🍖', weight: 2, food: { hunger: 40, sickChance: 0 } },
  axe: { name: 'Stone axe', icon: '🪓', weight: 4 },
  spear: { name: 'Spear', icon: '🔱', weight: 3 },
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
