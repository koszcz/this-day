// Draws the land as one smooth mesh with blended colors, plus a see-through water sheet.
import * as THREE from 'three';
import { LEVEL_HEIGHT, WATER_LEVEL, type World } from '../world/types';
import { terrainMesh } from './terrain-mesh';

export function buildTerrain(world: World): THREE.Group {
  const group = new THREE.Group();
  const { positions, colors, indices } = terrainMesh(world);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setIndex(new THREE.BufferAttribute(indices, 1));
  geo.computeVertexNormals();
  const land = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true }));
  land.receiveShadow = true;
  group.add(land);
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(world.size * 3, world.size * 3),
    new THREE.MeshLambertMaterial({ color: '#3a84b8', transparent: true, opacity: 0.6 }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(world.size / 2, (WATER_LEVEL + 0.4) * LEVEL_HEIGHT, world.size / 2);
  group.add(water);
  return group;
}
