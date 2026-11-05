// Lighting a campfire with tinder and kindling, and rain putting out fires with no lean-to beside them.
import { hypot } from '../math/exact';
import { count, removeItem } from './items';
import { roll } from './random';
import { skillLevel } from './skills';
import { say, type GameState, type Structure } from './state';
import { SHELTER_RADIUS } from './structures';
import { t } from '../text/text';

// Chance a lighting attempt works, in dry weather and while it rains.
export const LIGHT_CHANCE_DRY = 0.65;
export const LIGHT_CHANCE_RAIN = 0.25;
// Minutes of burning a fresh flame gives before you add wood.
export const LIGHT_FUEL = 60;

export const hasLightingKit = (state: GameState) => count(state.inventory, 'tinder') > 0 && count(state.inventory, 'kindling') > 0;

export function lightChance(state: GameState): number {
  const base = state.weather.raining ? LIGHT_CHANCE_RAIN : LIGHT_CHANCE_DRY;
  return Math.min(0.95, base + skillLevel(state.skills.crafting) * 0.03);
}

// Lighting in the rain is refused when no lean-to covers the fire, because the rain would put it out.
export const rainRefusal = (state: GameState, fire: Structure) =>
  state.weather.raining && !covered(state, fire) ? t('fire.rainRefusal') : undefined;

// One attempt: it always uses up the tinder and kindling. Returns whether the fire caught.
export function tryLight(state: GameState, fire: Structure): boolean {
  if (!hasLightingKit(state)) return false;
  removeItem(state.inventory, 'tinder');
  removeItem(state.inventory, 'kindling');
  if (roll(state) < lightChance(state)) {
    fire.fuel = LIGHT_FUEL;
    say(state, t('fire.caught'));
    return true;
  }
  say(state, t(state.weather.raining ? 'fire.dampFail' : 'fire.sparkFail'));
  return false;
}

export const covered = (state: GameState, fire: Structure) =>
  state.structures.some((s) => s.kind === 'shelter' && hypot(s.x - fire.x, s.y - fire.y) <= SHELTER_RADIUS);

// While it rains, a lit fire with no lean-to beside it goes out.
export function rainOnFires(state: GameState) {
  if (!state.weather.raining) return;
  for (const f of state.structures) {
    if (f.kind !== 'fire' || f.fuel <= 0 || covered(state, f)) continue;
    f.fuel = 0;
    say(state, t('fire.rainedOut'));
  }
}
