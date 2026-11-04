// Runs the player's orders: walk to a point, do an errand on an object, and move the clock on.
import { hypot } from '../math/exact';
import { startAction } from './actions';
import { errandStep, type Errand } from './interact';
import { moveBy, WALK_SPEED } from './movement';
import { say, type GameState } from './state';
import { advance } from './step';
import { unstick } from './unstick';
import { GAME_MINUTES_PER_SECOND, SLEEP_SPEEDUP } from './time';

// What the player told the survivor to do: a point to walk to, and an action to do on an object.
export interface Driver {
  target: { x: number; y: number } | null;
  errand: Errand | null;
}

export const newDriver = (): Driver => ({ target: null, errand: null });

// One slice of play. `seconds` is real time: the survivor walks and the game clock moves on.
export function tick(state: GameState, driver: Driver, seconds: number) {
  if (state.dead) return;
  const dir = { x: 0, y: 0 };
  const free = !state.busy && !state.sleeping;
  if (free) unstick(state);
  if (driver.errand && free) {
    const step = errandStep(state, driver.errand);
    if (step.kind === 'walk') driver.target = step;
    else {
      if (step.kind === 'arrive' && !startAction(state, driver.errand.action)) say(state, 'You cannot do that right now.');
      driver.errand = null;
      driver.target = null;
    }
  }
  if (driver.target) {
    const dx = driver.target.x - state.player.x;
    const dy = driver.target.y - state.player.y;
    const d = hypot(dx, dy);
    if (d < 0.1) driver.target = null;
    else (dir.x = dx / d), (dir.y = dy / d);
  }
  if (state.busy || state.sleeping) driver.target = null;
  moveBy(state, dir.x * WALK_SPEED * seconds, dir.y * WALK_SPEED * seconds);
  advance(state, seconds * GAME_MINUTES_PER_SECOND * (state.sleeping ? SLEEP_SPEEDUP : 1));
}
