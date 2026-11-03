// Turns the tile grid into blocky low-poly land and a see-through water sheet.
import * as THREE from 'three';
import { LEVEL_HEIGHT, WATER_LEVEL, type World } from '../world/types';
import { levelAt } from '../world/query';
import { TILE_COLORS } from './palette';

const hash = (x: number, y: number) => {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return h - Math.floor(h);
};

export function buildTerrain(world: World): THREE.Group {
  const group = new THREE.Group();
  const n = world.size * world.size;
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial(), n);
  mesh.receiveShadow = true;
  const m = new THREE.Matrix4();
  const color = new THREE.Color();
  for (let y = 0; y < world.size; y++) {
    for (let x = 0; x < world.size; x++) {
      const i = y * world.size + x;
      const top = Math.max(levelAt(world, x, y), 0) * LEVEL_HEIGHT;
      m.compose(new THREE.Vector3(x + 0.5, (top - 1) / 2, y + 0.5), new THREE.Quaternion(), new THREE.Vector3(1, top + 1, 1));
      mesh.setMatrixAt(i, m);
      color.set(TILE_COLORS[world.kind[i]]);
      color.offsetHSL(0, 0, (hash(x, y) - 0.5) * 0.06);
      mesh.setColorAt(i, color);
    }
  }
  group.add(mesh);
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(world.size * 3, world.size * 3),
    new THREE.MeshLambertMaterial({ color: '#3a84b8', transparent: true, opacity: 0.6 }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(world.size / 2, (WATER_LEVEL + 0.4) * LEVEL_HEIGHT, world.size / 2);
  group.add(water);
  return group;
}
