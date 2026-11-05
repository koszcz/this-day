// The numbers behind the atmosphere: sky gradient ends, mist at the map edge, and drifting specks.

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

// The sky shades from a darker top to a brighter, hazier horizon.
export function skyEnds(base: Rgb): { top: Rgb; horizon: Rgb } {
  const top = { r: base.r * 0.78, g: base.g * 0.82, b: base.b * 0.92 };
  const lift = (v: number) => Math.min(1, v + (1 - v) * 0.35);
  return { top, horizon: { r: lift(base.r), g: lift(base.g), b: lift(base.b) } };
}

const MIST_WIDTH = 14;

// Mist from 0 to 1 at a ground spot. It is thick at the map edge and fades out over MIST_WIDTH tiles.
export function edgeMist(x: number, z: number, size: number): number {
  const fromEdge = Math.min(x, z, size - x, size - z);
  const t = Math.max(0, 1 - fromEdge / MIST_WIDTH);
  return Math.min(1, t * t * 1.1);
}

export const MOTE_COUNT = 48;
const AREA = 13;
const HEIGHT = 7;

function hash(i: number, salt: number): number {
  const s = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

// Where speck `i` is at time `t`, as an offset from the player. Each speck sways and sinks, then wraps back to the top.
export function driftOf(i: number, t: number): { x: number; y: number; z: number } {
  const speed = 0.25 + hash(i, 1) * 0.35;
  const sway = 0.6 + hash(i, 2) * 1.4;
  const phase = hash(i, 3) * 6.283;
  const wrap = (v: number, size: number) => ((v % size) + size) % size;
  const x = wrap(hash(i, 4) * AREA * 2 + t * 0.35, AREA * 2) - AREA + Math.sin(t * 0.7 + phase) * sway * 0.5;
  const z = wrap(hash(i, 5) * AREA * 2 + t * 0.15, AREA * 2) - AREA + Math.cos(t * 0.5 + phase) * sway * 0.5;
  const y = HEIGHT - wrap(hash(i, 6) * HEIGHT + t * speed, HEIGHT);
  return { x: Math.max(-AREA, Math.min(AREA, x)), y, z: Math.max(-AREA, Math.min(AREA, z)) };
}
