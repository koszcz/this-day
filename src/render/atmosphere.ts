// Sky gradient behind the island, mist along the map edge, and leaves and dust motes drifting near the player.
import * as THREE from 'three';
import { MOTE_COUNT, driftOf, edgeMist, skyEnds } from './atmosphere-math';

const MIST_STEP = 2;
const MIST_HEIGHT = 1.4;

function buildSky(scene: THREE.Scene) {
  const canvas = document.createElement('canvas');
  canvas.width = 2;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  scene.background = texture;
  const css = (c: { r: number; g: number; b: number }) =>
    `rgb(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)})`;
  return (base: THREE.Color) => {
    // Colors are linear in three.js and the canvas holds sRGB, so convert before painting.
    const srgb = base.clone().convertLinearToSRGB();
    const { top, horizon } = skyEnds(srgb);
    const g = ctx.createLinearGradient(0, 0, 0, 64);
    g.addColorStop(0, css(top));
    g.addColorStop(1, css(horizon));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 2, 64);
    texture.needsUpdate = true;
  };
}

function buildMist(scene: THREE.Scene, size: number) {
  const n = size / MIST_STEP + 1;
  const positions = new Float32Array(n * n * 3);
  const colors = new Float32Array(n * n * 4);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const k = j * n + i;
      positions.set([i * MIST_STEP, MIST_HEIGHT, j * MIST_STEP], k * 3);
      colors.set([1, 1, 1, edgeMist(i * MIST_STEP, j * MIST_STEP, size) * 0.75], k * 4);
    }
  }
  const indices: number[] = [];
  for (let j = 0; j < n - 1; j++) {
    for (let i = 0; i < n - 1; i++) {
      const a = j * n + i;
      indices.push(a, a + n, a + 1, a + 1, a + n, a + n + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 4));
  geo.setIndex(indices);
  const material = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false });
  const mesh = new THREE.Mesh(geo, material);
  mesh.frustumCulled = false;
  scene.add(mesh);
  return { mesh, material };
}

function buildSpecks(scene: THREE.Scene) {
  const positions = new Float32Array(MOTE_COUNT * 3);
  const colors = new Float32Array(MOTE_COUNT * 3);
  const leaf = new THREE.Color('#9a8a3a');
  const dust = new THREE.Color('#fff3c8');
  for (let i = 0; i < MOTE_COUNT; i++) (i % 4 === 0 ? leaf : dust).toArray(colors, i * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({ size: 4, sizeAttenuation: false,vertexColors: true, transparent: true, opacity: 0.7, depthWrite: false });
  const points = new THREE.Points(geo, material);
  points.frustumCulled = false;
  scene.add(points);
  return { points, positions, geo, material };
}

export function buildAtmosphere(scene: THREE.Scene) {
  const paintSky = buildSky(scene);
  let mist: ReturnType<typeof buildMist> | null = null;
  let mistSize = 0;
  const specks = buildSpecks(scene);
  const white = new THREE.Color('#ffffff');

  // `sky` is the colour of the sky now. `gloom` is 0 when dry and 1 in full rain.
  return (sky: THREE.Color, size: number, focus: THREE.Vector3, elapsed: number, gloom: number) => {
    paintSky(sky);
    if (!mist || mistSize !== size) {
      if (mist) scene.remove(mist.mesh);
      mist = buildMist(scene, size);
      mistSize = size;
    }
    mist.material.color.copy(sky).lerp(white, 0.35);
    for (let i = 0; i < MOTE_COUNT; i++) {
      const p = driftOf(i, elapsed);
      specks.positions.set([focus.x + p.x, focus.y + p.y * 0.6 + 0.2, focus.z + p.z], i * 3);
    }
    specks.geo.attributes.position.needsUpdate = true;
    specks.material.opacity = 0.7 * (1 - gloom);
    specks.points.visible = gloom < 0.95;
  };
}
