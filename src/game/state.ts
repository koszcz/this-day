// The whole game state in one plain object, plus how a new game starts.
import { generateWorld } from '../world/generate';
import type { Prop, World } from '../world/types';
import { spawnAnimals, type Animal } from './animals';
import type { Inventory, ItemId } from './items';
import { t } from '../text/text';
import { newSkills, type Skills } from './skills';
import { START_MINUTE } from './time';
import type { Wound } from './wounds';
import { newWeather, type Weather } from './weather';

export interface Stats {
  health: number;
  hunger: number;
  thirst: number;
  energy: number;
  warmth: number;
}

export interface Structure {
  id: number;
  kind: 'fire' | 'shelter';
  x: number;
  y: number;
  // Minutes of burning left. Only fires use it.
  fuel: number;
}

export interface BusyAction {
  id: string;
  label: string;
  total: number;
  remaining: number;
  energy: number;
}

export interface GameState {
  seed: number;
  rng: number;
  time: number;
  world: World;
  props: Prop[];
  structures: Structure[];
  // Deer and hares wandering the island.
  animals: Animal[];
  player: { x: number; y: number };
  stats: Stats;
  inventory: Inventory;
  skills: Skills;
  // When you got each unit of perishable food, oldest first. Drives rotting.
  born: Partial<Record<ItemId, number[]>>;
  // Uses left on the axe and spear you carry.
  toolUses: Partial<Record<'axe' | 'spear', number>>;
  busy: BusyAction | null;
  sleeping: boolean;
  weather: Weather;
  // How soaked you are, 0 to 100.
  wet: number;
  // Minutes of sickness left.
  sick: number;
  // An injury from a slip or a spear thrust. Null when you are unhurt.
  wound: Wound | null;
  log: string[];
  dead: string | null;
}

export function newGame(seed: number): GameState {
  const { world, props } = generateWorld(seed);
  const state: GameState = {
    seed,
    rng: seed ^ 0x9e3779b9,
    time: START_MINUTE,
    world,
    props,
    structures: [],
    animals: [],
    player: { ...world.start },
    stats: { health: 100, hunger: 70, thirst: 60, energy: 75, warmth: 60 },
    inventory: {},
    skills: newSkills(),
    born: {},
    toolUses: {},
    busy: null,
    sleeping: false,
    weather: newWeather(START_MINUTE),
    wet: 0,
    sick: 0,
    wound: null,
    log: [t('intro.wake')],
    dead: null,
  };
  state.animals = spawnAnimals(state);
  return state;
}

export function say(state: GameState, text: string) {
  state.log.push(text);
  if (state.log.length > 40) state.log.shift();
}
