// Low-poly trees, berry bushes and stones. Each prop shows a full or an emptied look.
import * as THREE from 'three';
import type { Prop } from '../world/types';
import { surfaceHeight } from '../world/query';
import type { World } from '../world/types';
import { mat } from './palette';

interface PropView {
  prop: Prop;
  full: THREE.Object3D;
  empty: THREE.Object3D | null;
  shown: boolean;
}

const mesh = (g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => {
  const o = new THREE.Mesh(g, m);
  o.position.set(x, y, z);
  o.castShadow = true;
  return o;
};

function tree(seed: number): { full: THREE.Group; empty: THREE.Group } {
  const full = new THREE.Group();
  const s = 0.85 + (seed % 5) * 0.08;
  const green = ['#3f7d3a', '#4a8a3f', '#356f3a'][seed % 3];
  full.add(mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.8, 5), mat('#6b4a2b'), 0, 0.4, 0));
  full.add(mesh(new THREE.ConeGeometry(0.6, 1.0, 6), mat(green), 0, 1.1, 0));
  full.add(mesh(new THREE.ConeGeometry(0.45, 0.9, 6), mat(green), 0, 1.7, 0));
  full.add(mesh(new THREE.ConeGeometry(0.3, 0.7, 6), mat(green), 0, 2.2, 0));
  full.scale.setScalar(s);
  const empty = new THREE.Group();
  empty.add(mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.2, 5), mat('#7a5a38'), 0, 0.1, 0));
  return { full, empty };
}

function bush(): { full: THREE.Group; empty: THREE.Group } {
  const build = (berries: boolean) => {
    const g = new THREE.Group();
    g.add(mesh(new THREE.IcosahedronGeometry(0.38, 0), mat('#4c8a3a'), 0, 0.3, 0));
    if (berries) {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        g.add(mesh(new THREE.SphereGeometry(0.07, 5, 4), mat('#b02a4a', '#300010'), Math.cos(a) * 0.32, 0.35 + (i % 2) * 0.12, Math.sin(a) * 0.32));
      }
    }
    return g;
  };
  return { full: build(true), empty: build(false) };
}

function stone(seed: number): THREE.Group {
  const g = new THREE.Group();
  const rock = mesh(new THREE.DodecahedronGeometry(0.32, 0), mat('#9aa0a6'), 0, 0.18, 0);
  rock.scale.set(1.1 + (seed % 3) * 0.1, 0.7, 0.95);
  rock.rotation.y = seed;
  g.add(rock);
  return g;
}

export function buildProps(world: World, props: Prop[]): { group: THREE.Group; update: () => void; find: (id: number) => THREE.Object3D | undefined } {
  const group = new THREE.Group();
  const views: PropView[] = [];
  const holders = new Map<number, THREE.Object3D>();
  for (const prop of props) {
    const parts = prop.kind === 'tree' ? tree(prop.id) : prop.kind === 'bush' ? bush() : { full: stone(prop.id), empty: null };
    const holder = new THREE.Group();
    holder.position.set(prop.x, surfaceHeight(world, prop.x, prop.y), prop.y);
    holder.rotation.y = prop.id * 1.7;
    holder.add(parts.full);
    if (parts.empty) holder.add(parts.empty);
    group.add(holder);
    holders.set(prop.id, holder);
    views.push({ prop, full: parts.full, empty: parts.empty, shown: true });
  }
  const update = () => {
    for (const v of views) {
      const has = v.prop.amount > 0;
      if (has === v.shown) continue;
      v.shown = has;
      v.full.visible = has;
      if (v.empty) v.empty.visible = !has;
      else if (!has) v.full.visible = false;
    }
  };
  for (const v of views) if (v.empty) v.empty.visible = false;
  return { group, update, find: (id) => holders.get(id) };
}
