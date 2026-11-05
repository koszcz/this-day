// The survivor: a low-poly figure with head, torso, two arms and two legs on named joints.
// `joints` and `applyPose` are the API that action animations and held tools build on.
import * as THREE from 'three';
import { actionKind, actionPose } from './action-pose';
import { heldTool, type Carried } from './held-tool';
import { buildTool } from './tools';
import { buildArm, buildHead, buildLeg, buildTorso } from './survivor-parts';
import { ARM, BODY, HEAD, LEG, handY } from './survivor-look';
import { blendPose, computePose, JOINTS, type JointName, type Pose } from './pose';

// A pale copy of every part, drawn only where something stands in front of it.
// So the survivor shows through trees, rocks and hills as a flat outline shape.
const SEE_THROUGH = new THREE.MeshBasicMaterial({
  color: '#fff3c4',
  transparent: true,
  opacity: 0.7,
  depthFunc: THREE.GreaterDepth,
  depthWrite: false,
  // Skip pixels where the survivor itself is visible, so her own parts do not show through each other.
  stencilWrite: true,
  stencilRef: 1,
  stencilFunc: THREE.NotEqualStencilFunc,
});

function addSeeThrough(root: THREE.Object3D) {
  const parts: THREE.Mesh[] = [];
  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) parts.push(o as THREE.Mesh);
  });
  for (const part of parts) {
    const ghost = new THREE.Mesh(part.geometry, SEE_THROUGH);
    ghost.renderOrder = 10;
    part.add(ghost);
  }
}

export function buildPlayer() {
  const root = new THREE.Group();
  // The body group tilts and lifts as a whole, so the root stays free for position and heading.
  const body = new THREE.Group();
  root.add(body);

  const hips = new THREE.Group();
  hips.position.y = BODY.hipsY;
  body.add(hips);

  const torso = new THREE.Group();
  torso.add(...buildTorso());
  hips.add(torso);

  const head = new THREE.Group();
  head.position.y = HEAD.y;
  head.add(...buildHead());
  torso.add(head);

  const arm = (side: number) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * ARM.offsetX, ARM.shoulderY, 0);
    pivot.add(...buildArm());
    return pivot;
  };
  const armL = arm(-1);
  const armR = arm(1);
  torso.add(armL, armR);

  const leg = (side: number) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * LEG.offsetX, 0, 0);
    pivot.add(...buildLeg());
    return pivot;
  };
  const legL = leg(-1);
  const legR = leg(1);
  hips.add(legL, legR);

  /** The pivot groups, by name. Hang tools on `armR`, or drive them directly. */
  // Tools sit in the right hand, at the end of the arm. Only one shows at a time.
  const tools = { axe: buildTool('axe'), spear: buildTool('spear') };
  for (const t of Object.values(tools)) {
    t.position.y = handY();
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
  addSeeThrough(root);
  update(false, false, 0);
  return { root, joints, applyPose, update };
}
