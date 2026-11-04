// Everything the player can do right now: gather, drink, fish, cook, eat, sleep and craft.
import { hypot } from '../math/exact';
import { waterNear } from '../world/query';
import type { Prop, PropKind } from '../world/types';
import { hasLightingKit, tryLight } from './fire';
import { ITEMS, addItem, count, removeItem, type ItemId } from './items';
import { roll } from './random';
import { RECIPES, type Recipe } from './recipes';
import { gainXp, SKILL_NAMES, skillLevel, speedFactor, type SkillId } from './skills';
import { say, type GameState } from './state';
import { FIRE_MAX_FUEL, addStructure, litFireNear, nearest } from './structures';
import { MINUTES_PER_DAY } from './time';
import { rottenCount, takeUnit } from './spoilage';
import { canCarry } from './weight';
import { bandageWound, canBandage, maybeWound } from './wounds';
import { freshTool, isTool, wearTool } from './wear';

export interface Action {
  id: string;
  label: string;
  icon: string;
  minutes: number;
  energy: number;
  // Why the action cannot be used right now. The button shows this and does nothing.
  blocked?: string;
  run: (state: GameState) => void;
}

const REACH = 1.5;
// Raw sea and pond water makes you sick this often. Boiling it first is safe.
export const DIRTY_WATER_SICK_CHANCE = 0.4;

function nearProp(state: GameState, kind: PropKind): Prop | undefined {
  let best: Prop | undefined;
  let bestDist = REACH;
  for (const p of state.props) {
    if (p.kind !== kind || p.amount <= 0) continue;
    const d = hypot(p.x - state.player.x, p.y - state.player.y);
    if (d < bestDist) {
      best = p;
      bestDist = d;
    }
  }
  return best;
}

function deplete(state: GameState, prop: Prop, regrowDays: number) {
  prop.amount -= 1;
  if (prop.amount <= 0) prop.regrowAt = state.time + regrowDays * MINUTES_PER_DAY;
}

function train(state: GameState, skill: SkillId, xp: number) {
  if (gainXp(state.skills, skill, xp)) say(state, `${SKILL_NAMES[skill]} is now level ${skillLevel(state.skills[skill])}.`);
}

function gather(state: GameState, prop: Prop, item: ItemId, skill: SkillId, regrowDays: number, bonus: number) {
  const lucky = roll(state) < bonus + skillLevel(state.skills[skill]) * 0.05;
  if (!canCarry(state.inventory, item)) {
    say(state, 'Your pack is too full.');
    return;
  }
  const extra = lucky && canCarry(state.inventory, item, 2) ? 1 : 0;
  addItem(state.inventory, item, 1 + extra);
  deplete(state, prop, regrowDays);
  train(state, skill, 3);
  say(state, `You get ${1 + extra} ${ITEMS[item].name.toLowerCase()}.`);
}

// Loose material that does not use up the bush or tree.
function gatherLoose(state: GameState, item: ItemId, text: string) {
  if (!canCarry(state.inventory, item)) {
    say(state, 'Your pack is too full.');
    return;
  }
  addItem(state.inventory, item);
  say(state, text);
}

const packFull = (state: GameState, item: ItemId) => (canCarry(state.inventory, item) ? undefined : 'pack is full');

