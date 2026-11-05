// How each tree, bush, stone and grass tuft looks: its size, shape, tint and lean. Same id, same look.
import { makeRng } from '../math/rng';
import type { Prop, PropKind, World } from '../world/types';

export interface Look {
  size: number; // overall scale, 0.7 to 1.35
  squash: number; // height against width, so some are tall and some squat
  tint: number; // -1 darker to 1 lighter
  tiers: number; // cone layers on a tree, 2 to 4
  lean: number; // tilt in radians
  turn: number; // spin in radians
}

const KIND_SALT: Record<PropKind, number> = { tree: 11, bush: 23, stone: 37 };

export function lookOf(kind: PropKind, id: number): Look {
  const rnd = makeRng(Math.imul(id + 1, 2654435761) ^ (KIND_SALT[kind] * 40503));
  rnd();
  const size = 0.7 + rnd() * 0.65;
  const squash = 0.8 + rnd() * 0.5;
  const tint = rnd() * 2 - 1;
  const tiers = 2 + Math.floor(rnd() * 3);
  const lean = (rnd() * 2 - 1) * 0.12;
  const turn = rnd() * Math.PI * 2;
  return { size, squash, tint, tiers, lean, turn };
}

const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

// Moves a #rrggbb colour lighter (amount up to 1) or darker (down to -1), by up to about 14%.
export function tinted(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const f = amount * 0.14;
  const ch = (v: number) => clamp(f >= 0 ? v + (255 - v) * f : v * (1 + f));
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

export interface Tuft {
  x: number;
  y: number;
  size: number;
  tint: number;
  turn: number;
}

// Scatters grass tufts, a few on each grass tile, clear of props. Same world, same tufts.
export function grassTufts(world: World, props: Pick<Prop, 'x' | 'y'>[]): Tuft[] {
  const rnd = makeRng(world.size * 7919 + 13);
  const out: Tuft[] = [];
  for (let ty = 0; ty < world.size; ty++) {
    for (let tx = 0; tx < world.size; tx++) {
      if (world.kind[ty * world.size + tx] !== 'grass') continue;
      const roll = rnd();
      const x = tx + 0.1 + rnd() * 0.8;
      const y = ty + 0.1 + rnd() * 0.8;
      const size = 0.6 + rnd() * 0.7;
      const tint = rnd() * 2 - 1;
      const turn = rnd() * Math.PI * 2;
      if (roll > 0.4) continue;
      if (props.some((p) => (p.x - x) ** 2 + (p.y - y) ** 2 < 0.36)) continue;
      out.push({ x, y, size, tint, turn });
    }
  }
  return out;
}
