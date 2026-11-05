// Draws the grass tufts as one instanced mesh, so hundreds cost a single draw call.
import * as THREE from 'three';
import type { Prop, World } from '../world/types';
import { surfaceHeight } from '../world/query';
import { grassTufts, tinted } from './scenery-look';

function bladeGeometry(): THREE.BufferGeometry {
  const pos: number[] = [];
  [-0.06, 0, 0.06].forEach((dx, i) => {
    const h = 0.22 + i * 0.05;
    const g = new THREE.ConeGeometry(0.035, h, 3);
    g.translate(dx, h / 2, (i - 1) * 0.04);
    g.rotateZ((i - 1) * 0.25);
    pos.push(...(g.toNonIndexed().getAttribute('position').array as Float32Array));
  });
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  out.computeVertexNormals();
  return out;
}

export function buildTufts(world: World, props: Prop[]): THREE.Object3D {
  const tufts = grassTufts(world, props);
  const material = new THREE.MeshLambertMaterial({ color: '#ffffff', flatShading: true });
  const inst = new THREE.InstancedMesh(bladeGeometry(), material, tufts.length);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  tufts.forEach((t, i) => {
    q.setFromAxisAngle(up, t.turn);
    m.compose(new THREE.Vector3(t.x, surfaceHeight(world, t.x, t.y), t.y), q, new THREE.Vector3(t.size, t.size, t.size));
    inst.setMatrixAt(i, m);
    inst.setColorAt(i, new THREE.Color(tinted('#5f9a3f', t.tint)));
  });
  inst.instanceMatrix.needsUpdate = true;
  if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  return inst;
}
