// The survivor: a low-poly figure with head, torso, two arms and two legs on named joints.
// `joints` and `applyPose` are the API that action animations and held tools build on.
import * as THREE from 'three';
import { mat } from './palette';
import { actionKind, actionPose } from './action-pose';
import { heldTool, type Carried } from './held-tool';
import { buildTool } from './tools';
import { blendPose, computePose, JOINTS, type JointName, type Pose } from './pose';

const SKIN = '#e8b98f';
const SHIRT = '#3d6fb0';
const TROUSERS = '#5a4636';

function limb(length: number, radius: number, color: string, endColor: string, endRadius: number) {
  // The pivot sits at the top of the limb, so rotating it swings the limb from the shoulder or hip.
  const pivot = new THREE.Group();
  const seg = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 0.85, length, 5), mat(color));
  seg.position.y = -length / 2;
  const end = new THREE.Mesh(new THREE.IcosahedronGeometry(endRadius, 0), mat(endColor));
  end.position.y = -length;
  for (const m of [seg, end]) {
    m.castShadow = true;
    pivot.add(m);
  }
  return pivot;
}

export function buildPlayer() {
  const root = new THREE.Group();
  // The body group tilts and lifts as a whole, so the root stays free for position and heading.
  const body = new THREE.Group();
  root.add(body);

  const hips = new THREE.Group();
  hips.position.y = 0.55;
  body.add(hips);

  const torso = new THREE.Group();
  hips.add(torso);
  const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.17, 0.5, 6), mat(SHIRT));
  chest.position.y = 0.25;
  chest.castShadow = true;
  torso.add(chest);

  const head = new THREE.Group();
  head.position.y = 0.58;
  torso.add(head);
  const skull = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 0), mat(SKIN));
  skull.position.y = 0.14;
  const hair = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 0), mat('#4a3322'));
  hair.position.y = 0.2;
  hair.scale.set(1, 0.7, 1);
  for (const m of [skull, hair]) {
    m.castShadow = true;
    head.add(m);
  }

  const armL = limb(0.42, 0.055, SHIRT, SKIN, 0.065);
  armL.position.set(-0.27, 0.45, 0);
  const armR = limb(0.42, 0.055, SHIRT, SKIN, 0.065);
  armR.position.set(0.27, 0.45, 0);
  torso.add(armL, armR);

  const legL = limb(0.55, 0.075, TROUSERS, '#3a2c20', 0.08);
  legL.position.set(-0.1, 0, 0);
  const legR = limb(0.55, 0.075, TROUSERS, '#3a2c20', 0.08);
  legR.position.set(0.1, 0, 0);
  hips.add(legL, legR);

  /** The pivot groups, by name. Hang tools on `armR`, or drive them directly. */
  // Tools sit in the right hand, at the end of the arm. Only one shows at a time.
  const tools = { axe: buildTool('axe'), spear: buildTool('spear') };
  for (const t of Object.values(tools)) {
    t.position.y = -0.42;
    t.visible = false;
    armR.add(t);
  }
  const showTool = (held: ReturnType<typeof heldTool>) => {
    tools.axe.visible = held === 'axe';
    tools.spear.visible = held === 'spear';
  };

  const joints: Record<JointName, THREE.Group> = { torso, head, armL, armR, legL, legR };

  const applyPose = (pose: Pose) => {
    body.rotation.z = pose.rootTilt;
    body.position.y = pose.rootY;
    for (const name of JOINTS) {
      joints[name].rotation.x = pose[name].x;
      joints[name].rotation.z = pose[name].z;
    }
  };

  // The action pose fades in and out, so the arms do not snap between poses.
  let weight = 0;
  let lastElapsed = 0;
  let lastKind: ReturnType<typeof actionKind> = null;
  const FADE_PER_SECOND = 6;
  const update = (moving: boolean, sleeping: boolean, elapsed: number, busyId?: string | null, carried?: Carried) => {
    showTool(heldTool(carried ?? { axe: false, spear: false }, busyId, sleeping));
    const dt = Math.max(0, Math.min(0.25, elapsed - lastElapsed));
    lastElapsed = elapsed;
    const kind = moving || sleeping ? null : actionKind(busyId);
    if (kind) lastKind = kind;
    weight = Math.max(0, Math.min(1, weight + (kind ? 1 : -1) * dt * FADE_PER_SECOND));
    const base = computePose({ moving, sleeping, elapsed });
    if (weight <= 0 || !lastKind) return applyPose(base);
    applyPose(blendPose(base, actionPose(lastKind, elapsed), weight));
  };
  update(false, false, 0);
  return { root, joints, applyPose, update };
}
