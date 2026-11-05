// Hunger, thirst, energy, warmth and health: how they drain and what happens when they run out.
import { tileAt } from '../world/query';
import { say, type GameState } from './state';
import { FIRE_WARM_RADIUS, isSheltered, litFireNear } from './structures';
import { ambientWarmth } from './time';
import { drainFactor } from './weight';
import { crossedThirstHint, pointToWater } from './water-hint';
import { WET_CHILL } from './weather';
import { BLEED_DRAIN, isBleeding, tickWound } from './wounds';
import { t } from '../text/text';

// How many warmth points a lean-to adds to what your body drifts toward.
const SHELTER_WARMTH = 32;

const clamp = (v: number) => Math.max(0, Math.min(100, v));

// The warmth the player's body is drifting toward right now.
export function targetWarmth(state: GameState): number {
  let target = ambientWarmth(state.time);
  if (isSheltered(state)) target += SHELTER_WARMTH;
  if (litFireNear(state, FIRE_WARM_RADIUS)) target = Math.max(target, 88);
  if (tileAt(state.world, state.player.x, state.player.y) === 'shallow') target -= 25;
  target -= (state.wet / 100) * WET_CHILL;
  return clamp(target);
}

export function tickNeeds(state: GameState, minutes: number) {
  const s = state.stats;
  const rest = state.sleeping ? 0.5 : 1;
  s.hunger = clamp(s.hunger - 0.04 * minutes * rest);
  const thirstBefore = s.thirst;
  s.thirst = clamp(s.thirst - (0.07 + (state.sick > 0 ? 0.04 : 0)) * minutes * rest);
  if (crossedThirstHint(thirstBefore, s.thirst)) pointToWater(state);
  if (state.sleeping) {
    const sheltered = isSheltered(state) ? 1.4 : 1;
    s.energy = clamp(s.energy + 0.18 * sheltered * minutes);
  } else {
    s.energy = clamp(s.energy - 0.03 * drainFactor(state.inventory) * minutes);
  }
  s.warmth = clamp(s.warmth + (targetWarmth(state) - s.warmth) * Math.min(1, 0.03 * (1 + state.wet / 100) * minutes));
  if (state.sick > 0) state.sick = Math.max(0, state.sick - minutes);
  const bleeding = isBleeding(state);
  tickWound(state, minutes);
  applyHealth(state, minutes, bleeding);
}

function applyHealth(state: GameState, minutes: number, bleeding: boolean) {
  const s = state.stats;
  let damage = 0;
  let cause = '';
  const hurt = (amount: number, why: string) => {
    if (amount > damage) cause = why;
    damage += amount;
  };
  if (s.thirst <= 0) hurt(0.2, t('death.thirst'));
  if (s.hunger <= 0) hurt(0.12, t('death.hunger'));
  if (s.warmth < 15) hurt(s.warmth <= 0 ? 0.25 : 0.1, t('death.cold'));
  if (s.energy <= 0) hurt(0.08, t('death.exhaustion'));
  if (state.sick > 0) hurt(0.05, t('death.sickness'));
  if (bleeding) hurt(BLEED_DRAIN, t('death.bleeding'));
  if (damage > 0) s.health = clamp(s.health - damage * minutes);
  else if (s.hunger > 35 && s.thirst > 35 && s.warmth > 35 && state.sick === 0 && !bleeding) s.health = clamp(s.health + 0.05 * minutes);
  if (s.health <= 0 && !state.dead) {
    state.dead = cause || t('death.other');
    say(state, t('death.log', { cause: state.dead }));
  }
}
