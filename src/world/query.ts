// Questions about the world: what is under a point, can you walk there, how high is the ground.
import { hypot } from '../math/exact';
import { LEVEL_HEIGHT, WATER_LEVEL, type TileKind, type World } from './types';

export function tileAt(world: World, x: number, y: number): TileKind {
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  if (tx < 0 || ty < 0 || tx >= world.size || ty >= world.size) return 'deep';
  return world.kind[ty * world.size + tx];
}

export function isWalkable(world: World, x: number, y: number): boolean {
  const k = tileAt(world, x, y);
  return k !== 'deep' && k !== 'peak';
}

export function levelAt(world: World, tx: number, ty: number): number {
  if (tx < 0 || ty < 0 || tx >= world.size || ty >= world.size) return 0;
  return Math.round(world.elevation[ty * world.size + tx] * 10);
}

// Height of the ground surface. Water tiles show the water level, not the sea floor.
export function surfaceHeight(world: World, x: number, y: number): number {
  const level = levelAt(world, Math.floor(x), Math.floor(y));
  return Math.max(level, WATER_LEVEL) * LEVEL_HEIGHT;
}

export function isWater(world: World, x: number, y: number): boolean {
  const k = tileAt(world, x, y);
  return k === 'deep' || k === 'shallow';
}

// True when any water tile lies within `reach` tiles of the point.
export function waterNear(world: World, x: number, y: number, reach = 1.6): boolean {
  const r = Math.ceil(reach);
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (hypot(dx, dy) <= reach && isWater(world, x + dx, y + dy)) return true;
    }
  }
  return false;
}
