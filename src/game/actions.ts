// Everything the player can do right now: gather, drink, fish, cook, eat, sleep and craft.
import { hypot } from '../math/exact';
import { waterNear } from '../world/query';
import type { Prop, PropKind } from '../world/types';
import { huntActions } from './hunting';
import { hasLightingKit, rainRefusal, tryLight } from './fire';
import { ITEMS, addItem, count, removeItem, type ItemId } from './items';
import { roll } from './random';
import { RECIPES, type Recipe } from './recipes';
import { gainXp, skillLevel, speedFactor, type SkillId } from './skills';
import { say, type GameState } from './state';
import { FIRE_MAX_FUEL, addStructure, litFireNear, nearest } from './structures';
import { MINUTES_PER_DAY } from './time';
import { rottenCount, takeUnit } from './spoilage';
import { canCarry } from './weight';
import { bandageWound, canBandage, maybeWound } from './wounds';
import { freshTool, isTool, wearTool } from './wear';
import { itemName, lower, recipeName, skillName, t } from '../text/text';

export interface Action {
  id: string;
  label: string;
  icon: string;
  minutes: number;
  energy: number;
  // Why the action cannot be used right now. The button shows this and does nothing.
  blocked?: string;
  // Clicking the action says this and does nothing: no time and no items are spent.
  refuse?: string;
  // Said when the action starts. The action still goes ahead.
  warn?: string;
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
  if (gainXp(state.skills, skill, xp)) say(state, t('skill.levelUp', { skill: skillName(skill), level: skillLevel(state.skills[skill]) }));
}

function gather(state: GameState, prop: Prop, item: ItemId, skill: SkillId, regrowDays: number, bonus: number) {
  const lucky = roll(state) < bonus + skillLevel(state.skills[skill]) * 0.05;
  if (!canCarry(state.inventory, item)) {
    say(state, t('pack.tooFull'));
    return;
  }
  const extra = lucky && canCarry(state.inventory, item, 2) ? 1 : 0;
  addItem(state.inventory, item, 1 + extra);
  deplete(state, prop, regrowDays);
  train(state, skill, 3);
  say(state, t('gather.got', { n: 1 + extra, item: lower(itemName(item)) }));
}

// Loose material that does not use up the bush or tree.
function gatherLoose(state: GameState, item: ItemId, text: string) {
  if (!canCarry(state.inventory, item)) {
    say(state, t('pack.tooFull'));
    return;
  }
  addItem(state.inventory, item);
  say(state, text);
}

const packFull = (state: GameState, item: ItemId) => (canCarry(state.inventory, item) ? undefined : t('blocked.packFull'));

