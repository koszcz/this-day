// Pure pose math for the jointed survivor. No three.js here, so it is easy to test and to extend.
// A pose is a set of joint angles in radians. Later animations blend their own poses over this one.

export interface JointAngles {
  x: number;
  z: number;
}

export interface Pose {
  /** Lift of the whole body above the ground. */
  rootY: number;
  /** Tilt of the whole body around z. A sleeping body lies at PI / 2. */
  rootTilt: number;
  /** Bend of the torso forward (x) and sideways (z). */
  torso: JointAngles;
  head: JointAngles;
  armL: JointAngles;
  armR: JointAngles;
  legL: JointAngles;
  legR: JointAngles;
}

export type JointName = 'torso' | 'head' | 'armL' | 'armR' | 'legL' | 'legR';
export const JOINTS: readonly JointName[] = ['torso', 'head', 'armL', 'armR', 'legL', 'legR'];

export interface PoseInput {
  moving: boolean;
  sleeping: boolean;
  /** Seconds of game-view time. */
  elapsed: number;
  /** The pose of the busy action, if any. It replaces walking and idling. */
  action?: Pose | null;
}

const STRIDE_RATE = 9;
const LEG_SWING = 0.7;
const ARM_SWING = 0.55;
const BREATH_RATE = 1.8;

export function restPose(): Pose {
  const j = (): JointAngles => ({ x: 0, z: 0 });
  return { rootY: 0, rootTilt: 0, torso: j(), head: j(), armL: j(), armR: j(), legL: j(), legR: j() };
}

export function walkPose(elapsed: number): Pose {
  const p = restPose();
  const s = Math.sin(elapsed * STRIDE_RATE);
  p.legL.x = s * LEG_SWING;
  p.legR.x = -s * LEG_SWING;
  // Arms swing against the legs on the same side.
  p.armL.x = -s * ARM_SWING;
  p.armR.x = s * ARM_SWING;
  p.rootY = Math.abs(Math.cos(elapsed * STRIDE_RATE)) * 0.06;
  p.torso.x = 0.08;
  return p;
}

export function idlePose(elapsed: number): Pose {
  const p = restPose();
  const b = Math.sin(elapsed * BREATH_RATE);
  p.torso.x = b * 0.03;
  p.head.x = -b * 0.02;
  p.armL.z = 0.06 + b * 0.04;
  p.armR.z = -0.06 - b * 0.04;
  p.rootY = b * 0.008;
  return p;
}

export function sleepPose(elapsed: number): Pose {
  const p = restPose();
  p.rootTilt = Math.PI / 2;
  p.rootY = 0.2;
  p.torso.x = Math.sin(elapsed * BREATH_RATE) * 0.02;
  // Limbs lie straight and a little apart, like a person stretched out.
  p.armL.z = 0.45;
  p.armR.z = -0.45;
  p.legL.z = 0.18;
  p.legR.z = -0.18;
  return p;
}

export function computePose(input: PoseInput): Pose {
  if (input.sleeping) return sleepPose(input.elapsed);
  if (input.action) return input.action;
  return input.moving ? walkPose(input.elapsed) : idlePose(input.elapsed);
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Blend two poses. t = 0 gives a, t = 1 gives b. Action animations use this to fade in. */
export function blendPose(a: Pose, b: Pose, t: number): Pose {
  const joint = (x: JointAngles, y: JointAngles): JointAngles => ({ x: mix(x.x, y.x, t), z: mix(x.z, y.z, t) });
  return {
    rootY: mix(a.rootY, b.rootY, t),
    rootTilt: mix(a.rootTilt, b.rootTilt, t),
    torso: joint(a.torso, b.torso),
    head: joint(a.head, b.head),
    armL: joint(a.armL, b.armL),
    armR: joint(a.armR, b.armR),
    legL: joint(a.legL, b.legL),
    legR: joint(a.legR, b.legR),
  };
}
