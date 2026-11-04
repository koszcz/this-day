// Walking: stays on land and bumps into trees, rocks and bushes.
import { hypot } from '../math/exact';
import { isWalkable, tileAt } from '../world/query';
import type { GameState } from './state';
import { speedPenalty } from './weight';
import { walkFactor } from './wounds';

export const WALK_SPEED = 4;
const BLOCK_RADIUS = 0.38;

function blocked(state: GameState, x: number, y: number): boolean {
  if (!isWalkable(state.world, x, y)) return true;
  return state.props.some((p) => (p.amount > 0 || p.kind === 'bush') && hypot(p.x - x, p.y - y) < BLOCK_RADIUS);
}

// Moves toward (dx, dy) in tiles, sliding along obstacles one axis at a time.
export function moveBy(state: GameState, dx: number, dy: number) {
  if (state.busy || state.sleeping || state.dead) return;
  const slow = tileAt(state.world, state.player.x, state.player.y) === 'shallow' ? 0.6 : 1;
  const load = speedPenalty(state.inventory) * walkFactor(state);
  const { x, y } = state.player;
  if (!blocked(state, x + dx * slow * load, y)) state.player.x = x + dx * slow * load;
  if (!blocked(state, state.player.x, y + dy * slow * load)) state.player.y = y + dy * slow * load;
}
