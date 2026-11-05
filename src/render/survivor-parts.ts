// Builds the parts of the survivor's figure: torso with belt, head with face and hair, arms with
// hands, legs with boots. Each limb hangs from a pivot at its top. The figure looks toward +z.
import * as THREE from 'three';
import { ARM, BODY, COLORS, HEAD, LEG } from './survivor-look';

const cache = new Map<string, THREE.MeshLambertMaterial>();

/** A smooth-shaded material. The survivor is round where the scenery is faceted. */
function smooth(color: string): THREE.MeshLambertMaterial {
  let m = cache.get(color);
  if (!m) {
    m = new THREE.MeshLambertMaterial({ color });
    // Marks every pixel where the survivor is plainly visible, so the see-through copy skips them.
    m.stencilWrite = true;
    m.stencilRef = 1;
    m.stencilFunc = THREE.AlwaysStencilFunc;
    m.stencilZPass = THREE.ReplaceStencilOp;
    cache.set(color, m);
  }
  return m;
}

function mesh(geometry: THREE.BufferGeometry, color: string, x = 0, y = 0, z = 0): THREE.Mesh {
  const m = new THREE.Mesh(geometry, smooth(color));
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
}

/** The torso, from the hips (y = 0) up to the shoulders, with a belt and a collar. */
export function buildTorso(): THREE.Object3D[] {
  const h = BODY.torsoLength;
  const chest = mesh(new THREE.CylinderGeometry(BODY.shoulderWidth * 0.85, BODY.hipWidth * 1.1, h, 12), COLORS.shirt, 0, h / 2);
  chest.scale.z = 0.72;
  const belt = mesh(new THREE.CylinderGeometry(BODY.hipWidth * 1.15, BODY.hipWidth * 1.15, 0.045, 12), COLORS.belt, 0, 0.03);
  belt.scale.z = 0.76;
  const shoulders = mesh(new THREE.SphereGeometry(BODY.shoulderWidth * 0.85, 12, 8), COLORS.shirtDark, 0, h - 0.02);
  shoulders.scale.set(1, 0.4, 0.66);
  const collar = mesh(new THREE.CylinderGeometry(0.06, 0.07, BODY.neckLength + 0.02, 8), COLORS.skin, 0, h + BODY.neckLength / 2);
  return [chest, belt, shoulders, collar];
}

/** The head, around its pivot at the neck: a round skull, hair, ears, nose and two eyes. */
export function buildHead(): THREE.Object3D[] {
  const r = HEAD.radius;
  const skull = mesh(new THREE.SphereGeometry(r, 14, 10), COLORS.skin, 0, r);
  skull.scale.set(0.95, 1.05, 1);
  const hair = mesh(new THREE.SphereGeometry(r * 1.07, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), COLORS.hair, 0, r + 0.015, -0.012);
  const fringe = mesh(new THREE.BoxGeometry(r * 1.5, 0.04, 0.05), COLORS.hair, 0, r * 1.62, r * 0.78);
  const nose = mesh(new THREE.ConeGeometry(0.022, 0.05, 5), COLORS.skin, 0, r * 0.95, r * 1.02);
  nose.rotation.x = Math.PI / 2;
  const parts: THREE.Object3D[] = [skull, hair, fringe, nose];
  for (const side of [-1, 1]) {
    parts.push(mesh(new THREE.SphereGeometry(0.02, 6, 5), COLORS.eyes, side * r * 0.38, r * 1.12, r * 0.9));
    parts.push(mesh(new THREE.SphereGeometry(0.03, 6, 5), COLORS.skin, side * r * 0.97, r, 0));
  }
  return parts;
}

/** An arm hanging from the shoulder pivot: sleeve, bare forearm and a hand at the end. */
export function buildArm(): THREE.Object3D[] {
  const { upper, lower, radius } = ARM;
  const sleeve = mesh(new THREE.CylinderGeometry(radius * 1.15, radius * 1.05, upper, 8), COLORS.shirt, 0, -upper / 2);
  const forearm = mesh(new THREE.CylinderGeometry(radius * 0.9, radius * 0.75, lower, 8), COLORS.skin, 0, -upper - lower / 2);
  const hand = mesh(new THREE.SphereGeometry(radius * 1.3, 8, 6), COLORS.hands, 0, -upper - lower);
  return [sleeve, forearm, hand];
}

/** A leg hanging from the hip pivot: trousers, then a boot with a toe that points forward. */
export function buildLeg(): THREE.Object3D[] {
  const { length, bootHeight, radius } = LEG;
  const trousers = mesh(new THREE.CylinderGeometry(radius, radius * 0.85, length, 8), COLORS.trousers, 0, -length / 2);
  const shaft = mesh(new THREE.CylinderGeometry(radius * 0.95, radius * 0.9, bootHeight, 8), COLORS.boots, 0, -length - bootHeight / 2 + 0.02);
  const toe = mesh(new THREE.BoxGeometry(radius * 1.7, bootHeight * 0.55, radius * 2.6), COLORS.boots, 0, -length - bootHeight * 0.7, radius * 0.7);
  return [trousers, shaft, toe];
}
