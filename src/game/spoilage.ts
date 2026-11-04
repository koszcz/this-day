// Food freshness: every unit of perishable food remembers when you got it, and rots after a while.
import { ITEMS, count, removeItem, type ItemId } from './items';
import { say, type GameState } from './state';

const PERISHABLE = (Object.keys(ITEMS) as ItemId[]).filter((id) => ITEMS[id].spoilsAfter !== undefined);

// Saves from before spoilage have no freshness data: carried food counts as picked just now.
export function ensureFood(state: GameState) {
  state.born ??= {};
}

// Keeps one birth time per unit carried. Units added since last time are new now.
// Units that left without a call here are assumed to be the oldest.
export function syncFood(state: GameState) {
  ensureFood(state);
  for (const id of PERISHABLE) {
    const times = (state.born[id] ??= []);
    const n = count(state.inventory, id);
    while (times.length < n) times.push(state.time);
    if (times.length > n) times.splice(0, times.length - n);
  }
}

const rotAt = (id: ItemId, born: number) => born + (ITEMS[id].spoilsAfter ?? Infinity);

// Birth times of the units you carry, oldest first. Units not yet counted are new.
function births(state: GameState, id: ItemId): number[] {
  const times = [...(state.born?.[id] ?? [])];
  const n = count(state.inventory, id);
  while (times.length < n) times.push(state.time);
  return times.slice(times.length - n);
}

export const rottenCount = (state: GameState, id: ItemId) => births(state, id).filter((b) => state.time >= rotAt(id, b)).length;

export const freshCount = (state: GameState, id: ItemId) => count(state.inventory, id) - rottenCount(state, id);

// Whole hours until the oldest fresh unit rots, rounded up. Null when nothing fresh can rot.
export function hoursUntilRot(state: GameState, id: ItemId): number | null {
  if (ITEMS[id].spoilsAfter === undefined) return null;
  const left = births(state, id)
    .map((b) => rotAt(id, b) - state.time)
    .filter((m) => m > 0);
  return left.length ? Math.ceil(Math.min(...left) / 60) : null;
}

// Takes one unit out of the pack and says whether it was rotten. Null when no unit fits.
// Eating takes the freshest unit. Cooking takes the oldest fresh one. Throwing away takes a rotten one.
export function takeUnit(state: GameState, id: ItemId, pick: 'freshest' | 'oldestFresh' | 'rotten'): boolean | null {
  syncFood(state);
  const times = state.born[id] ?? [];
  const rotten = (b: number) => state.time >= rotAt(id, b);
  let index = -1;
  if (pick === 'freshest') index = times.length - 1;
  else if (pick === 'oldestFresh') index = times.findIndex((b) => !rotten(b));
  else index = times.findIndex(rotten);
  if (index < 0 || !removeItem(state.inventory, id)) return null;
  const wasRotten = rotten(times[index]);
  times.splice(index, 1);
  return wasRotten;
}

// Announces food that went off during the last `minutes`.
export function tickSpoilage(state: GameState, minutes: number) {
  syncFood(state);
  for (const id of PERISHABLE) {
    const turned = (state.born[id] ?? []).filter((b) => state.time >= rotAt(id, b) && state.time - minutes < rotAt(id, b)).length;
    if (turned > 0) say(state, `${turned > 1 ? 'Some of your' : 'Your'} ${ITEMS[id].name.toLowerCase()} has rotted.`);
  }
}
