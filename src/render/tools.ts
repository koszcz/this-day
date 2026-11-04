// Low-poly models of the axe and spear, built in code. The origin is the grip.
import * as THREE from 'three';
import { mat } from './palette';
import type { HeldTool } from './held-tool';

const WOOD = '#8a6035';
const STONE = '#8b9097';
const ROPE = '#c9b27a';

function part(geometry: THREE.BufferGeometry, color: string, x: number, y: number, z = 0) {
  const m = new THREE.Mesh(geometry, mat(color));
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
}

function axe() {
  const g = new THREE.Group();
  // The shaft runs on from the arm, away from the shoulder, with the head at its end.
  g.add(part(new THREE.CylinderGeometry(0.025, 0.03, 0.55, 5), WOOD, 0, -0.2));
  g.add(part(new THREE.BoxGeometry(0.06, 0.04, 0.05), ROPE, 0, -0.44));
  g.add(part(new THREE.BoxGeometry(0.05, 0.14, 0.2), STONE, 0, -0.44, 0.05));
  g.rotation.x = -0.5;
  return g;
}

function spear() {
  const g = new THREE.Group();
  g.add(part(new THREE.CylinderGeometry(0.022, 0.026, 1.5, 5), WOOD, 0, 0.25));
  g.add(part(new THREE.BoxGeometry(0.05, 0.04, 0.05), ROPE, 0, 0.95));
  g.add(part(new THREE.ConeGeometry(0.055, 0.22, 4), STONE, 0, 1.06));
  g.rotation.x = -0.35;
  return g;
}

export function buildTool(kind: HeldTool): THREE.Group {
  return kind === 'axe' ? axe() : spear();
}
