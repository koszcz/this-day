// Campfires with flickering light, and lean-to shelters.
import * as THREE from 'three';
import type { Structure } from '../game/state';
import { surfaceHeight } from '../world/query';
import type { World } from '../world/types';
import { mat } from './palette';

interface View {
  id: number;
  root: THREE.Group;
  flame: THREE.Mesh | null;
  light: THREE.PointLight | null;
}

function fireModel(): { root: THREE.Group; flame: THREE.Mesh; light: THREE.PointLight } {
  const root = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 5), mat('#5a3c20'));
    log.rotation.z = Math.PI / 2;
    log.rotation.y = (i / 3) * Math.PI;
    log.position.y = 0.08;
    log.castShadow = true;
    root.add(log);
  }
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1, 0), mat('#8a8f95'));
    r.position.set(Math.cos(a) * 0.45, 0.07, Math.sin(a) * 0.45);
    root.add(r);
  }
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.55, 6), new THREE.MeshBasicMaterial({ color: '#ffb02e' }));
  flame.position.y = 0.35;
  root.add(flame);
  const light = new THREE.PointLight('#ff9a3c', 14, 9, 1.6);
  light.position.y = 0.8;
  root.add(light);
  return { root, flame, light };
}

function shelterModel(): THREE.Group {
  const root = new THREE.Group();
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 1.3), mat('#7a5a38'));
  roof.position.set(0, 0.85, -0.1);
  roof.rotation.x = 0.55;
  roof.castShadow = true;
  root.add(roof);
  for (const x of [-0.75, 0.75]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 5), mat('#5a3c20'));
    pole.position.set(x, 0.55, 0.45);
    root.add(pole);
  }
  const leaves = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 1.1), mat('#4a8a3f'));
  leaves.position.set(0, 0.92, -0.12);
  leaves.rotation.x = 0.55;
  root.add(leaves);
  return root;
}

export function buildStructures(world: World, parent: THREE.Group) {
  const views = new Map<number, View>();
  return (list: Structure[], elapsed: number) => {
    for (const s of list) {
      let v = views.get(s.id);
      if (!v) {
        const model = s.kind === 'fire' ? fireModel() : { root: shelterModel(), flame: null, light: null };
        model.root.position.set(s.x, surfaceHeight(world, s.x, s.y), s.y);
        parent.add(model.root);
        v = { id: s.id, ...model };
        views.set(s.id, v);
      }
      if (v.flame && v.light) {
        const lit = s.fuel > 0;
        v.flame.visible = lit;
        v.light.visible = lit;
        const flicker = 1 + Math.sin(elapsed * 14 + s.id) * 0.12 + Math.sin(elapsed * 23) * 0.08;
        v.flame.scale.set(flicker, flicker * 1.1, flicker);
        v.light.intensity = 14 * flicker * Math.min(1, s.fuel / 30);
      }
    }
  };
}
