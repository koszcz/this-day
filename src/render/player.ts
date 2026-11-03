// The survivor: a small low-poly figure that bobs while walking and tucks down to sleep.
import * as THREE from 'three';
import { mat } from './palette';

export function buildPlayer() {
  const root = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.6, 6), mat('#3d6fb0'));
  body.position.y = 0.55;
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 0), mat('#e8b98f'));
  head.position.y = 1.05;
  const hair = new THREE.Mesh(new THREE.IcosahedronGeometry(0.21, 0), mat('#4a3322'));
  hair.position.y = 1.12;
  hair.scale.set(1, 0.7, 1);
  const legs = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.25, 0.2), mat('#5a4636'));
  legs.position.y = 0.13;
  for (const o of [body, head, hair, legs]) {
    o.castShadow = true;
    root.add(o);
  }
  const update = (moving: boolean, sleeping: boolean, elapsed: number) => {
    root.rotation.z = sleeping ? Math.PI / 2 : 0;
    root.position.y += sleeping ? 0.2 : 0;
    body.position.y = 0.55 + (moving ? Math.abs(Math.sin(elapsed * 14)) * 0.08 : 0);
  };
  return { root, update };
}
