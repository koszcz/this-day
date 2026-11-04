// Runs the player's orders: walk to a point, do an errand on an object, and move the clock on.
import { hypot } from '../math/exact';
import { isRefused, startAction } from './actions';
import { errandStep, type Errand } from './interact';
import { moveBy, WALK_SPEED } from './movement';
import { cannotReach, findDetour } from './stall';
import { say, type GameState } from './state';
import { advance } from './step';
import { unstick } from './unstick';
import { GAME_MINUTES_PER_SECOND, SLEEP_SPEEDUP } from './time';

type Point = { x: number; y: number };

// What the player told the survivor to do: a point to walk to, and an action to do on an object.
export interface Driver {
  target: Point | null;
  errand: Errand | null;
  // A near spot she steps to first when the straight way is blocked, the errand it was tried for,
  // and how many seconds she has pushed without moving.
  detour: Point | null;
  detoured: Errand | null;
  stalled: number;
}

export const newDriver = (): Driver => ({ target: null, errand: null, detour: null, detoured: null, stalled: 0 });

const STALL_SECONDS = 0.5;

// She pushed against something and did not move. Try one detour for the errand, else say why and give up.
function handleStall(state: GameState, driver: Driver, dir: Point) {
  driver.stalled = 0;
  if (driver.errand && !driver.detour && driver.detoured !== driver.errand) {
    driver.detoured = driver.errand;
    driver.detour = findDetour(state, driver.errand);
    if (driver.detour) return;
  }
  say(state, cannotReach(state, driver.errand, dir));
  driver.errand = null;
  driver.target = null;
  driver.detour = null;
}

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
      if (step.kind === 'arrive') {
        const refused = isRefused(state, driver.errand.action);
        if (!startAction(state, driver.errand.action) && !refused) say(state, 'You cannot do that right now.');
      }
      driver.errand = null;
      driver.target = null;
    }
  }
  if (!driver.errand) driver.detour = null;
  const goal = driver.detour ?? driver.target;
  if (goal) {
    const dx = goal.x - state.player.x;
    const dy = goal.y - state.player.y;
    const d = hypot(dx, dy);
    if (d < 0.1) driver.detour ? (driver.detour = null) : (driver.target = null);
    else (dir.x = dx / d), (dir.y = dy / d);
  }
  if (state.busy || state.sleeping) driver.target = driver.detour = null;
  const { x: x0, y: y0 } = state.player;
  moveBy(state, dir.x * WALK_SPEED * seconds, dir.y * WALK_SPEED * seconds);
  if ((dir.x || dir.y) && hypot(state.player.x - x0, state.player.y - y0) < 0.01) {
    driver.stalled += seconds;
    if (driver.stalled >= STALL_SECONDS) handleStall(state, driver, dir);
  } else driver.stalled = 0;
  advance(state, seconds * GAME_MINUTES_PER_SECOND * (state.sleeping ? SLEEP_SPEEDUP : 1));
}
