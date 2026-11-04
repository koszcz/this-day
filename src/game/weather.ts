// Rain spells and getting wet: when it rains, who stays dry, and how you dry out.
import { roll } from './random';
import { say, type GameState } from './state';
import { FIRE_WARM_RADIUS, isSheltered, litFireNear } from './structures';

export interface Weather {
  raining: boolean;
  // Game minute when the weather flips: rain starts, or rain stops.
  changeAt: number;
}

// Wet points gained each minute in the rain, and lost each minute while drying.
export const SOAK_RATE = 2;
export const DRY_RATE_FIRE = 1;
export const DRY_RATE_SHELTER = 0.6;
export const DRY_RATE_OPEN = 0.1;
// How many warmth points a fully wet body loses from its target.
export const WET_CHILL = 30;

const clamp = (v: number) => Math.max(0, Math.min(100, v));

export const newWeather = (now: number): Weather => ({ raining: false, changeAt: now + 240 });

// Saves from before rain existed have no weather: give them a dry start.
export function ensureWeather(state: GameState) {
  state.weather ??= newWeather(state.time);
  state.wet ??= 0;
}

// You are rained on when it rains and no lean-to covers you.
export const isRainedOn = (state: GameState) => state.weather.raining && !isSheltered(state);

// Flips the weather when its time comes. Dry spells last 4 to 12 hours, rain 1.5 to 4 hours.
export function stepWeather(state: GameState) {
  const w = state.weather;
  if (state.time < w.changeAt) return;
  w.raining = !w.raining;
  const span = w.raining ? 90 + 150 * roll(state) : 240 + 480 * roll(state);
  w.changeAt = state.time + span;
  say(state, w.raining ? 'Dark clouds open. Rain begins to fall.' : 'The rain stops.');
}

export function tickWet(state: GameState, minutes: number) {
  const before = state.wet;
  if (isRainedOn(state)) state.wet = clamp(state.wet + SOAK_RATE * minutes);
  else {
    let dry = DRY_RATE_OPEN;
    if (isSheltered(state)) dry = DRY_RATE_SHELTER;
    if (litFireNear(state, FIRE_WARM_RADIUS)) dry = Math.max(dry, DRY_RATE_FIRE);
    state.wet = clamp(state.wet - dry * minutes);
  }
  if (before < 50 && state.wet >= 50) say(state, 'You are soaked through. The chill bites.');
  if (before > 0 && state.wet === 0) say(state, 'You are dry again.');
}
