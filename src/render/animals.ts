// Low-poly deer and hares. They face where they walk, bob while moving and hop when they run.
import * as THREE from 'three';
import type { Animal, AnimalKind } from '../game/animals';
import { surfaceHeight } from '../world/query';
import type { World } from '../world/types';
import { mat } from './palette';

interface View {
  root: THREE.Group;
  body: THREE.Group;
  lastX: number;
  lastY: number;
  heading: number;
}

const part = (g: THREE.BufferGeometry, color: string, x: number, y: number, z: number) => {
  const m = new THREE.Mesh(g, mat(color));
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
};

// The model looks toward +z, like the survivor.
function deerModel(): THREE.Group {
  const g = new THREE.Group();
  const coat = '#a06a3c';
  g.add(part(new THREE.BoxGeometry(0.3, 0.32, 0.7), coat, 0, 0.62, 0));
  for (const [x, z] of [[-0.1, 0.25], [0.1, 0.25], [-0.1, -0.25], [0.1, -0.25]]) g.add(part(new THREE.CylinderGeometry(0.04, 0.03, 0.46, 4), '#7c4f2a', x, 0.23, z));
  g.add(part(new THREE.CylinderGeometry(0.07, 0.1, 0.4, 5), coat, 0, 0.9, 0.38));
  g.add(part(new THREE.IcosahedronGeometry(0.13, 0), coat, 0, 1.12, 0.46));
  g.add(part(new THREE.ConeGeometry(0.05, 0.14, 4), '#e6d3a8', 0, 0.62, -0.38));
  for (const x of [-0.07, 0.07]) {
    g.add(part(new THREE.CylinderGeometry(0.015, 0.02, 0.3, 4), '#d9c9a0', x, 1.3, 0.44));
    g.add(part(new THREE.CylinderGeometry(0.012, 0.015, 0.14, 4), '#d9c9a0', x * 2.2, 1.38, 0.44));
  }
  return g;
}

function hareModel(): THREE.Group {
  const g = new THREE.Group();
  const coat = '#b8a58a';
  const body = part(new THREE.IcosahedronGeometry(0.17, 0), coat, 0, 0.2, 0);
  body.scale.set(0.85, 0.85, 1.4);
  g.add(body);
  g.add(part(new THREE.IcosahedronGeometry(0.1, 0), coat, 0, 0.3, 0.24));
  for (const x of [-0.04, 0.04]) g.add(part(new THREE.BoxGeometry(0.03, 0.2, 0.05), '#d8c9b2', x, 0.5, 0.22));
  g.add(part(new THREE.IcosahedronGeometry(0.05, 0), '#f4efe6', 0, 0.22, -0.26));
  return g;
}

const MODELS: Record<AnimalKind, () => THREE.Group> = { deer: deerModel, hare: hareModel };

export function buildAnimals(world: World, parent: THREE.Group, animals: Animal[]) {
  const views = new Map<number, View>();
  for (const a of animals) {
    const root = new THREE.Group();
    const body = MODELS[a.kind]();
    root.add(body);
    root.position.set(a.x, surfaceHeight(world, a.x, a.y), a.y);
    parent.add(root);
    views.set(a.id, { root, body, lastX: a.x, lastY: a.y, heading: a.id * 2.1 });
  }
  const update = (list: Animal[], elapsed: number) => {
    for (const a of list) {
      const v = views.get(a.id);
      if (!v) continue;
      const dx = a.x - v.lastX;
      const dy = a.y - v.lastY;
      const speed = Math.hypot(dx, dy);
      if (speed > 0.0005) v.heading = Math.atan2(dx, dy);
      v.lastX = a.x;
      v.lastY = a.y;
      v.root.rotation.y = v.heading;
      v.root.position.set(a.x, surfaceHeight(world, a.x, a.y), a.y);
      // A hop for a hare and a gentle bob for a deer, only while it moves.
      const rate = a.kind === 'hare' ? 16 : 9;
      const height = a.kind === 'hare' ? 0.18 : 0.05;
      v.body.position.y = speed > 0.0005 ? Math.abs(Math.sin(elapsed * rate + a.id)) * height : 0;
    }
  };
  return { update, find: (id: number): THREE.Object3D | undefined => views.get(id)?.root };
}
