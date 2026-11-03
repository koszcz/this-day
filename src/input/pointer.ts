// Click-to-walk: turns a click on the canvas into a spot on the ground.
import * as THREE from 'three';

export function groundPoint(e: MouseEvent, camera: THREE.Camera, canvas: HTMLCanvasElement, height: number): { x: number; y: number } | null {
  const rect = canvas.getBoundingClientRect();
  const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
  const ray = new THREE.Raycaster();
  ray.setFromCamera(ndc, camera);
  const hit = new THREE.Vector3();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -height);
  return ray.ray.intersectPlane(plane, hit) ? { x: hit.x, y: hit.z } : null;
}
