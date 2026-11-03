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

// Height of one tile's land. Sea floor tiles count as flat zero, the water sheet covers them.
const tileHeight = (world: World, tx: number, ty: number) => Math.max(levelAt(world, tx, ty), 0) * LEVEL_HEIGHT;

// Height at a tile corner: the average of the four tiles that meet there, so the land rolls smoothly.
export function cornerHeight(world: World, cx: number, cy: number): number {
  return (tileHeight(world, cx - 1, cy - 1) + tileHeight(world, cx, cy - 1) + tileHeight(world, cx - 1, cy) + tileHeight(world, cx, cy)) / 4;
}

// Height of the ground under a point, blended between the four corners of its tile.
export function groundHeight(world: World, x: number, y: number): number {
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  const fx = x - tx;
  const fy = y - ty;
  const top = cornerHeight(world, tx, ty) * (1 - fx) + cornerHeight(world, tx + 1, ty) * fx;
  const bottom = cornerHeight(world, tx, ty + 1) * (1 - fx) + cornerHeight(world, tx + 1, ty + 1) * fx;
  return top * (1 - fy) + bottom * fy;
}

// Height of the walkable surface. Water tiles show the water level, not the sea floor.
export function surfaceHeight(world: World, x: number, y: number): number {
  return Math.max(groundHeight(world, x, y), WATER_LEVEL * LEVEL_HEIGHT);
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
