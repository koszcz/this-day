// Saves the game to the browser so a refresh does not wipe your progress.
import type { GameState } from './state';
import { ensureAnimals } from './animals';
import { ensureFood } from './spoilage';
import { ensureWear } from './wear';
import { ensureWeather } from './weather';
import { ensureWound } from './wounds';

const KEY = 'this-day.save.v1';
// A slot name keeps a separate save, so two tabs on one browser do not share a game.
const keyOf = (slot = '') => (slot ? `${KEY}.${slot}` : KEY);

export function saveGame(state: GameState, slot = '') {
  try {
    localStorage.setItem(keyOf(slot), JSON.stringify(state));
  } catch {
    // Storage full or blocked: playing on without saving is fine.
  }
}

export function loadGame(slot = ''): GameState | null {
  try {
    const raw = localStorage.getItem(keyOf(slot));
    const state = raw ? (JSON.parse(raw) as GameState) : null;
    if (state) {
      ensureWeather(state);
      ensureWear(state);
      ensureFood(state);
      ensureWound(state);
      ensureAnimals(state);
    }
    return state && !state.dead ? state : null;
  } catch {
    return null;
  }
}

export function clearSave(slot = '') {
  localStorage.removeItem(keyOf(slot));
}
