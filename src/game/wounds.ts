// Wounds: a slip on rock or a spear thrust can make you bleed or sprain an ankle. Rest or a bandage treats it.
import { count, removeItem } from './items';
import { roll } from './random';
import { say, type GameState } from './state';

export type WoundKind = 'bleeding' | 'sprain';

export interface Wound {
  kind: WoundKind;
  // Game minutes until it heals by itself. Sleeping heals it faster.
  left: number;
}

// Chance that gathering stone or fishing with a spear hurts you.
export const WOUND_CHANCE = 0.12;
export const HEAL_MINUTES: Record<WoundKind, number> = { bleeding: 240, sprain: 360 };
export const SLEEP_HEAL_FACTOR = 3;
// Health lost per game minute while bleeding.
export const BLEED_DRAIN = 0.06;
// Walking speed while sprained.
export const SPRAIN_SPEED = 0.6;

const TEXT: Record<WoundKind, string> = {
  bleeding: 'You cut yourself. The wound is bleeding.',
  sprain: 'You twist your ankle. Walking hurts.',
};

// Rolls for an injury. Does nothing when you are already hurt.
export function maybeWound(state: GameState, chance = WOUND_CHANCE) {
  if (state.wound || roll(state) >= chance) return;
  const kind: WoundKind = roll(state) < 0.5 ? 'bleeding' : 'sprain';
  state.wound = { kind, left: HEAL_MINUTES[kind] };
  say(state, TEXT[kind]);
}

export const isBleeding = (state: GameState) => state.wound?.kind === 'bleeding';

export const walkFactor = (state: GameState) => (state.wound?.kind === 'sprain' ? SPRAIN_SPEED : 1);

export function tickWound(state: GameState, minutes: number) {
  const w = state.wound;
  if (!w) return;
  w.left -= minutes * (state.sleeping ? SLEEP_HEAL_FACTOR : 1);
  if (w.left <= 0) {
    state.wound = null;
    say(state, w.kind === 'bleeding' ? 'The bleeding stops on its own.' : 'Your ankle feels better.');
  }
}

export const canBandage = (state: GameState) => state.wound !== null && count(state.inventory, 'bandage') > 0;

// Uses one bandage to treat the wound.
export function bandageWound(state: GameState) {
  if (!state.wound || !removeItem(state.inventory, 'bandage')) return;
  say(state, state.wound.kind === 'bleeding' ? 'You bind the cut. The bleeding stops.' : 'You bind your ankle. It holds.');
  state.wound = null;
}

// Saves from before wounds have none.
export function ensureWound(state: GameState) {
  state.wound ??= null;
}
