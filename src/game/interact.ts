// Click an object for its actions: what each object offers, and the walk to it before the action starts.
import { hypot } from '../math/exact';
import { waterNear } from '../world/query';
import { availableActions, craftableActions } from './actions';
import type { HoverTarget } from './hover';
import { count } from './items';
import type { GameState } from './state';

export interface MenuEntry {
  id: string;
  label: string;
  icon: string;
  minutes: number;
  // Why the entry cannot be used right now. The menu shows this and does nothing.
  blocked?: string;
}

// An action the player chose on an object. They walk to the object, then the action starts.
export interface Errand {
  target: HoverTarget;
  action: string;
}

export type ErrandStep = { kind: 'walk'; x: number; y: number } | { kind: 'arrive' } | { kind: 'gone' };

const PROP_REACH = 1.2;
const FIRE_REACH = 1.3;

const PROP_ACTION = { tree: 'chop', bush: 'forage', stone: 'mine' } as const;

const entryOf = (a: { id: string; label: string; icon: string; minutes: number; blocked?: string }): MenuEntry => ({
  id: a.id, label: a.label, icon: a.icon, minutes: a.minutes, blocked: a.blocked,
});

// The actions you could start if you stood at (x, y). Reads the same rules as the old action bar.
function actionsAt(state: GameState, x: number, y: number): MenuEntry[] {
  return availableActions({ ...state, player: { x, y } }).map(entryOf);
}

function propMenu(state: GameState, id: number): MenuEntry[] {
  const prop = state.props.find((p) => p.id === id);
  if (!prop || prop.amount <= 0) return [];
  return actionsAt(state, prop.x, prop.y).filter((a) => a.id === PROP_ACTION[prop.kind]);
}

function waterMenu(state: GameState, x: number, y: number): MenuEntry[] {
  const here = actionsAt(state, x + 0.5, y + 0.5);
  const fish = here.find((a) => a.id === 'fish') ?? { id: 'fish', label: 'Fish', icon: '🐟', minutes: 0, blocked: 'needs spear' };
  return [here.find((a) => a.id === 'drink')!, fish];
}

function fireMenu(state: GameState, id: number): MenuEntry[] {
  const fire = state.structures.find((s) => s.id === id && s.kind === 'fire');
  if (!fire) return [];
  const here = actionsAt(state, fire.x, fire.y);
  const blocked = fire.fuel <= 0 ? 'the fire is out' : 'needs raw fish';
  const cook = here.find((a) => a.id === 'cook') ?? { id: 'cook', label: 'Cook fish', icon: '🍖', minutes: 0, blocked };
  const boil = here.find((a) => a.id === 'boil') ?? { id: 'boil', label: 'Boil and drink', icon: '♨️', minutes: 0, blocked: 'the fire is out' };
  return [here.find((a) => a.id === 'fuel')!, cook, boil];
}

function playerMenu(state: GameState): MenuEntry[] {
  const here = availableActions(state).map(entryOf);
  const sleep = here.find((a) => a.id === 'sleep') ?? { id: 'sleep', label: 'Sleep', icon: '😴', minutes: 0, blocked: 'not tired' };
  const crafts = craftableActions(state).map(({ recipe, action, enabled }) => ({
    ...entryOf(action),
    blocked: enabled ? undefined : 'item' in recipe.makes && count(state.inventory, recipe.makes.item) > 0 ? 'you have one' : 'needs materials',
  }));
  return [...here.filter((a) => a.id.startsWith('eat:')), sleep, ...crafts];
}

// What the HUD offers when you click this object. Empty means the click is just a walk.
export function menuFor(state: GameState, target: HoverTarget): MenuEntry[] {
  switch (target.kind) {
    case 'prop': return propMenu(state, target.id);
    case 'water': return waterMenu(state, target.x, target.y);
    case 'structure': return fireMenu(state, target.id);
    case 'player': return playerMenu(state);
  }
}

// One tick of an errand: keep walking, you are close enough to start, or the object is gone.
export function errandStep(state: GameState, errand: Errand): ErrandStep {
  const { target } = errand;
  const { x: px, y: py } = state.player;
  switch (target.kind) {
    case 'player':
      return { kind: 'arrive' };
    case 'prop': {
      const p = state.props.find((q) => q.id === target.id);
      if (!p || p.amount <= 0) return { kind: 'gone' };
      return hypot(p.x - px, p.y - py) <= PROP_REACH ? { kind: 'arrive' } : { kind: 'walk', x: p.x, y: p.y };
    }
    case 'structure': {
      const s = state.structures.find((q) => q.id === target.id);
      if (!s) return { kind: 'gone' };
      return hypot(s.x - px, s.y - py) <= FIRE_REACH ? { kind: 'arrive' } : { kind: 'walk', x: s.x, y: s.y };
    }
    case 'water':
      return waterNear(state.world, px, py) ? { kind: 'arrive' } : { kind: 'walk', x: target.x + 0.5, y: target.y + 0.5 };
  }
}
