// What the mouse is over: your character, a prop, a fire or lean-to, or a water tile.
import { hypot } from '../math/exact';
import { isWater } from '../world/query';
import type { PropKind } from '../world/types';
import type { GameState } from './state';

export type HoverTarget =
  | { kind: 'player' }
  | { kind: 'prop'; id: number }
  | { kind: 'structure'; id: number }
  | { kind: 'animal'; id: number }
  | { kind: 'water'; x: number; y: number };

const PROP_RADIUS: Record<PropKind, number> = { tree: 0.6, bush: 0.5, stone: 0.45 };
const STRUCTURE_RADIUS = { fire: 0.6, shelter: 1 };
const PLAYER_RADIUS = 0.45;
const ANIMAL_RADIUS = { deer: 0.6, hare: 0.4 };

// The object under a ground point. The closest one wins, measured against its own radius.
export function pickObject(state: GameState, x: number, y: number): HoverTarget | null {
  let best: HoverTarget | null = null;
  let bestScore = 1;
  const consider = (target: HoverTarget, ox: number, oy: number, radius: number) => {
    const score = hypot(x - ox, y - oy) / radius;
    if (score < bestScore) {
      best = target;
      bestScore = score;
    }
  };
  consider({ kind: 'player' }, state.player.x, state.player.y, PLAYER_RADIUS);
  for (const p of state.props) if (p.amount > 0) consider({ kind: 'prop', id: p.id }, p.x, p.y, PROP_RADIUS[p.kind]);
  for (const s of state.structures) consider({ kind: 'structure', id: s.id }, s.x, s.y, STRUCTURE_RADIUS[s.kind]);
  for (const a of state.animals) consider({ kind: 'animal', id: a.id }, a.x, a.y, ANIMAL_RADIUS[a.kind]);
  return best;
}

export function pickWater(state: GameState, x: number, y: number): HoverTarget | null {
  if (!isWater(state.world, x, y)) return null;
  return { kind: 'water', x: Math.floor(x), y: Math.floor(y) };
}

export const sameTarget = (a: HoverTarget | null, b: HoverTarget | null) => JSON.stringify(a) === JSON.stringify(b);
