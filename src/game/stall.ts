// When a walk is blocked: finds a reachable spot near her that works, or says what is in the way.
import { cos, hypot, sin } from '../math/exact';
import { errandStep, type Errand } from './interact';
import { blocked, blockerAt } from './movement';
import type { GameState } from './state';

const NEAR = 2;
const RING_STEP = 0.2;
const ANGLES = 16;
const LINE_STEP = 0.1;
const LOOK_AHEAD = 0.8;

const nameOf = (kind: string) => (kind === 'stone' ? 'rock' : kind);

function lineClear(state: GameState, x: number, y: number, tx: number, ty: number): boolean {
  const d = hypot(tx - x, ty - y);
  for (let t = LINE_STEP; t < d; t += LINE_STEP) {
    if (blocked(state, x + ((tx - x) * t) / d, y + ((ty - y) * t) / d)) return false;
  }
  return true;
}

// The nearest free spot within a short walk, in a straight clear line, from which the errand can start.
export function findDetour(state: GameState, errand: Errand): { x: number; y: number } | null {
  const { x, y } = state.player;
  for (let r = RING_STEP; r <= NEAR; r += RING_STEP) {
    for (let i = 0; i < ANGLES; i++) {
      const a = (i / ANGLES) * 2 * Math.PI;
      const sx = x + r * cos(a);
      const sy = y + r * sin(a);
      if (blocked(state, sx, sy) || !lineClear(state, x, y, sx, sy)) continue;
      if (errandStep({ ...state, player: { x: sx, y: sy } }, errand).kind === 'arrive') return { x: sx, y: sy };
    }
  }
  return null;
}

function targetName(state: GameState, errand: Errand | null): string {
  const t = errand?.target;
  if (!t) return 'that spot';
  if (t.kind === 'prop') return `the ${nameOf(state.props.find((p) => p.id === t.id)?.kind ?? 'thing')}`;
  if (t.kind === 'structure') return `the ${state.structures.find((s) => s.id === t.id)?.kind ?? 'structure'}`;
  if (t.kind === 'animal') return `the ${state.animals.find((a) => a.id === t.id)?.kind ?? 'animal'}`;
  return t.kind === 'water' ? 'the water' : 'that spot';
}

// Names what stands in the way, looking along the direction she tried to go.
function blockerAhead(state: GameState, dx: number, dy: number): string {
  const { x, y } = state.player;
  for (let t = LINE_STEP; t <= LOOK_AHEAD; t += LINE_STEP) {
    if (blocked(state, x + dx * t, y + dy * t)) return nameOf(blockerAt(state, x + dx * t, y + dy * t));
  }
  return 'terrain';
}

// The message for a walk that cannot go on. `dir` is the unit vector she was walking along.
export function cannotReach(state: GameState, errand: Errand | null, dir: { x: number; y: number }): string {
  const what = targetName(state, errand);
  const verb = what === 'that spot' ? `You cannot get to ${what}` : `You cannot reach ${what}`;
  return `${verb}. The ${blockerAhead(state, dir.x, dir.y)} is in the way.`;
}