function contextActions(state: GameState): Action[] {
  const out: Action[] = [];
  const s = state.skills;
  if (waterNear(state.world, state.player.x, state.player.y)) {
    out.push({
      id: 'drink', label: 'Drink', icon: '💧', minutes: 5, energy: 0,
      run: (g) => {
        g.stats.thirst = Math.min(100, g.stats.thirst + 35);
        if (roll(g) < DIRTY_WATER_SICK_CHANCE) {
          g.sick = 360;
          say(g, 'The water tastes foul. Your stomach turns. You feel sick.');
        } else say(g, 'The water is cold. It tastes of salt and mud.');
      },
    });
    if (count(state.inventory, 'spear') > 0) {
      out.push({
        id: 'fish', label: 'Fish', icon: '🐟', minutes: Math.round(35 * speedFactor(s.fishing)), energy: 4,
        blocked: packFull(state, 'rawFish'),
        run: (g) => {
          train(g, 'fishing', 3);
          wearTool(g, 'spear');
          maybeWound(g);
          if (roll(g) < 0.35 + skillLevel(g.skills.fishing) * 0.05 && canCarry(g.inventory, 'rawFish')) {
            addItem(g.inventory, 'rawFish');
            say(g, 'You spear a fish.');
          } else say(g, 'The fish slip away.');
        },
      });
    }
  }
  const bush = nearProp(state, 'bush');
  if (bush) {
    out.push({
      id: 'forage', label: 'Pick berries', icon: '🫐', minutes: Math.round(10 * speedFactor(s.foraging)), energy: 1,
      blocked: packFull(state, 'berries'),
      run: (g) => nearProp(g, 'bush') && gather(g, nearProp(g, 'bush')!, 'berries', 'foraging', 1.5, 0.2),
    });
  }
  const tree = nearProp(state, 'tree');
  if (tree) {
    const axe = count(state.inventory, 'axe') > 0;
    out.push({
      id: 'chop', label: axe ? 'Chop tree' : 'Break branches', icon: '🪵', minutes: Math.round((axe ? 14 : 36) * speedFactor(s.labor)), energy: axe ? 4 : 6,
      blocked: packFull(state, 'wood'),
      run: (g) => {
        const t = nearProp(g, 'tree');
        if (!t) return;
        gather(g, t, 'wood', 'labor', 4, axe ? 0.3 : 0);
        if (axe) wearTool(g, 'axe');
      },
    });
  }
  if (bush) {
    out.push({
      id: 'tinder', label: 'Gather tinder', icon: '🌾', minutes: 6, energy: 1,
      blocked: packFull(state, 'tinder'),
      run: (g) => gatherLoose(g, 'tinder', 'You pull dry grass from under the bush.'),
    });
  }
  if (bush) {
    out.push({
      id: 'fibre', label: 'Strip fibre', icon: '🌿', minutes: 8, energy: 1,
      blocked: packFull(state, 'fibre'),
      run: (g) => gatherLoose(g, 'fibre', 'You strip tough fibre from the bush stems.'),
    });
  }
  if (tree) {
    out.push({
      id: 'kindling', label: 'Gather kindling', icon: '🥢', minutes: 8, energy: 1,
      blocked: packFull(state, 'kindling'),
      run: (g) => gatherLoose(g, 'kindling', 'You snap dry twigs from the tree.'),
    });
  }
  const stone = nearProp(state, 'stone');
  if (stone) {
    out.push({
      id: 'mine', label: 'Gather stone', icon: '🪨', minutes: Math.round(22 * speedFactor(s.labor)), energy: 4,
      blocked: packFull(state, 'stone'),
      run: (g) => {
        const s = nearProp(g, 'stone');
        if (!s) return;
        gather(g, s, 'stone', 'labor', 5, 0.25);
        maybeWound(g);
      },
    });
  }
  return out;
}

function fireActions(state: GameState): Action[] {
  const out: Action[] = [];
  const fire = nearest(state, 'fire', 1.8);
  if (fire) {
    if (fire.fuel > 0) {
      out.push({
        id: 'fuel', label: 'Feed fire', icon: '🔥', minutes: 4, energy: 0,
        blocked: count(state.inventory, 'wood') > 0 ? undefined : 'needs wood',
        run: (g) => {
          const f = nearest(g, 'fire', 1.8);
          if (!f || !removeItem(g.inventory, 'wood')) return;
          f.fuel = Math.min(FIRE_MAX_FUEL, f.fuel + 120);
          say(g, 'The fire crackles.');
        },
      });
    } else {
      out.push({
        id: 'light', label: 'Light fire', icon: '🔥', minutes: 10, energy: 1,
        blocked: hasLightingKit(state) ? undefined : 'needs tinder and kindling',
        run: (g) => {
          const f = nearest(g, 'fire', 1.8);
          if (f && f.fuel <= 0) tryLight(g, f);
        },
      });
    }
  }
  if (litFireNear(state, 1.8) && count(state.inventory, 'rawFish') > 0) {
    const allRotten = rottenCount(state, 'rawFish') === count(state.inventory, 'rawFish');
    out.push({
      id: 'cook', label: 'Cook fish', icon: '🍖', minutes: 8, energy: 0,
      blocked: allRotten ? 'fish has rotted' : undefined,
      run: (g) => {
        if (takeUnit(g, 'rawFish', 'oldestFresh') === null) return;
        addItem(g.inventory, 'cookedFish');
        say(g, 'The fish sizzles.');
      },
    });
  }
  if (litFireNear(state, 1.8)) {
    out.push({
      id: 'boil', label: 'Boil and drink', icon: '♨️', minutes: 12, energy: 0,
      run: (g) => {
        g.stats.thirst = Math.min(100, g.stats.thirst + 35);
        say(g, 'You boil water over the fire and drink it. It is safe.');
      },
    });
  }
  return out;
}

