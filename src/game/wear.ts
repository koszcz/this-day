// Tool wear: the axe and spear break after a fixed number of uses.
import { ITEMS, count, removeItem, type ItemId } from './items';
import { say, type GameState } from './state';

export type ToolId = Extract<ItemId, 'axe' | 'spear'>;

export const TOOL_USES: Record<ToolId, number> = { axe: 20, spear: 12 };

export const isTool = (id: ItemId): id is ToolId => id in TOOL_USES;

// Uses left on a tool you carry. Zero when you do not carry it.
export function usesLeft(state: GameState, id: ToolId): number {
  return count(state.inventory, id) > 0 ? state.toolUses[id] ?? TOOL_USES[id] : 0;
}

// A new tool starts at full strength.
export function freshTool(state: GameState, id: ToolId) {
  state.toolUses[id] = TOOL_USES[id];
}

// Spends one use. The tool breaks when none are left.
export function wearTool(state: GameState, id: ToolId) {
  if (count(state.inventory, id) === 0) return;
  const left = usesLeft(state, id) - 1;
  state.toolUses[id] = left;
  if (left <= 0) {
    removeItem(state.inventory, id);
    say(state, `Your ${ITEMS[id].name.toLowerCase()} breaks.`);
  }
}

// Saves from before tool wear have no use counts: carried tools count as full strength.
export function ensureWear(state: GameState) {
  state.toolUses ??= {};
}
