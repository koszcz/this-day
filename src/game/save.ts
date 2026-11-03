// Saves the game to the browser so a refresh does not wipe your progress.
import type { GameState } from './state';

const KEY = 'this-day.save.v1';

export function saveGame(state: GameState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: playing on without saving is fine.
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY);
    const state = raw ? (JSON.parse(raw) as GameState) : null;
    return state && !state.dead ? state : null;
  } catch {
    return null;
  }
}

export function clearSave() {
  localStorage.removeItem(KEY);
}
