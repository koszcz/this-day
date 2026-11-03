// Flat colors and a cheap material maker, so every part of the world shares one look.
import * as THREE from 'three';
import type { TileKind } from '../world/types';

export const TILE_COLORS: Record<TileKind, string> = {
  deep: '#24557f',
  shallow: '#3f86ae',
  sand: '#dccb92',
  grass: '#6da24c',
  rock: '#8b9097',
  peak: '#d4d8dc',
};

const cache = new Map<string, THREE.MeshLambertMaterial>();

export function mat(color: string, emissive?: string): THREE.MeshLambertMaterial {
  const key = color + (emissive ?? '');
  let m = cache.get(key);
  if (!m) {
    m = new THREE.MeshLambertMaterial({ color, flatShading: true });
    if (emissive) m.emissive = new THREE.Color(emissive);
    cache.set(key, m);
  }
  return m;
}