function eatActions(state: GameState): Action[] {
  const out: Action[] = [];
  for (const id of Object.keys(ITEMS) as ItemId[]) {
    const food = ITEMS[id].food;
    if (!food || count(state.inventory, id) === 0) continue;
    const rotten = rottenCount(state, id);
    const allRotten = rotten === count(state.inventory, id);
    out.push({
      id: `eat:${id}`, label: `Eat ${allRotten ? 'rotten ' : ''}${ITEMS[id].name.toLowerCase()}`, icon: ITEMS[id].icon, minutes: 2, energy: 0,
      run: (g) => {
        const wasRotten = takeUnit(g, id, 'freshest');
        if (wasRotten === null) return;
        g.stats.hunger = Math.min(100, g.stats.hunger + food.hunger);
        if (wasRotten) {
          g.sick = 360;
          say(g, `The ${ITEMS[id].name.toLowerCase()} is rotten. Your stomach turns. You feel sick.`);
        } else if (roll(g) < food.sickChance) {
          g.sick = 360;
          say(g, 'Your stomach turns. You feel sick.');
        } else say(g, `You eat the ${ITEMS[id].name.toLowerCase()}.`);
      },
    });
    if (rotten > 0) {
      out.push({
        id: `discard:${id}`, label: `Throw away rotten ${ITEMS[id].name.toLowerCase()}`, icon: '🗑️', minutes: 1, energy: 0,
        run: (g) => {
          if (takeUnit(g, id, 'rotten') !== null) say(g, `You throw away the rotten ${ITEMS[id].name.toLowerCase()}.`);
        },
      });
    }
  }
  return out;
}

export function canCraft(state: GameState, r: Recipe): boolean {
  if ('item' in r.makes && isTool(r.makes.item) && count(state.inventory, r.makes.item) > 0) return false;
  return Object.entries(r.cost).every(([id, n]) => count(state.inventory, id as ItemId) >= n);
}

function craftAction(r: Recipe): Action {
  return {
    id: `craft:${r.id}`, label: `Make ${r.name.toLowerCase()}`, icon: r.icon, minutes: r.minutes, energy: 3,
    run: (g) => {
      for (const [id, n] of Object.entries(r.cost)) removeItem(g.inventory, id as ItemId, n);
      if ('item' in r.makes) {
        addItem(g.inventory, r.makes.item);
        if (isTool(r.makes.item)) freshTool(g, r.makes.item);
      }
      else addStructure(g, r.makes.structure);
      train(g, 'crafting', 5);
      say(g, `You make a ${r.name.toLowerCase()}.`);
    },
  };
}

const bandageAction: Action = {
  id: 'bandage', label: 'Bandage wound', icon: '🩹', minutes: 3, energy: 0,
  run: bandageWound,
};

const sleepAction: Action = {
  id: 'sleep', label: 'Sleep', icon: '😴', minutes: 0, energy: 0,
  run: (g) => {
    g.sleeping = true;
    say(g, 'You lie down and close your eyes.');
  },
};

// Actions tied to where you stand and what you carry.
export function availableActions(state: GameState): Action[] {
  const acts = [...contextActions(state), ...fireActions(state), ...eatActions(state)];
  if (canBandage(state)) acts.push(bandageAction);
  if (state.stats.energy < 92) acts.push(sleepAction);
  return acts;
}

export function craftableActions(state: GameState): { recipe: Recipe; action: Action; enabled: boolean }[] {
  return RECIPES.map((recipe) => ({ recipe, action: craftAction(recipe), enabled: canCraft(state, recipe) }));
}

function findAction(state: GameState, id: string): Action | undefined {
  const craft = craftableActions(state).find((c) => c.action.id === id && c.enabled);
  return craft?.action ?? availableActions(state).find((a) => a.id === id);
}

export function startAction(state: GameState, id: string): boolean {
  if (state.busy || state.sleeping || state.dead) return false;
  const action = findAction(state, id);
  if (!action || action.blocked) return false;
  if (action.minutes <= 0) action.run(state);
  else state.busy = { id: action.id, label: action.label, total: action.minutes, remaining: action.minutes, energy: action.energy };
  return true;
}

export function finishBusy(state: GameState) {
  const busy = state.busy;
  if (!busy) return;
  state.busy = null;
  findAction(state, busy.id)?.run(state);
}
