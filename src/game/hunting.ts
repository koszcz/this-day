// Hunting: throw your spear at a deer or hare in range. A hit drops meat, a miss still costs a use of the spear.
import { hypot } from '../math/exact';
import type { Action } from './actions';
import type { Animal, AnimalKind } from './animals';
import { ITEMS, addItem, count } from './items';
import { roll } from './random';
import { say, type GameState } from './state';
import { canCarry } from './weight';
import { maybeWound } from './wounds';
import { wearTool } from './wear';

// How far you can throw, in tiles.
export const HUNT_RANGE = 6;
// Inside this distance the throw is easier.
export const CLOSE_RANGE = 3;
export const CLOSE_HIT = 0.75;
export const FAR_HIT = 0.4;
// A deer can hurt you as you finish it.
export const DEER_WOUND_CHANCE = 0.1;

export const MEAT: Record<AnimalKind, number> = { deer: 3, hare: 1 };

export const huntId = (id: number) => `hunt:${id}`;

const distanceTo = (state: GameState, a: Animal) => hypot(a.x - state.player.x, a.y - state.player.y);

export const hitChance = (distance: number) => (distance <= CLOSE_RANGE ? CLOSE_HIT : FAR_HIT);

function throwSpear(state: GameState, id: number) {
  const a = state.animals.find((q) => q.id === id);
  if (!a || distanceTo(state, a) > HUNT_RANGE) {
    say(state, 'The animal is out of reach.');
    return;
  }
  const hit = roll(state) < hitChance(distanceTo(state, a));
  wearTool(state, 'spear');
  if (!hit) {
    say(state, `You throw the spear and miss the ${a.kind}.`);
    return;
  }
  state.animals = state.animals.filter((q) => q.id !== id);
  let got = 0;
  while (got < MEAT[a.kind] && canCarry(state.inventory, 'rawMeat')) {
    addItem(state.inventory, 'rawMeat');
    got++;
  }
  const meat = ITEMS.rawMeat.name.toLowerCase();
  if (got === 0) say(state, `You kill the ${a.kind}, but your pack is too full to take any ${meat}.`);
  else say(state, `You kill the ${a.kind} and take ${got} ${meat}${got < MEAT[a.kind] ? ', all you can carry' : ''}.`);
  if (a.kind === 'deer') maybeWound(state, DEER_WOUND_CHANCE);
}

// One hunt action for each animal in throwing range, when you carry a spear.
export function huntActions(state: GameState): Action[] {
  if (count(state.inventory, 'spear') === 0) return [];
  return state.animals
    .filter((a) => distanceTo(state, a) <= HUNT_RANGE)
    .map((a) => ({
      id: huntId(a.id), label: `Hunt ${a.kind}`, icon: '🏹', minutes: 0, energy: 0,
      run: (g: GameState) => throwSpear(g, a.id),
    }));
}
