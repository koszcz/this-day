// Shared setup for game tests: a fresh game, and ways to place the player and props.
import { addItem, type ItemId } from './items';
import { newGame, type GameState } from './state';
import type { PropKind } from '../world/types';

export function freshGame(seed = 1): GameState {
  const g = newGame(seed);
  g.props = [];
  return g;
}

export function give(g: GameState, id: ItemId, n = 1) {
  addItem(g.inventory, id, n);
}

export function putProp(g: GameState, kind: PropKind, dx = 0.5, dy = 0, amount = 3) {
  g.props.push({ id: g.props.length, kind, x: g.player.x + dx, y: g.player.y + dy, amount, max: amount, regrowAt: null });
}

// Keeps the weather dry for the whole test, so rain cannot put out fires.
export function keepDry(g: GameState) {
  g.weather = { raining: false, changeAt: Number.MAX_SAFE_INTEGER };
}