function contextActions(state: GameState): Action[] {
  const out: Action[] = [];
  const s = state.skills;
  if (waterNear(state.world, state.player.x, state.player.y)) {
    out.push({
      id: 'drink', label: t('action.drink'), icon: '💧', minutes: 5, energy: 0,
      run: (g) => {
        g.stats.thirst = Math.min(100, g.stats.thirst + 35);
        if (roll(g) < DIRTY_WATER_SICK_CHANCE) {
          g.sick = 360;
          say(g, t('drink.foul'));
        } else say(g, t('drink.fine'));
      },
    });
    if (count(state.inventory, 'spear') > 0) {
      out.push({
        id: 'fish', label: t('action.fish'), icon: '🐟', minutes: Math.round(35 * speedFactor(s.fishing)), energy: 4,
        blocked: packFull(state, 'rawFish'),
        run: (g) => {
          train(g, 'fishing', 3);
          wearTool(g, 'spear');
          maybeWound(g);
          if (roll(g) < 0.35 + skillLevel(g.skills.fishing) * 0.05 && canCarry(g.inventory, 'rawFish')) {
            addItem(g.inventory, 'rawFish');
            say(g, t('fish.hit'));
          } else say(g, t('fish.miss'));
        },
      });
    }
  }
  const bush = nearProp(state, 'bush');
  if (bush) {
    out.push({
      id: 'forage', label: t('action.forage'), icon: '🫐', minutes: Math.round(10 * speedFactor(s.foraging)), energy: 1,
      blocked: packFull(state, 'berries'),
      run: (g) => nearProp(g, 'bush') && gather(g, nearProp(g, 'bush')!, 'berries', 'foraging', 1.5, 0.2),
    });
  }
  const tree = nearProp(state, 'tree');
  if (tree) {
    const axe = count(state.inventory, 'axe') > 0;
    out.push({
      id: 'chop', label: t(axe ? 'action.chop' : 'action.breakBranches'), icon: '🪵', minutes: Math.round((axe ? 14 : 36) * speedFactor(s.labor)), energy: axe ? 4 : 6,
      blocked: packFull(state, 'wood'),
      run: (g) => {
        const found = nearProp(g, 'tree');
        if (!found) return;
        gather(g, found, 'wood', 'labor', 4, axe ? 0.3 : 0);
        if (axe) wearTool(g, 'axe');
      },
    });
  }
  if (bush) {
    out.push({
      id: 'tinder', label: t('action.tinder'), icon: '🌾', minutes: 6, energy: 1,
      blocked: packFull(state, 'tinder'),
      run: (g) => gatherLoose(g, 'tinder', t('tinder.got')),
    });
  }
  if (bush) {
    out.push({
      id: 'fibre', label: t('action.fibre'), icon: '🌿', minutes: 8, energy: 1,
      blocked: packFull(state, 'fibre'),
      run: (g) => gatherLoose(g, 'fibre', t('fibre.got')),
    });
  }
  if (tree) {
    out.push({
      id: 'kindling', label: t('action.kindling'), icon: '🥢', minutes: 8, energy: 1,
      blocked: packFull(state, 'kindling'),
      run: (g) => gatherLoose(g, 'kindling', t('kindling.got')),
    });
  }
  const stone = nearProp(state, 'stone');
  if (stone) {
    out.push({
      id: 'mine', label: t('action.mine'), icon: '🪨', minutes: Math.round(22 * speedFactor(s.labor)), energy: 4,
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
        id: 'fuel', label: t('action.fuel'), icon: '🔥', minutes: 4, energy: 0,
        blocked: count(state.inventory, 'wood') > 0 ? undefined : t('blocked.needsWood'),
        run: (g) => {
          const f = nearest(g, 'fire', 1.8);
          if (!f || !removeItem(g.inventory, 'wood')) return;
          f.fuel = Math.min(FIRE_MAX_FUEL, f.fuel + 120);
          say(g, t('fire.fed'));
        },
      });
    } else {
      out.push({
        id: 'light', label: t('action.light'), icon: '🔥', minutes: 10, energy: 1,
        blocked: hasLightingKit(state) ? undefined : t('blocked.needsLightingKit'),
        refuse: rainRefusal(state, fire),
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
      id: 'cook', label: t('action.cook'), icon: '🍖', minutes: 8, energy: 0,
      blocked: allRotten ? t('blocked.fishRotted') : undefined,
      run: (g) => {
        if (takeUnit(g, 'rawFish', 'oldestFresh') === null) return;
        addItem(g.inventory, 'cookedFish');
        say(g, t('cook.fish'));
      },
    });
  }
  if (litFireNear(state, 1.8) && count(state.inventory, 'rawMeat') > 0) {
    const allRotten = rottenCount(state, 'rawMeat') === count(state.inventory, 'rawMeat');
    out.push({
      id: 'cookMeat', label: t('action.cookMeat'), icon: '🍗', minutes: 10, energy: 0,
      blocked: allRotten ? t('blocked.meatRotted') : undefined,
      run: (g) => {
        if (takeUnit(g, 'rawMeat', 'oldestFresh') === null) return;
        addItem(g.inventory, 'cookedMeat');
        say(g, t('cook.meat'));
      },
    });
  }
  if (litFireNear(state, 1.8)) {
    out.push({
      id: 'boil', label: t('action.boil'), icon: '♨️', minutes: 12, energy: 0,
      run: (g) => {
        g.stats.thirst = Math.min(100, g.stats.thirst + 35);
        say(g, t('boil.done'));
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
      id: `eat:${id}`, label: t(allRotten ? 'action.eatRotten' : 'action.eat', { item: lower(itemName(id)) }), icon: ITEMS[id].icon, minutes: 2, energy: 0,
      run: (g) => {
        const wasRotten = takeUnit(g, id, 'freshest');
        if (wasRotten === null) return;
        g.stats.hunger = Math.min(100, g.stats.hunger + food.hunger);
        if (wasRotten) {
          g.sick = 360;
          say(g, t('eat.rotten', { item: lower(itemName(id)) }));
        } else if (roll(g) < food.sickChance) {
          g.sick = 360;
          say(g, t('eat.sick'));
        } else say(g, t('eat.ok', { item: lower(itemName(id)) }));
      },
    });
    if (rotten > 0) {
      out.push({
        id: `discard:${id}`, label: t('action.discard', { item: lower(itemName(id)) }), icon: '🗑️', minutes: 1, energy: 0,
        run: (g) => {
          if (takeUnit(g, id, 'rotten') !== null) say(g, t('discard.done', { item: lower(itemName(id)) }));
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

// Why a recipe cannot be made right now, in a few words. Undefined when you can make it.
export function craftBlock(state: GameState, r: Recipe): string | undefined {
  if ('item' in r.makes && isTool(r.makes.item) && count(state.inventory, r.makes.item) > 0) return t('craft.haveOne');
  const missing = Object.entries(r.cost)
    .map(([id, n]) => ({ id: id as ItemId, short: n - count(state.inventory, id as ItemId) }))
    .filter((m) => m.short > 0)
    .map((m) => t('craft.missing', { n: m.short, item: lower(itemName(m.id)) }));
  return missing.length > 0 ? t('craft.needs', { list: missing.join(', ') }) : undefined;
}

// A stone head eats stones that you still need for a campfire, while you have no fire yet.
export function stoneWarning(state: GameState, r: Recipe): string | undefined {
  const campfire = RECIPES.find((c) => c.id === 'campfire');
  const stone = r.cost.stone ?? 0;
  if (!campfire || stone === 0 || r.id === campfire.id) return undefined;
  if (state.structures.some((s) => s.kind === 'fire')) return undefined;
  const need = campfire.cost.stone ?? 0;
  const left = count(state.inventory, 'stone') - stone;
  return left < need ? t('craft.stoneWarning', { need, left: Math.max(0, left) }) : undefined;
}

function craftAction(r: Recipe, state: GameState): Action {
  return {
    warn: stoneWarning(state, r),
    id: `craft:${r.id}`, label: t('action.craft', { recipe: lower(recipeName(r.id)) }), icon: r.icon, minutes: r.minutes, energy: 3,
    run: (g) => {
      for (const [id, n] of Object.entries(r.cost)) removeItem(g.inventory, id as ItemId, n);
      if ('item' in r.makes) {
        addItem(g.inventory, r.makes.item);
        if (isTool(r.makes.item)) freshTool(g, r.makes.item);
      }
      else addStructure(g, r.makes.structure);
      train(g, 'crafting', 5);
      say(g, t('craft.done', { recipe: lower(recipeName(r.id)) }));
    },
  };
}

const bandageAction = (): Action => ({
  id: 'bandage', label: t('action.bandage'), icon: '🩹', minutes: 3, energy: 0,
  run: bandageWound,
});

const sleepAction = (): Action => ({
  id: 'sleep', label: t('action.sleep'), icon: '😴', minutes: 0, energy: 0,
  run: (g) => {
    g.sleeping = true;
    say(g, t('sleep.start'));
  },
});

// Actions tied to where you stand and what you carry.
export function availableActions(state: GameState): Action[] {
  const acts = [...contextActions(state), ...huntActions(state), ...fireActions(state), ...eatActions(state)];
  if (canBandage(state)) acts.push(bandageAction());
  if (state.stats.energy < 92) acts.push(sleepAction());
  return acts;
}

export function craftableActions(state: GameState): { recipe: Recipe; action: Action; enabled: boolean; blocked?: string }[] {
  return RECIPES.map((recipe) => ({ recipe, action: craftAction(recipe, state), enabled: canCraft(state, recipe), blocked: craftBlock(state, recipe) }));
}

function findAction(state: GameState, id: string): Action | undefined {
  const craft = craftableActions(state).find((c) => c.action.id === id && c.enabled);
  return craft?.action ?? availableActions(state).find((a) => a.id === id);
}

// True when the action exists and says why it will not start, so the caller need not add a message.
export const isRefused = (state: GameState, id: string) => !!findAction(state, id)?.refuse;

export function startAction(state: GameState, id: string): boolean {
  if (state.busy || state.sleeping || state.dead) return false;
  const action = findAction(state, id);
  if (!action || action.blocked) return false;
  if (action.refuse) {
    say(state, action.refuse);
    return false;
  }
  if (action.warn) say(state, action.warn);
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
