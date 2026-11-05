// A white overlay on the water. Its see-through amount changes each frame to make shimmer and shore foam.
import * as THREE from 'three';
import { cornerHeight } from '../world/query';
import { LEVEL_HEIGHT, WATER_LEVEL, type World } from '../world/types';
import { waterAlpha } from './water-motion';

export function buildWater(world: World): { mesh: THREE.Mesh; update: (elapsed: number) => void } {
  const n = world.size + 1;
  const surface = (WATER_LEVEL + 0.4) * LEVEL_HEIGHT;
  const positions = new Float32Array(n * n * 3);
  const depths = new Float32Array(n * n);
  const colors = new Float32Array(n * n * 4).fill(1);
  for (let cy = 0; cy < n; cy++) {
    for (let cx = 0; cx < n; cx++) {
      const i = cy * n + cx;
      positions.set([cx, surface + 0.01, cy], i * 3);
      depths[i] = surface - cornerHeight(world, cx, cy);
    }
  }
  const indices = new Uint32Array(world.size * world.size * 6);
  let k = 0;
  for (let y = 0; y < world.size; y++) {
    for (let x = 0; x < world.size; x++) {
      const a = y * n + x;
      indices.set([a, a + n, a + 1, a + 1, a + n, a + n + 1], k);
      k += 6;
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const colorAttr = new THREE.BufferAttribute(colors, 4);
  geo.setAttribute('color', colorAttr);
  geo.setIndex(new THREE.BufferAttribute(indices, 1));
  const material = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false });
  const mesh = new THREE.Mesh(geo, material);
  mesh.frustumCulled = false;
  const update = (elapsed: number) => {
    for (let cy = 0; cy < n; cy++) {
      for (let cx = 0; cx < n; cx++) {
        const i = cy * n + cx;
        colors[i * 4 + 3] = waterAlpha(depths[i], cx, cy, elapsed);
      }
    }
    colorAttr.needsUpdate = true;
  };
  update(0);
  return { mesh, update };
}
