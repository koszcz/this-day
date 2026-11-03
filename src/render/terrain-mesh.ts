// Turns the tile grid into smooth rolling ground: one vertex per tile corner, colors blended between tiles.
import * as THREE from 'three';
import { cornerHeight, tileAt } from '../world/query';
import type { World } from '../world/types';
import { TILE_COLORS } from './palette';

const hash = (x: number, y: number) => {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return h - Math.floor(h);
};

export function terrainMesh(world: World) {
  const size = world.size;
  const n = size + 1;
  const positions = new Float32Array(n * n * 3);
  const colors = new Float32Array(n * n * 3);
  const base = new THREE.Color();
  const mix = new THREE.Color();
  for (let cy = 0; cy < n; cy++) {
    for (let cx = 0; cx < n; cx++) {
      const i = (cy * n + cx) * 3;
      positions[i] = cx;
      positions[i + 1] = cornerHeight(world, cx, cy);
      positions[i + 2] = cy;
      mix.setRGB(0, 0, 0);
      for (const [dx, dy] of [[-1, -1], [0, -1], [-1, 0], [0, 0]]) {
        mix.add(base.set(TILE_COLORS[tileAt(world, cx + dx, cy + dy)]));
      }
      mix.multiplyScalar(0.25).offsetHSL(0, 0, (hash(cx, cy) - 0.5) * 0.05);
      colors[i] = mix.r;
      colors[i + 1] = mix.g;
      colors[i + 2] = mix.b;
    }
  }
  const indices = new Uint32Array(size * size * 6);
  let k = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const a = y * n + x;
      indices.set([a, a + n, a + 1, a + 1, a + n, a + n + 1], k);
      k += 6;
    }
  }
  return { positions, colors, indices };
}
