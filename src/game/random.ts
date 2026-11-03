// Draws a random number from the game state, so a saved game keeps rolling the same dice.
import { nextRandom } from '../math/rng';
import type { GameState } from './state';

export function roll(state: GameState): number {
  const r = nextRandom(state.rng);
  state.rng = r.seed;
  return r.value;
}
