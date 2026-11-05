// Tells a thirsty survivor which way the nearest water lies, as it appears on the screen.
import { hypot } from '../math/exact';
import { isWater, waterNear } from '../world/query';
import { say, type GameState } from './state';
import { t, tn } from '../text/text';

// Thirst levels that trigger a hint when thirst falls through them.
export const THIRST_HINTS = [30, 10];

// tan of 22.5 degrees: the edge between a straight and a diagonal direction.
const EDGE = 0.4142;

// The nearest water tile centre, as a step from the player. Null when the map has no water.
export function nearestWater(state: GameState): { dx: number; dy: number } | null {
  const { world, player } = state;
  let best: { dx: number; dy: number } | null = null;
  let bestDist = Infinity;
  for (let ty = 0; ty < world.size; ty++) {
    for (let tx = 0; tx < world.size; tx++) {
      if (!isWater(world, tx, ty)) continue;
      const dx = tx + 0.5 - player.x;
      const dy = ty + 0.5 - player.y;
      const d = hypot(dx, dy);
      if (d < bestDist) {
        bestDist = d;
        best = { dx, dy };
      }
    }
  }
  return best;
}

// The camera looks along -x and -y, so screen right is +x -y and screen up is -x -y.
export function screenDirection(dx: number, dy: number): string {
  const right = dx - dy;
  const up = -dx - dy;
  const ar = Math.abs(right);
  const au = Math.abs(up);
  const vertical = t(up > 0 ? 'dir.up' : 'dir.down');
  const horizontal = t(right > 0 ? 'dir.right' : 'dir.left');
  if (au < ar * EDGE) return horizontal;
  if (ar < au * EDGE) return vertical;
  return t('dir.diagonal', { vertical, horizontal });
}

export const crossedThirstHint = (before: number, after: number): boolean =>
  THIRST_HINTS.some((level) => before > level && after <= level);

// Says where the nearest water is.
export function pointToWater(state: GameState) {
  if (waterNear(state.world, state.player.x, state.player.y)) {
    say(state, t('thirst.here'));
    return;
  }
  const w = nearestWater(state);
  if (!w) return;
  const steps = Math.round(hypot(w.dx, w.dy));
  say(state, tn('thirst.far', steps, { direction: screenDirection(w.dx, w.dy), steps }));
}
