// The commands a playtester can call on window.playtest. They read and drive the game like a player would.
import { hypot } from '../math/exact';
import { newDriver, tick, type Driver } from '../game/drive';
import type { HoverTarget } from '../game/hover';
import { menuFor } from '../game/interact';
import type { GameState } from '../game/state';
import { clockText, dayNumber, MINUTES_PER_DAY } from '../game/time';
import { isWater } from '../world/query';

export const MAX_ADVANCE = 120;
const SLICE = 0.25;

export interface Host {
  state(): GameState;
  driver(): Driver;
  setPaused(paused: boolean): void;
  restart(seed: number): void;
}

const round = (n: number) => Math.round(n * 10) / 10;

export function summary(g: GameState, d: Driver) {
  const s = g.stats;
  return {
    time: g.time, day: dayNumber(g.time), clock: clockText(g.time), dead: g.dead,
    pos: { x: round(g.player.x), y: round(g.player.y) },
    stats: { health: round(s.health), hunger: round(s.hunger), thirst: round(s.thirst), energy: round(s.energy), warmth: round(s.warmth) },
    pack: g.inventory, busy: g.busy && { label: g.busy.label, minutesLeft: round(g.busy.remaining) },
    sleeping: g.sleeping, raining: g.weather.raining, wet: round(g.wet), sick: round(g.sick), wound: g.wound,
    order: d.errand ? { ...d.errand } : d.target ? { walkTo: d.target } : null, log: g.log.slice(-8),
  };
}

// What is around the survivor, nearest first. Targets can go straight to menu() and act().
export function look(g: GameState, radius = 8) {
  const { x, y } = g.player;
  const near = <T extends { x: number; y: number }>(list: T[]) =>
    list.map((o) => ({ ...o, dist: round(hypot(o.x - x, o.y - y)) })).filter((o) => o.dist <= radius).sort((a, b) => a.dist - b.dist);
  const water: { x: number; y: number }[] = [];
  const r = Math.ceil(radius);
  for (let ty = Math.floor(y) - r; ty <= Math.floor(y) + r; ty++)
    for (let tx = Math.floor(x) - r; tx <= Math.floor(x) + r; tx++) if (isWater(g.world, tx + 0.5, ty + 0.5)) water.push({ x: tx, y: ty });
  return {
    props: near(g.props.filter((p) => p.amount > 0).map((p) => ({ target: { kind: 'prop', id: p.id }, kind: p.kind, x: p.x, y: p.y, amount: p.amount }))),
    animals: near(g.animals.map((a) => ({ target: { kind: 'animal', id: a.id }, kind: a.kind, x: a.x, y: a.y }))),
    structures: near(g.structures.map((s) => ({ target: { kind: 'structure', id: s.id }, kind: s.kind, x: s.x, y: s.y, fuel: s.fuel }))),
    water: near(water.map((w) => ({ target: { kind: 'water', ...w }, x: w.x + 0.5, y: w.y + 0.5 }))).slice(0, 5),
  };
}

export function order(g: GameState, d: Driver, target: HoverTarget, action: string) {
  const entry = menuFor(g, target).find((e) => e.id === action);
  if (!entry) return { ok: false, why: 'That object does not offer this action.' };
  if (entry.blocked) return { ok: false, why: entry.blocked };
  d.errand = { target, action };
  d.target = null;
  return { ok: true };
}

// Moves the game on by game minutes, as the real loop would, and stops early on death.
export function advanceBy(g: GameState, d: Driver, minutes: number) {
  const end = g.time + Math.min(minutes, MAX_ADVANCE);
  while (g.time < end && !g.dead) tick(g, d, SLICE);
}

export function createPlaytest(host: Host) {
  const g = () => host.state();
  return {
    help: () => [
      'state(): where you are, your needs, pack, busy action, weather and the last messages',
      'look(radius = 8): props, animals, fires and water near you, nearest first, each with a target',
      'menu(target): what clicking that object offers. target is {kind:"player"} or a target from look()',
      'act(target, actionId): choose an action from the menu, as a click does. The survivor walks there first',
      'walk(x, y): walk to a point',
      'advance(gameMinutes): move time on. At most ' + MAX_ADVANCE + ' per call. A day is ' + MINUTES_PER_DAY + ' minutes',
      "speed('pause' | 'play'): pause so time moves only when you advance it",
      'newGame(seed): start a fresh island',
    ],
    state: () => summary(g(), host.driver()),
    look: (radius?: number) => look(g(), radius),
    menu: (target: HoverTarget) => menuFor(g(), target),
    act: (target: HoverTarget, action: string) => order(g(), host.driver(), target, action),
    walk: (x: number, y: number) => {
      host.driver().errand = null;
      host.driver().target = { x, y };
    },
    advance: (minutes: number) => (advanceBy(g(), host.driver(), minutes), summary(g(), host.driver())),
    speed: (mode: 'pause' | 'play') => host.setPaused(mode === 'pause'),
    newGame: (seed: number) => (host.restart(seed), newDriver()),
  };
}
