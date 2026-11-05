// Frees a survivor who is stuck inside a bush, tree, rock or the shore, and says so.
import { cos, sin } from '../math/exact';
import { blocked, blockerAt } from './movement';
import { say, type GameState } from './state';
import { nounName, t } from '../text/text';

const RING_STEP = 0.1;
const MAX_RING = 3;
const ANGLES = 16;

export const isWedged = (state: GameState): boolean => blocked(state, state.player.x, state.player.y);

// If she is wedged, moves her to the nearest free spot and tells the player. Returns whether it did.
export function unstick(state: GameState): boolean {
  if (!isWedged(state)) return false;
  const { x, y } = state.player;
  const kind = blockerAt(state, x, y);
  for (let r = RING_STEP; r <= MAX_RING; r += RING_STEP) {
    for (let i = 0; i < ANGLES; i++) {
      const a = (i / ANGLES) * 2 * Math.PI;
      const nx = x + r * cos(a);
      const ny = y + r * sin(a);
      if (blocked(state, nx, ny)) continue;
      state.player.x = nx;
      state.player.y = ny;
      say(state, t('unstick.freed', { what: nounName(kind) }));
      return true;
    }
  }
  return false;
}
