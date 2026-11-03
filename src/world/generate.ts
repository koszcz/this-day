// Builds an island from a seed: land shape, tile kinds and the props scattered on it.
import { hypot } from '../math/exact';
import { makeNoise } from '../math/noise';
import { makeRng } from '../math/rng';
import type { Prop, PropKind, TileKind, World } from './types';

export const WORLD_SIZE = 72;

function kindFor(e: number): TileKind {
  if (e < 0.3) return 'deep';
  if (e < 0.35) return 'shallow';
  if (e < 0.4) return 'sand';
  if (e < 0.72) return 'grass';
  if (e < 0.86) return 'rock';
  return 'peak';
}

export function generateWorld(seed: number): { world: World; props: Prop[] } {
  const size = WORLD_SIZE;
  const noise = makeNoise(seed);
  const trees = makeNoise(seed + 77);
  const rand = makeRng(seed + 1);
  const elevation: number[] = [];
  const kind: TileKind[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x / (size - 1)) * 2 - 1;
      const dy = (y / (size - 1)) * 2 - 1;
      const edge = Math.min(1, hypot(dx, dy));
      const e = noise(x / 14, y / 14) * 0.75 + (1 - edge * edge) * 0.5 - 0.12;
      elevation.push(e);
      kind.push(kindFor(e));
    }
  }
  const at = (x: number, y: number) => y * size + x;
  const start = findStart(size, kind);
  const props: Prop[] = [];
  const add = (k: PropKind, x: number, y: number, max: number) => {
    const jitter = () => (rand() - 0.5) * 0.5;
    props.push({ id: props.length, kind: k, x: x + 0.5 + jitter(), y: y + 0.5 + jitter(), amount: max, max, regrowAt: null });
  };
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      if (hypot(x - start.x, y - start.y) < 2.5) continue;
      const k = kind[at(x, y)];
      const r = rand();
      const forest = trees(x / 6, y / 6, 2);
      if (k === 'grass') {
        if (r < (forest > 0.5 ? 0.45 : 0.03)) add('tree', x, y, 3);
        else if (r > 0.985) add('bush', x, y, 3);
        else if (r > 0.97) add('stone', x, y, 2);
      } else if (k === 'sand' && r < 0.02) add('stone', x, y, 2);
      else if (k === 'rock' && r < 0.12) add('stone', x, y, 3);
    }
  }
  return { world: { size, elevation, kind, start: { x: start.x + 0.5, y: start.y + 0.5 } }, props };
}

// The grass tile nearest the middle of the map, so you always wake up on solid ground.
function findStart(size: number, kind: TileKind[]): { x: number; y: number } {
  const mid = size / 2;
  let best = { x: Math.floor(mid), y: Math.floor(mid) };
  let bestDist = Infinity;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (kind[y * size + x] !== 'grass') continue;
      const d = hypot(x - mid, y - mid);
      if (d < bestDist) {
        bestDist = d;
        best = { x, y };
      }
    }
  }
  return best;
}
