// Rain streaks that fall around the player. They fade in and out with the weather.
import * as THREE from 'three';

const DROPS = 700;
const AREA = 26;
const HEIGHT = 18;
const LENGTH = 0.9;
const SPEED = 22;

export function buildRain(scene: THREE.Scene) {
  const base = new Float32Array(DROPS * 3);
  for (let i = 0; i < DROPS; i++) {
    base[i * 3] = (((i * 7919) % 1000) / 1000 - 0.5) * AREA;
    base[i * 3 + 1] = (((i * 104729) % 1000) / 1000) * HEIGHT;
    base[i * 3 + 2] = (((i * 15485863) % 1000) / 1000 - 0.5) * AREA;
  }
  const positions = new Float32Array(DROPS * 6);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.LineBasicMaterial({ color: '#9fb8d8', transparent: true, opacity: 0, depthWrite: false });
  const lines = new THREE.LineSegments(geometry, material);
  lines.frustumCulled = false;
  lines.visible = false;
  scene.add(lines);

  // `amount` is 0 when dry and 1 in full rain.
  return (amount: number, focus: THREE.Vector3, elapsed: number) => {
    lines.visible = amount > 0.01;
    if (!lines.visible) return;
    material.opacity = 0.55 * amount;
    for (let i = 0; i < DROPS; i++) {
      const y = (((base[i * 3 + 1] - elapsed * SPEED) % HEIGHT) + HEIGHT) % HEIGHT;
      const x = focus.x + base[i * 3];
      const z = focus.z + base[i * 3 + 2];
      positions.set([x, focus.y + y, z, x - 0.1, focus.y + y + LENGTH, z - 0.1], i * 6);
    }
    geometry.attributes.position.needsUpdate = true;
  };
}
