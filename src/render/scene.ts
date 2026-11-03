// The renderer and the fixed isometric camera that follows the player.
import * as THREE from 'three';

const OFFSET = new THREE.Vector3(30, 34, 30);

export function createStage(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 400);
  let zoom = 13;
  const focus = new THREE.Vector3();

  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    const aspect = w / h;
    camera.left = (-zoom * aspect) / 2;
    camera.right = (zoom * aspect) / 2;
    camera.top = zoom / 2;
    camera.bottom = -zoom / 2;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', resize);
  window.addEventListener('wheel', (e) => {
    zoom = Math.max(7, Math.min(24, zoom + Math.sign(e.deltaY) * 1.2));
    resize();
  }, { passive: true });
  resize();

  const follow = (target: THREE.Vector3, dt: number) => {
    focus.lerp(target, Math.min(1, dt * 6));
    camera.position.copy(focus).add(OFFSET);
    camera.lookAt(focus);
  };
  const render = () => renderer.render(scene, camera);
  return { scene, camera, focus, follow, render, renderer };
}
