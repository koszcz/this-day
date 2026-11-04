// The hover glow: lights up one object, or lays a pale square over one water tile.
import * as THREE from 'three';
import type { HoverTarget } from '../game/hover';
import { LEVEL_HEIGHT, WATER_LEVEL } from '../world/types';

const GLOW = new THREE.Color('#6b6238');
const glowing = new Map<THREE.MeshLambertMaterial, THREE.MeshLambertMaterial>();

function glowOf(m: THREE.MeshLambertMaterial): THREE.MeshLambertMaterial {
  let g = glowing.get(m);
  if (!g) {
    g = m.clone();
    g.emissive = m.emissive.clone().add(GLOW);
    glowing.set(m, g);
  }
  return g;
}

export interface Lookup {
  prop: (id: number) => THREE.Object3D | undefined;
  structure: (id: number) => THREE.Object3D | undefined;
  animal: (id: number) => THREE.Object3D | undefined;
  player: THREE.Object3D;
}

export function createHighlight(parent: THREE.Object3D, lookup: Lookup) {
  const swapped = new Map<THREE.Mesh, THREE.Material>();
  const tile = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.3, depthWrite: false }),
  );
  tile.rotation.x = -Math.PI / 2;
  tile.position.y = (WATER_LEVEL + 0.6) * LEVEL_HEIGHT;
  tile.visible = false;
  parent.add(tile);

  const clear = () => {
    for (const [mesh, original] of swapped) mesh.material = original;
    swapped.clear();
    tile.visible = false;
  };

  return (target: HoverTarget | null) => {
    clear();
    if (!target) return;
    if (target.kind === 'water') {
      tile.position.set(target.x + 0.5, tile.position.y, target.y + 0.5);
      tile.visible = true;
      return;
    }
    const object =
      target.kind === 'player' ? lookup.player : target.kind === 'prop' ? lookup.prop(target.id) : target.kind === 'animal' ? lookup.animal(target.id) : lookup.structure(target.id);
    object?.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh || !(mesh.material instanceof THREE.MeshLambertMaterial)) return;
      swapped.set(mesh, mesh.material);
      mesh.material = glowOf(mesh.material);
    });
  };
}
