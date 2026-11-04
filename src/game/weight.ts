// Carry weight: every item has a weight, the pack has a limit, and a heavy load slows and tires you.
import { ITEMS, count, type Inventory, type ItemId } from './items';

export const MAX_LOAD = 40;
// Below this load you feel nothing. Above it you slow down and tire faster.
export const HEAVY_FROM = 20;
const MIN_SPEED = 0.6;
const MAX_EXTRA_DRAIN = 0.5;

export function carryLoad(inv: Inventory): number {
  return (Object.keys(inv) as ItemId[]).reduce((sum, id) => sum + count(inv, id) * ITEMS[id].weight, 0);
}

// 0 when the load is light, 1 when the pack is full.
export function encumbrance(inv: Inventory): number {
  return Math.max(0, Math.min(1, (carryLoad(inv) - HEAVY_FROM) / (MAX_LOAD - HEAVY_FROM)));
}

export const speedPenalty = (inv: Inventory) => 1 - (1 - MIN_SPEED) * encumbrance(inv);

export const drainFactor = (inv: Inventory) => 1 + MAX_EXTRA_DRAIN * encumbrance(inv);

export const canCarry = (inv: Inventory, id: ItemId, n = 1) => carryLoad(inv) + ITEMS[id].weight * n <= MAX_LOAD;
