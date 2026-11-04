// Poses for the busy action: chopping, fishing, picking, drinking, tending a fire, eating and more.
// Pure math, like pose.ts. `actionKind` maps an action id from src/game/actions.ts to a pose family.
import { restPose, type Pose } from './pose';

export type ActionKind = 'chop' | 'mine' | 'spear' | 'pick' | 'drink' | 'tend' | 'eat' | 'craft' | 'bandage';

const KINDS: Record<string, ActionKind> = {
  chop: 'chop',
  mine: 'mine',
  fish: 'spear',
  forage: 'pick',
  tinder: 'pick',
  fibre: 'pick',
  kindling: 'pick',
  drink: 'drink',
  fuel: 'tend',
  light: 'tend',
  cook: 'tend',
  cookMeat: 'tend',
  boil: 'tend',
  bandage: 'bandage',
};

/** The pose family for an action id, or null when the action has no animation (such as sleep). */
export function actionKind(id: string | null | undefined): ActionKind | null {
  if (!id) return null;
  if (id.startsWith('eat:')) return 'eat';
  if (id.startsWith('discard:')) return 'pick';
  if (id.startsWith('craft:')) return 'craft';
  return KINDS[id] ?? null;
}

/** Radians of animation phase per second, for each kind. */
export const RATE: Record<ActionKind, number> = { chop: 5, mine: 4, spear: 3, pick: 4, drink: 2, tend: 2.5, eat: 3, craft: 6, bandage: 3 };

// 0..1 and back, a smooth repeat.
const wave = (t: number) => (1 - Math.cos(t)) / 2;

function chopPose(t: number): Pose {
  const p = restPose();
  const s = wave(t);
  // Raise both arms back, then swing them down through the tree.
  p.armL.x = p.armR.x = -2.4 + s * 2.2 * (s > 0.5 ? 1 : 0.4);
  p.torso.x = -0.15 + s * 0.45;
  p.legL.x = -0.15;
  p.legR.x = 0.15;
  return p;
}

function minePose(t: number): Pose {
  const p = chopPose(t);
  p.rootY = -0.12;
  p.torso.x += 0.25;
  p.legL.x = p.legR.x = -0.5;
  return p;
}

function spearPose(t: number): Pose {
  const p = restPose();
  const s = wave(t);
  // Draw back, then thrust down toward the water.
  p.armR.x = -1.6 + s * 1.2;
  p.armL.x = -0.9 + s * 0.4;
  p.torso.x = 0.15 + s * 0.4;
  p.head.x = 0.2;
  p.legL.x = 0.3;
  p.legR.x = -0.3;
  return p;
}

function pickPose(t: number): Pose {
  const p = restPose();
  const a = Math.sin(t);
  // Bend over and reach out with each hand in turn.
  p.torso.x = 0.7;
  p.head.x = -0.3;
  p.armL.x = -0.9 + a * 0.35;
  p.armR.x = -0.9 - a * 0.35;
  p.rootY = -0.04;
  return p;
}

function drinkPose(t: number): Pose {
  const p = restPose();
  const s = wave(t);
  // Crouch low and dip the face to cupped hands.
  p.rootY = -0.22;
  p.legL.x = p.legR.x = -1.0;
  p.torso.x = 0.55 + s * 0.12;
  p.head.x = 0.25;
  p.armL.x = p.armR.x = -1.2;
  p.armL.z = 0.2;
  p.armR.z = -0.2;
  return p;
}

function tendPose(t: number): Pose {
  const p = restPose();
  const a = Math.sin(t);
  // Lean over the flames and turn the food with one hand.
  p.torso.x = 0.35;
  p.head.x = 0.2;
  p.rootY = -0.06;
  p.legL.x = p.legR.x = -0.3;
  p.armR.x = -1.1 + a * 0.3;
  p.armR.z = a * 0.25;
  p.armL.x = -0.5;
  return p;
}

function eatPose(t: number): Pose {
  const p = restPose();
  const s = wave(t);
  // A hand rises to the mouth and the head tips toward it.
  p.armR.x = -0.4 - s * 1.9;
  p.armL.x = -0.3;
  p.head.x = s * 0.18;
  p.torso.x = 0.05;
  return p;
}

function craftPose(t: number): Pose {
  const p = restPose();
  const a = Math.sin(t);
  // Both hands busy in front of the body.
  p.torso.x = 0.3;
  p.head.x = 0.25;
  p.armL.x = -1.0 + a * 0.12;
  p.armR.x = -1.0 - a * 0.12;
  p.armL.z = 0.15;
  p.armR.z = -0.15;
  return p;
}

function bandagePose(t: number): Pose {
  const p = restPose();
  const a = Math.sin(t);
  // One arm held out, the other wraps around it.
  p.torso.x = 0.2;
  p.head.x = 0.3;
  p.armL.x = -1.0;
  p.armR.x = -1.1 + a * 0.2;
  p.armR.z = -0.3;
  return p;
}

const BUILDERS: Record<ActionKind, (t: number) => Pose> = {
  chop: chopPose, mine: minePose, spear: spearPose, pick: pickPose, drink: drinkPose,
  tend: tendPose, eat: eatPose, craft: craftPose, bandage: bandagePose,
};

/** The pose for one action kind at a moment in time. Repeats smoothly. */
export function actionPose(kind: ActionKind, elapsed: number): Pose {
  return BUILDERS[kind](elapsed * RATE[kind]);
}
