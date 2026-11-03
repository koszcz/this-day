// Sun, moon and sky: light and colors follow the time of day, and the sun's shadow follows the player.
import * as THREE from 'three';
import { daylight, hourOf } from '../game/time';

const NIGHT_SKY = new THREE.Color('#0a1028');
const DAY_SKY = new THREE.Color('#a9d6ea');
const DUSK_SKY = new THREE.Color('#e08a5a');
const MOON = new THREE.Color('#7a8ccc');
const SUN = new THREE.Color('#fff1d6');

export function buildDaylight(scene: THREE.Scene) {
  const hemi = new THREE.HemisphereLight('#ffffff', '#5a6b4a', 0.6);
  const sun = new THREE.DirectionalLight('#ffffff', 1);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const cam = sun.shadow.camera;
  cam.left = cam.bottom = -22;
  cam.right = cam.top = 22;
  cam.near = 1;
  cam.far = 120;
  sun.shadow.bias = -0.0006;
  scene.add(hemi, sun, sun.target);
  scene.background = new THREE.Color();

  return (time: number, focus: THREE.Vector3) => {
    const d = daylight(time);
    const h = hourOf(time);
    const angle = ((h - 6) / 12) * Math.PI;
    const dir = new THREE.Vector3(Math.cos(angle) * 0.7 + 0.2, Math.max(0.25, Math.sin(angle)), 0.5).normalize();
    sun.position.copy(focus).addScaledVector(dir, 60);
    sun.target.position.copy(focus);
    sun.color.copy(MOON).lerp(SUN, d);
    sun.intensity = 0.28 + 1.0 * d;
    hemi.intensity = 0.35 + 0.65 * d;
    const dusk = 1 - Math.abs(d - 0.3) / 0.3;
    const sky = (scene.background as THREE.Color).copy(NIGHT_SKY).lerp(DAY_SKY, d);
    if (d > 0 && d < 0.6) sky.lerp(DUSK_SKY, Math.max(0, dusk) * 0.6);
  };
}
