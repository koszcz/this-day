// Moves the game clock forward: needs drain, fires burn, plants regrow and actions finish.
import { say, type GameState } from './state';
import { finishBusy } from './actions';
import { tickAnimals } from './animals';
import { tickNeeds } from './needs';
import { rainOnFires } from './fire';
import { burnFires } from './structures';
import { syncFood, tickSpoilage } from './spoilage';
import { drainFactor } from './weight';
import { stepWeather, tickWet } from './weather';
import { t } from '../text/text';

const SUBSTEP = 5;

function wakeReason(state: GameState): string | null {
  const s = state.stats;
  if (s.energy >= 100) return t('wake.rested');
  if (s.warmth < 15) return t('wake.cold');
  if (s.thirst < 5 || s.hunger < 5) return t('wake.needs');
  return null;
}

function stepOnce(state: GameState, minutes: number) {
  syncFood(state);
  state.time += minutes;
  burnFires(state, minutes);
  stepWeather(state);
  rainOnFires(state);
  tickWet(state, minutes);
  tickAnimals(state, minutes);
  for (const p of state.props) {
    if (p.regrowAt !== null && state.time >= p.regrowAt) {
      p.amount = p.max;
      p.regrowAt = null;
    }
  }
  const busy = state.busy;
  if (busy) {
    const used = Math.min(minutes, busy.remaining);
    state.stats.energy = Math.max(0, state.stats.energy - (busy.energy * drainFactor(state.inventory) * used) / busy.total);
    busy.remaining -= used;
  }
  tickNeeds(state, minutes);
  if (state.busy && state.busy.remaining <= 0 && !state.dead) finishBusy(state);
  tickSpoilage(state, minutes);
  if (state.sleeping) {
    const reason = wakeReason(state);
    if (reason) {
      state.sleeping = false;
      say(state, reason);
    }
  }
}

// Advances the game by some game minutes, in small slices so fast sleep stays accurate.
export function advance(state: GameState, minutes: number) {
  let left = minutes;
  while (left > 0 && !state.dead) {
    const slice = Math.min(SUBSTEP, left);
    stepOnce(state, slice);
    left -= slice;
  }
}
