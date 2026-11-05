// Low-poly trees, berry bushes and stones. Each prop shows a full or an emptied look, and no two look alike.
import * as THREE from 'three';
import type { Prop } from '../world/types';
import { surfaceHeight } from '../world/query';
import type { World } from '../world/types';
import { mat } from './palette';
import { lookOf, tinted, type Look } from './scenery-look';

interface PropView {
  prop: Prop;
  full: THREE.Object3D;
  empty: THREE.Object3D | null;
  shown: boolean;
}

const GREENS = ['#3f7d3a', '#4a8a3f', '#356f3a', '#52913f'];
const BARKS = ['#6b4a2b', '#5c3f25', '#7a5836'];
const STONES = ['#9aa0a6', '#8d8f8c', '#a59f95', '#8a9299'];

const mesh = (g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => {
  const o = new THREE.Mesh(g, m);
  o.position.set(x, y, z);
  o.castShadow = true;
  return o;
};

function tree(id: number, look: Look): { full: THREE.Group; empty: THREE.Group } {
  const full = new THREE.Group();
  const green = tinted(GREENS[id % GREENS.length], look.tint);
  const bark = BARKS[(id >> 2) % BARKS.length];
  const trunk = 0.5 + look.tiers * 0.1;
  full.add(mesh(new THREE.CylinderGeometry(0.1, 0.14, trunk, 5), mat(bark), 0, trunk / 2, 0));
  const round = id % 4 === 3;
  for (let i = 0; i < look.tiers; i++) {
    const k = 1 - i / look.tiers;
    const r = 0.25 + 0.4 * k;
    const h = 0.7 + 0.3 * k;
    const y = trunk * 0.7 + i * 0.5 * look.squash + h / 2;
    const g = round ? new THREE.IcosahedronGeometry(r * 0.9, 0) : new THREE.ConeGeometry(r, h, 6);
    full.add(mesh(g, mat(green), 0, y, 0));
  }
  full.scale.set(look.size, look.size * look.squash, look.size);
  full.rotation.z = look.lean;
  const empty = new THREE.Group();
  empty.add(mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.2, 5), mat('#7a5a38'), 0, 0.1, 0));
  empty.scale.setScalar(look.size);
  return { full, empty };
}

function bush(id: number, look: Look): { full: THREE.Group; empty: THREE.Group } {
  const leaf = tinted('#4c8a3a', look.tint);
  const build = (berries: boolean) => {
    const g = new THREE.Group();
    g.add(mesh(new THREE.IcosahedronGeometry(0.38, 0), mat(leaf), 0, 0.3, 0));
    if (id % 3 !== 0) g.add(mesh(new THREE.IcosahedronGeometry(0.24, 0), mat(leaf), 0.3, 0.2, 0.1));
    if (id % 3 === 2) g.add(mesh(new THREE.IcosahedronGeometry(0.2, 0), mat(leaf), -0.28, 0.18, -0.12));
    if (berries) {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        g.add(mesh(new THREE.SphereGeometry(0.07, 5, 4), mat('#b02a4a', '#300010'), Math.cos(a) * 0.32, 0.35 + (i % 2) * 0.12, Math.sin(a) * 0.32));
      }
    }
    g.scale.set(look.size, look.size * look.squash, look.size);
    return g;
  };
  return { full: build(true), empty: build(false) };
}

function stone(id: number, look: Look): THREE.Group {
  const g = new THREE.Group();
  const color = tinted(STONES[id % STONES.length], look.tint);
  const geo = id % 2 ? new THREE.DodecahedronGeometry(0.32, 0) : new THREE.IcosahedronGeometry(0.32, 0);
  const rock = mesh(geo, mat(color), 0, 0.18 * look.size, 0);
  rock.scale.set(look.size * (1.1 + (id % 3) * 0.1), 0.7 * look.size * look.squash, look.size * 0.95);
  rock.rotation.set(look.lean * 2, look.turn, look.lean);
  g.add(rock);
  if (id % 4 === 0) g.add(mesh(new THREE.DodecahedronGeometry(0.14, 0), mat(color), 0.36 * look.size, 0.08, 0.1));
  return g;
}

export function buildProps(world: World, props: Prop[]): { group: THREE.Group; update: () => void; find: (id: number) => THREE.Object3D | undefined } {
  const group = new THREE.Group();
  const views: PropView[] = [];
  const holders = new Map<number, THREE.Object3D>();
  for (const prop of props) {
    const look = lookOf(prop.kind, prop.id);
    const parts = prop.kind === 'tree' ? tree(prop.id, look) : prop.kind === 'bush' ? bush(prop.id, look) : { full: stone(prop.id, look), empty: null };
    const holder = new THREE.Group();
    holder.position.set(prop.x, surfaceHeight(world, prop.x, prop.y), prop.y);
    holder.rotation.y = look.turn;
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
