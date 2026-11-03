// Campfires and shelters you build, and how close you are to them.
import { hypot } from '../math/exact';
import type { GameState, Structure } from './state';

export const FIRE_WARM_RADIUS = 3.5;
export const SHELTER_RADIUS = 2.2;
export const FIRE_MAX_FUEL = 480;

export function addStructure(state: GameState, kind: Structure['kind'], fuel = 0): Structure {
  const s: Structure = { id: state.structures.length + 1, kind, x: state.player.x, y: state.player.y, fuel };
  state.structures.push(s);
  return s;
}

export function nearest(state: GameState, kind: Structure['kind'], reach: number): Structure | undefined {
  let best: Structure | undefined;
  let bestDist = reach;
  for (const s of state.structures) {
    if (s.kind !== kind) continue;
    const d = hypot(s.x - state.player.x, s.y - state.player.y);
    if (d <= bestDist) {
      best = s;
      bestDist = d;
    }
  }
  return best;
}

export const isSheltered = (state: GameState) => nearest(state, 'shelter', SHELTER_RADIUS) !== undefined;

export const litFireNear = (state: GameState, reach: number) => {
  const fire = nearest(state, 'fire', reach);
  return fire !== undefined && fire.fuel > 0 ? fire : undefined;
};

export function burnFires(state: GameState, minutes: number) {
  for (const s of state.structures) if (s.kind === 'fire' && s.fuel > 0) s.fuel = Math.max(0, s.fuel - minutes);
}
