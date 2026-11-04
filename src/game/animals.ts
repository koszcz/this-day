// Roaming animals: deer and hares that wander the island and run from you when you come near.
import { cos, hypot, sin } from '../math/exact';
import { makeRng } from '../math/rng';
import { isWalkable, tileAt } from '../world/query';
import { roll } from './random';
import type { GameState } from './state';

export type AnimalKind = 'deer' | 'hare';

export interface Animal {
  id: number;
  kind: AnimalKind;
  x: number;
  y: number;
  // Where it is walking to. Null while it rests.
  tx: number | null;
  ty: number | null;
  // Game minutes of rest left before it picks a new spot.
  rest: number;
}

// Speeds are tiles per game minute. You walk at 2, so a hare outruns you and a deer almost does.
export const SPECS: Record<AnimalKind, { count: number; wander: number; run: number; flee: number }> = {
  deer: { count: 6, wander: 0.5, run: 1.9, flee: 7 },
  hare: { count: 8, wander: 0.7, run: 2.6, flee: 5 },
};
const SLICE = 0.5;
const BLOCK_RADIUS = 0.4;
const SPAWN_CLEARANCE = 8;
// Angles to try, in order, when the way straight away from you is blocked.
const TURNS = [0, 0.8, -0.8, 1.6, -1.6, 2.4, -2.4];

function open(state: GameState, x: number, y: number): boolean {
  if (!isWalkable(state.world, x, y) || tileAt(state.world, x, y) === 'shallow') return false;
  return !state.props.some((p) => p.amount > 0 && hypot(p.x - x, p.y - y) < BLOCK_RADIUS);
}

// Places the herd on dry land away from where you wake up. The same seed gives the same herd.
export function spawnAnimals(state: GameState): Animal[] {
  const rand = makeRng(state.seed ^ 0xa11a);
  const out: Animal[] = [];
  const size = state.world.size;
  for (const kind of Object.keys(SPECS) as AnimalKind[]) {
    let placed = 0;
    for (let tries = 0; tries < 400 && placed < SPECS[kind].count; tries++) {
      const x = rand() * size;
      const y = rand() * size;
      if (tileAt(state.world, x, y) !== 'grass' || !open(state, x, y)) continue;
      if (hypot(x - state.player.x, y - state.player.y) < SPAWN_CLEARANCE) continue;
      out.push({ id: out.length, kind, x, y, tx: null, ty: null, rest: rand() * 20 });
      placed++;
    }
  }
  return out;
}

function stepToward(state: GameState, a: Animal, dx: number, dy: number, dist: number): boolean {
  const d = hypot(dx, dy);
  if (d === 0) return false;
  const nx = a.x + (dx / d) * dist;
  const ny = a.y + (dy / d) * dist;
  if (!open(state, nx, ny)) return false;
  a.x = nx;
  a.y = ny;
  return true;
}

function flee(state: GameState, a: Animal, away: { x: number; y: number }, dist: number) {
  a.tx = a.ty = null;
  for (const turn of TURNS) {
    const dx = away.x * cos(turn) - away.y * sin(turn);
    const dy = away.x * sin(turn) + away.y * cos(turn);
    if (stepToward(state, a, dx, dy, dist)) return;
  }
}

function wander(state: GameState, a: Animal, minutes: number) {
  if (a.tx === null || a.ty === null) {
    a.rest -= minutes;
    if (a.rest > 0) return;
    const angle = roll(state) * 6.2832;
    const reach = 1 + roll(state) * 3;
    const tx = a.x + cos(angle) * reach;
    const ty = a.y + sin(angle) * reach;
    if (open(state, tx, ty)) {
      a.tx = tx;
      a.ty = ty;
    } else a.rest = 2;
    return;
  }
  const dx = a.tx - a.x;
  const dy = a.ty - a.y;
  const dist = SPECS[a.kind].wander * minutes;
  if (hypot(dx, dy) <= dist || !stepToward(state, a, dx, dy, dist)) {
    a.tx = a.ty = null;
    a.rest = 5 + roll(state) * 20;
  }
}

// Moves every animal for some game minutes, in short slices so a fast sleep stays smooth.
export function tickAnimals(state: GameState, minutes: number) {
  let left = minutes;
  while (left > 0) {
    const m = Math.min(SLICE, left);
    left -= m;
    for (const a of state.animals) {
      const spec = SPECS[a.kind];
      const ax = a.x - state.player.x;
      const ay = a.y - state.player.y;
      if (hypot(ax, ay) < spec.flee) flee(state, a, { x: ax || 1, y: ay }, spec.run * m);
      else wander(state, a, m);
    }
  }
}

// Saves from before animals have none. They get a herd from their seed.
export function ensureAnimals(state: GameState) {
  state.animals ??= spawnAnimals(state);
}
