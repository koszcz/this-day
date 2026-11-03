// Shapes of the world: tiles, props you can gather from, and the finished world.
export type TileKind = 'deep' | 'shallow' | 'sand' | 'grass' | 'rock' | 'peak';
export type PropKind = 'tree' | 'bush' | 'stone';

export interface Prop {
  id: number;
  kind: PropKind;
  x: number;
  y: number;
  amount: number;
  max: number;
  // Game minute when an emptied prop grows back. Null while it still has something to give.
  regrowAt: number | null;
}

export interface World {
  size: number;
  elevation: number[];
  kind: TileKind[];
  start: { x: number; y: number };
}

export const LEVEL_HEIGHT = 0.25;
export const WATER_LEVEL = 3;
